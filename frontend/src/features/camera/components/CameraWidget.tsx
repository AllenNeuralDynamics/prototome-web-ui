import { useState, useRef, useEffect } from "react";
import { Button, Group, Card, Box, Divider } from "@mantine/core";
import type { CameraWidgetProps } from "../types/cameraTypes.tsx";
import { useVideoStreamStore } from "@/stores/dataChannelStore.tsx";
import { ControlRow } from "../components/ControlRow.tsx";
import { useRPCData, useRPCAction } from "@/lib/one-liner-router/call-rpc.ts";

export const CameraWidget = ({ cameraId }: CameraWidgetProps) => {
  // Local state
  // -------------------------------
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [exposureOverride, setExposureOverride] = useState<number | null>(null);
  const [gainOverride, setGainOverride] = useState<number | null>(null);
  const [exposureStepOverride, setExposureStepOverride] = useState<
    number | null
  >(null);
  const [gainStepOverride, setGainStepOverride] = useState<number | null>(null);

  // Store state
  // -------------------------------
  const videoStream = useVideoStreamStore(
    (state) => state.streams["new_frame"],
  );

  // Hook - RPC Data
  // -------------------------------
  const { result: camExposure } = useRPCData<number>(
    "window2_web_camera_get_exposure",
    {},
  );
  const { result: camExposureMax } = useRPCData<number>(
    "window2_web_camera_get_exposure_max",
    {},
  );
  const { result: camExposureMin } = useRPCData<number>(
    "window2_web_camera_get_exposure_min",
    {},
  );
  const { result: camExposureStep } = useRPCData<number>(
    "window2_web_camera_get_exposure_step",
    {},
  );
  const { result: camGain } = useRPCData<number>(
    "window2_web_camera_get_gain",
    {},
  );
  const { result: camGainMax } = useRPCData<number>(
    "window2_web_camera_get_gain_max",
    {},
  );
  const { result: camGainMin } = useRPCData<number>(
    "window2_web_camera_get_gain_min",
    {},
  );
  const { result: camGainStep } = useRPCData<number>(
    "window2_web_camera_get_gain_step",
    {},
  );

  // Hook - RPC Action
  // -------------------------------
  const startLivestream = useRPCAction<void, { key: string }>(
    "window2_web_camera_start_livestream",
  );
  const stopLivestream = useRPCAction<void, { key: string }>(
    "window2_web_camera_stop_livestream",
  );
  const setCameraExposure = useRPCAction<void, { key: string; value: number }>(
    "window2_web_camera_set_exposure",
  );
  const setCameraGain = useRPCAction<void, { key: string; value: number }>(
    "window2_web_camera_set_gain",
  );

  // Derived values
  // -------------------------------
  const exposure = exposureOverride ?? camExposure ?? 0;
  const gain = gainOverride ?? camGain ?? 0;
  const exposureSpecs = {
    min: camExposureMin ?? 0,
    max: camExposureMax ?? 0,
    step: exposureStepOverride ?? camExposureStep ?? 0,
  };
  const gainSpecs = {
    min: camGainMin ?? 0,
    max: camGainMax ?? 0,
    step: gainStepOverride ?? camGainStep ?? 0,
  };

  // Effects
  // -------------------------------
  useEffect(() => {
    if (!videoRef.current || !videoStream) return;
    videoRef.current.srcObject = videoStream;
  }, [videoStream]);

  // Handlers
  // -------------------------------
  const onExposureChange = (val: number) => {
    setExposureOverride(val);
    setCameraExposure.call({ key: cameraId, value: val });
  };
  const onGainChange = (val: number) => {
    setGainOverride(val);
    setCameraGain.call({ key: cameraId, value: val });
  };

  return (
    <div>
      <Card
        key={cameraId}
        shadow="xs"
        padding="md"
        radius="md"
        withBorder
        className="bg-gray-50"
      >
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
          <Button
            size="xs"
            variant="light"
            onClick={() => startLivestream.call({ key: cameraId })}
          >
            Start
          </Button>
          <Button
            size="xs"
            onClick={() => stopLivestream.call({ key: cameraId })}
          >
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
          onStepChange={setExposureStepOverride}
        />

        {/* Gain */}
        <Box mt="sm">
          <ControlRow
            label="Gain"
            value={gain}
            displayValue={gain.toFixed(2)}
            specs={gainSpecs}
            onSliderChange={onGainChange}
            onStepChange={setGainStepOverride}
          />
        </Box>
      </Card>
    </div>
  );
};
