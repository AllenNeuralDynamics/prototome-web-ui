import { useState, useRef, useEffect } from "react";
import {
  Button,
  Group,
  Card,
  Box,
  Divider
} from "@mantine/core";
import type { CameraWidgetProps } from "../types/cameraTypes.tsx";
import { useVideoStreamStore } from "@/stores/dataChannelStore.tsx";
import { cameraApi } from "../api/cameraApi.tsx";
import { ControlRow } from "../components/ControlRow.tsx"

export const CameraWidget = ({ cameraId }: CameraWidgetProps) => {
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
      setExposureSpecs({ "min": min ?? 0, "max": max ?? 0, "step": step ?? 0});

      const exp = await cameraApi.getExposure(cameraId);
      setExposure(exp);
    }
    async function fetchGainSpecs() {
      const [min, max, step] = await Promise.all([
        cameraApi.getMinGain(cameraId),
        cameraApi.getMaxGain(cameraId),
        cameraApi.getStepGain(cameraId),
      ]);
      setGainSpecs({ "min": min ?? 0, "max": max ?? 0, "step": step ?? 0});

      const gain = await cameraApi.getGain(cameraId);
      setGain(gain);
    }
    fetchExposureSpecs();
    fetchGainSpecs();
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
    <Card key={cameraId} shadow="xs" padding="md" radius="md" withBorder className="bg-gray-50">
      <Card.Section>
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          width={768}
          height={576}
          style={{ border: "1px solid black" }}
        />
      </Card.Section>

      {/* Stream controls */}
      <Group mt="sm" mb="xs" gap="xs">
        <Button size="xs" variant="light" onClick={() => cameraApi.startLivestream(cameraId)}>
          Start
        </Button>
        <Button size="xs" onClick={() => cameraApi.stopLivestream(cameraId)}>
          Stop
        </Button>
      </Group>

      <Divider mb="sm" />

      {/* Exposure */}
      <ControlRow
        label="Exposure"
        value={exposure}
        displayValue={String(exposure)}
        specs={exposureSpecs}
        onSliderChange={onExposureChange}
        onStepChange={(val) => setExposureSpecs((prev) => ({ ...prev, step: val }))}
      />

      {/* Gain */}
      <Box mt="sm">
        <ControlRow
          label="Gain"
          value={gain}
          displayValue={gain.toFixed(2)}
          specs={gainSpecs}
          onSliderChange={onGainChange}
          onStepChange={(val) => setGainSpecs((prev) => ({ ...prev, step: val }))}
          stepDisplayValue={gainSpecs.step.toFixed(5)}
        />
      </Box>
    </Card>
  </div>
);
}