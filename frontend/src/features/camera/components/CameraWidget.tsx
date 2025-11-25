import React, { useState, useRef, useEffect } from "react";
import { Slider, Text, Button, Group, Card } from "@mantine/core";
import "@mantine/core/styles.css";
import { CameraWidgetProps } from "../types/cameraTypes.tsx";
import { useVideoStreamStore } from "../../../stores/dataChannelStore.tsx";
import { cameraApi } from "../api/cameraApi.tsx";

export default function CameraWidget({ cameraId }: CameraWidgetProps) {
  const [exposure, setExposure] = useState(1);
  const [exposureSpecs, setExposureSpecs] = useState({
    min: 0,
    max: 0,
    step: 0,
  });
  const [gainSpecs, setGainSpecs] = useState({
    min: 0,
    max: 0,
    step: 0,
  });
  const [gain, setGain] = useState(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoStream = useVideoStreamStore(
    (state) => state.streams["new_frame"],
  );

  // set up livestream
  useEffect(() => {
    if (!videoRef.current || !videoStream) return;
    videoRef.current.srcObject = videoStream;
  }, [videoStream]);

  // populate exposure and gain limits
  useEffect(() => {
    async function fetchExposureSpecs() {
      const [min, max, step] = await Promise.all([
        cameraApi.getMinExposure(cameraId),
        cameraApi.getMaxExposure(cameraId),
        cameraApi.getStepExposure(cameraId),
      ]);
      console.log(min, max, step)
      setExposureSpecs({ min, max, step });
    }
    async function fetchGainSpecs() {
      const [min, max, step] = await Promise.all([
        cameraApi.getMinGain(cameraId),
        cameraApi.getMaxGain(cameraId),
        cameraApi.getStepGain(cameraId),
      ]);
      console.log(min, max, step)
      setGainSpecs({ min, max, step });
    }
    fetchExposureSpecs()
    fetchGainSpecs()
  }, []);

  const onExposureChange = (val: number) => {
    setExposure(val);
    cameraApi.postExposure(cameraId, val);
  };

  const onGainChange = (val: number) => {
    setGain(val);
    cameraApi.postGain(cameraId, val);
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
          <Button
            variant="light"
            onClick={() => cameraApi.startLivestream(cameraId)}
          >
            Start
          </Button>
          <Button onClick={() => cameraApi.stopLivestream(cameraId)}>
            Stop
          </Button>
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
              min={exposureSpecs.min}
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
