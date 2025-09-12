import React, { useState, useRef, useEffect } from "react";
import { Slider, Text, Button, Group, Card } from "@mantine/core";
import "@mantine/core/styles.css";
import { CameraWidgetProps } from "../types/cameraTypes.tsx";
import { negotiate } from "../../../utils/webRtcConnection.tsx";

export default function CameraWidget({
  cameraId,
  host,
  exposureSpecs,
  gainSpecs,
}: CameraWidgetProps) {
  const [exposure, setExposure] = useState(-9);
  const [gain, setGain] = useState(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [livestreamChannel, setLivestreamChannel] = useState<RTCDataChannel>()

  useEffect(() => {
    const pc = new RTCPeerConnection();
    pcRef.current = pc;
    
    // add MediaTrackStreams
    pcRef.current.addTransceiver('video', {direction: 'recvonly'})

    // add any dataChannels
    setLivestreamChannel(pcRef.current.createDataChannel("livestream"));
    
    // negotiate sbd and ice with peer connection
    negotiate(pc)

    return () => {
      pc.close();
    };
  }, []); // run once

  const startCamera = async () => {
    if (pcRef.current) {
    pcRef.current.addEventListener('track', (evt) => {
      if (evt.track.kind === 'video' && videoRef.current) {
        videoRef.current.srcObject = evt.streams[0];
      }
    });
    // re negotiate since track has been added 
    negotiate(pcRef.current)

    // send message to start livestream
    if (livestreamChannel){
    livestreamChannel.send(JSON.stringify({"destination": "livestream", "camera_id": cameraId, "start": true}))
    }
}
  };

  const stopCamera = () => {
    // disconnect video
    // if (videoRef.current && videoRef.current.srcObject) {
    //   const stream = videoRef.current.srcObject as MediaStream;
    //   // stop all tracks (video/audio)
    //   stream.getTracks().forEach((track) => track.stop());
    //   // disconnect from video element
    //   videoRef.current.srcObject = null;
    // }

    console.log("button click")
    if (livestreamChannel){
    livestreamChannel.send(JSON.stringify({"destination": "livestream", "camera_id": cameraId, "start": false}))
    }
  };

  const onExposureChange = (val: number) => {
    setExposure(val);
    postExposure(host, cameraId, val);
  };

  const onGainChange = (val: number) => {
    setGain(val);
    postGain(host, cameraId, val);
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
