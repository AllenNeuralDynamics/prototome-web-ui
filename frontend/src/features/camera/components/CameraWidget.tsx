import React, { useState, useRef } from "react";
import { Slider, Text, Button, Group, Card } from "@mantine/core";
import "@mantine/core/styles.css";
import { getFrame, postExposure, postGain } from "../api/cameraApi.tsx";
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

  const startCamera = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(async () => {
      try {
        const url = await getFrame(host, cameraId);
        setFrameUrl(url);
      } catch (error) {
        console.error("Error fetching frame:", error);
      }
    }, 500);
  };

  const stopCamera = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
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
    <div >
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
          width={640}
          height={480}
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
