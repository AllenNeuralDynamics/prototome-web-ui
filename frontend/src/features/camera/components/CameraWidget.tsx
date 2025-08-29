import React, { useState, useRef, useEffect } from "react";
import { Slider, Text, Button, Group, Card } from "@mantine/core";
import "@mantine/core/styles.css";
import { start, stop, postExposure, postGain } from "../api/cameraApi.tsx";
import { CameraWidgetProps } from "../types/cameraTypes.tsx";




export default function CameraWidget({
  cameraId,
  host,
  exposureSpecs,
  gainSpecs,
}: CameraWidgetProps) {
  const [exposure, setExposure] = useState(-9);
  const [gain, setGain] = useState(1);
  const [frameUrl, setFrameUrl] = useState("");
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let socket;
    const connectFrameSocket = () => {
      socket = new WebSocket("ws://localhost:8000/ws/camera_frame");
    
      socket.onopen = () => {
        console.log("Camera WebSocket connected");
      };
    
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.cameraId == cameraId){
        setFrameUrl(msg.url);
        }
      };
    
      socket.onclose = () => {
        console.log("Camera WebSocket closed, reconnecting...");
        setTimeout(() => connectFrameSocket(), 2000); // auto-reconnect
      };
    };
    connectFrameSocket()

    return() => socket.close();
  }, [cameraId])

  const startCamera = () => {
    start(host, cameraId)
  };

  const stopCamera = () => {
    stop(host, cameraId)
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
        <img
          src={frameUrl}
          alt="Camera frame"
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
