import React, { useState, useRef, useEffect } from "react";
import { Slider, Text, Button, Group, Card } from "@mantine/core";
import "@mantine/core/styles.css";
import { CameraWidgetProps } from "../types/cameraTypes.tsx";
import { useDataChannelStore,  useVideoStreamStore} from "../../../stores/dataChannelStore.tsx";

export default function CameraWidget({
  cameraId,
  host,
  exposureSpecs,
  gainSpecs,
}: CameraWidgetProps) {
  const [exposure, setExposure] = useState(-9);
  const [gain, setGain] = useState(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dataChannels = useDataChannelStore((state) => state.channels)
  const videoStream = useVideoStreamStore(state => state.streams["new_frame"]);
  const startLivestreamChannelRef = useRef<RTCDataChannel | null>(null);
  const stopLivestreamChannelRef = useRef<RTCDataChannel | null>(null);
  const exposureChannelRef = useRef<RTCDataChannel | null>(null);
  const gainChannelRef = useRef<RTCDataChannel | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

const handleFrame = (now: number, metadata: VideoFrameCallbackMetadata) => {
  if (lastFrameTimeRef.current != null) {
    const deltaMs = now - lastFrameTimeRef.current;
    console.log(`Time between frames: ${deltaMs.toFixed(2)} ms`);
  }
  lastFrameTimeRef.current = now;

  // Schedule next frame callback
  videoRef.current?.requestVideoFrameCallback(handleFrame);
};

  // set up livestream
  useEffect (() => {
    if (!videoRef.current || !videoStream) return;
    videoRef.current.srcObject = videoStream;
  }, [videoStream]);

  // set up dataChannels 
  useEffect(() => {
    const startLivestreamChannel = dataChannels["prototome_start_camera"];
    startLivestreamChannelRef.current = startLivestreamChannel;

    const stopLivestreamChannel = dataChannels["prototome_stop_camera"];
    stopLivestreamChannelRef.current = stopLivestreamChannel;


    const exposureChannel = dataChannels["prototome_exposure"];
    exposureChannelRef.current = exposureChannel;

    const gainChannel = dataChannels["prototome_gain"];
    gainChannelRef.current = gainChannel;

    return () => {
      startLivestreamChannel.close();
      stopLivestreamChannel.close();
      exposureChannel.close();
      gainChannel.close();
    };
  }, [dataChannels]);

  const startCamera = async () => {
      // send message to start livestream
      if (startLivestreamChannelRef.current) {
        startLivestreamChannelRef.current.send(
          JSON.stringify({
            instance_name: "window1_ximea_camera", 
            callable_name: "start_imaging"
          }),
        );
     }
   };

  const stopCamera = () => {
    if (stopLivestreamChannelRef.current) {
      stopLivestreamChannelRef.current.send(
        JSON.stringify({
            instance_name: "window1_ximea_camera", 
            callable_name: "stop_imaging"
          }),
      );
    }
  };

  const onExposureChange = (val: number) => {
    setExposure(val);
    if (exposureChannelRef.current) {
      exposureChannelRef.current.send(
        JSON.stringify({
          destination: "exposure",
          camera_id: cameraId,
          value: val,
        }),
      );
    }
  };

  const onGainChange = (val: number) => {
    setGain(val);
    if (gainChannelRef.current) {
      gainChannelRef.current.send(
        JSON.stringify({
          destination: "gain",
          camera_id: cameraId,
          value: val,
        }),
      );
    }
  };

  return (
    <div>
      <Card
        key={cameraId}
        shadow="xs"
        padding="xs"
        radius="md"
        withBorder
        className="bg-gray-50"
      >
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          width={768}
          height={576}
          style={{ border: "1px solid black" }}
        />
        <Group align="center" mb="xs">
          <Button variant="light" onClick={startCamera}>
            Start
          </Button>
          <Button onClick={stopCamera}>Stop</Button>
        </Group>
        <Group mb="xs" style={{ alignItems: "center", gap: "0.5rem" }}>
          <Text size="sm">Exposure: </Text>
          <Text size="sm" c="dimmed">
            {exposure}
          </Text>
          <div style={{ width: 560, padding: "0" }}>
            <Slider
              value={exposure}
              onChange={onExposureChange}
              min={exposureSpecs["min"]}
              max={exposureSpecs.max}
              step={exposureSpecs.step}
            />
          </div>
        </Group>
        <Group mb="xs" style={{ alignItems: "center", gap: "0.5rem" }}>
          <Text size="sm">Gain: </Text>
          <Text size="sm" c="dimmed">
            {gain}
          </Text>
          <div style={{ width: 595, padding: "0" }}>
            <Slider
              value={gain}
              onChange={onGainChange}
              min={gainSpecs.min}
              max={gainSpecs.max}
              step={gainSpecs.step}
            />
          </div>
        </Group>
      </Card>
    </div>
  );
}
