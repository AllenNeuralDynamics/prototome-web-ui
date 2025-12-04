import React, { useState, useRef, useEffect } from "react";
import { Slider, Text, Button, Group, Card } from "@mantine/core";
import type { CameraWidgetProps } from "../types/cameraTypes.tsx";
import { useDataChannelStore,  useVideoStreamStore} from "@/stores/dataChannelStore.tsx";

export const CameraWidget = ({
  cameraId,
  host,
  exposureSpecs,
  gainSpecs,
}: CameraWidgetProps) => {
  const [exposure, setExposure] = useState(1);
  const [gain, setGain] = useState(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dataChannels = useDataChannelStore((state) => state.channels)
  const videoStream = useVideoStreamStore(state => state.streams["new_frame"]);
  const startLivestreamChannelRef = useRef<RTCDataChannel | null>(null);
  const stopLivestreamChannelRef = useRef<RTCDataChannel | null>(null);
  const exposureChannelRef = useRef<RTCDataChannel | null>(null);
  const gainChannelRef = useRef<RTCDataChannel | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

  // set up livestream
  useEffect (() => {
    if (!videoRef.current || !videoStream) return;
    videoRef.current.srcObject = videoStream;

  //   let lastFrameTime: number | null = null;

  //   const handleFrame = (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => {
  //   if (lastFrameTime !== null) {
  //     const delta = now - lastFrameTime; // milliseconds
  //     console.log(`Time since last frame: ${delta.toFixed(2)} ms`, metadata);
  //   }
  //   lastFrameTime = now;

  //   // Schedule next frame callback
  //   videoRef.current?.requestVideoFrameCallback(handleFrame);
  // };
  // videoRef.current.requestVideoFrameCallback(handleFrame);
  }, [videoStream]);

  // set up dataChannels 
  useEffect(() => {
    const startLivestreamChannel = dataChannels["prototome_start_camera"];
    startLivestreamChannelRef.current = startLivestreamChannel;

    const stopLivestreamChannel = dataChannels["prototome_stop_camera"];
    stopLivestreamChannelRef.current = stopLivestreamChannel;


    const exposureChannel = dataChannels["prototome_exposure"];
    // update exposure upon message
    const handleExposeMessage = (evt: MessageEvent) => {
      const exposure = JSON.parse(evt.data);
      setExposure(exposure);
    };
    exposureChannel.addEventListener('message', handleExposeMessage)
    exposureChannelRef.current = exposureChannel;

    const gainChannel = dataChannels["prototome_gain"];
    // update gain upon message
    const handleGainMessage = (evt: MessageEvent) => {
      const gain = JSON.parse(evt.data);
      setGain(gain);
    };
    gainChannel.addEventListener('message', handleGainMessage)
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
            obj_name: "window1_ximea_camera",
            attr_name: "start_imaging"
          }),
        );
     }
   };

  const stopCamera = () => {
    if (stopLivestreamChannelRef.current) {
      stopLivestreamChannelRef.current.send(
        JSON.stringify({
            obj_name: "window1_ximea_camera",
            attr_name: "stop_imaging"
          }),
      );
    }
  };

  const onExposureChange = (val: number) => {
    setExposure(val);
    if (exposureChannelRef.current) {
      exposureChannelRef.current.send(
        JSON.stringify({
            obj_name: "window1_ximea_camera", 
            attr_name: "set",
            key: "exposure",
            value: val
        }),
      );
    }
  };

  const onGainChange = (val: number) => {
    setGain(val);
    if (gainChannelRef.current) {
      gainChannelRef.current.send(
        JSON.stringify({
            obj_name: "window1_ximea_camera",
            attr_name: "set",
            key: "gain",
            value: val
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
