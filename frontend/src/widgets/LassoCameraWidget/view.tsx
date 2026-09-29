import type { ResourcesForContract } from "@/widgets/framework";
import { DrawableCamera } from "@/components/ui/DrawableCamera/DrawableCamera";
import { useRoiStore } from "@/stores/roiStore";
import { Button, Group, Select, Slider, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { LassoCameraWidgetContract } from "./contract";

const listOfRois = [
  { id: "Consumer_dropoffimager", name: "Dropoff Imager" },
  { id: "Consumer_lassorecorder", name: "Lasso Recorder" },
];

export type LassoCameraWidgetProps = ResourcesForContract<
  typeof LassoCameraWidgetContract
> & {
  instanceId: string;
};

export const LassoCameraWidgetView = ({
  cameraLasso,
  startLivestream,
  stopLivestream,
  setAutoWb,
  getExposure,
  getGain,
  setExposure,
  setGain,
}: LassoCameraWidgetProps) => {
  // Local state
  // -------------------------------
  const [exposureOverride, setExposureOverride] = useState<number | null>(null);
  const [gainOverride, setGainOverride] = useState<number | null>(null);
  const [roiId, setRoiId] = useState<string>(listOfRois[0].id);

  // Store state
  // -------------------------------
  const { rois, selectedRoi, addRoi, updateRoi, setSelectedRoi } =
    useRoiStore();

  // Derived values
  // -------------------------------
  // Backend schemas are untyped, so narrow here.
  const exposureValue =
    exposureOverride ??
    (typeof getExposure.data === "number" ? getExposure.data : 0);
  const gainValue =
    gainOverride ?? (typeof getGain.data === "number" ? getGain.data : 0);

  // Effects
  // -------------------------------
  useEffect(() => {
    // Initialize ROIs if none exist
    if (rois.length > 0) return;
    for (const r of listOfRois) {
      addRoi({ id: r.id, name: r.name, colorIndex: 0, positions: null });
    }
    setSelectedRoi(roiId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Handlers
  // -------------------------------
  function handleExposureChange(value: number) {
    setExposureOverride(value);
    setExposure.call({ value });
  }

  function handleGainChange(value: number) {
    setGainOverride(value);
    setGain.call({ value });
  }

  function handleROI(value: string) {
    setRoiId(value);
    setSelectedRoi(value);
  }

  function handleToggleColor() {
    const currentColorIndex = rois.find((r) => r.id === roiId)?.colorIndex || 0;
    updateRoi(roiId, { colorIndex: currentColorIndex + 1 });
  }

  return (
    <Stack gap="xs">
      {/* Camera */}
      <Stack gap="xs">
        <DrawableCamera
          video={
            <video
              ref={cameraLasso.ref}
              muted
              autoPlay
              playsInline
              className="border"
              style={{
                display: "block",
                width: "100%",
                maxHeight: "35vh",
                objectFit: "contain",
                aspectRatio: "3 / 2",
              }}
            />
          }
          selectedRoi={selectedRoi}
          onRoiStateChange={(id, newRoi) => updateRoi(id, newRoi)}
          rois={rois}
        />
        <Group justify="space-between" gap="xs">
          <Group gap="xs">
            <Button size="compact-xs" onClick={() => startLivestream.call({})}>
              Start Camera
            </Button>
            <Button size="compact-xs" onClick={() => stopLivestream.call({})}>
              Stop Camera
            </Button>
          </Group>
          <Button
            size="compact-xs"
            onClick={() =>
              setAutoWb.call({ key: "enable_auto_white_balance", value: 1 })
            }
          >
            Enable Auto White Balance
          </Button>
        </Group>
      </Stack>

      {/* Sliders for exposure and gain */}
      <Stack gap="xl">
        <Group gap="l">
          <Text size="xs" className="min-w-40 text-right">
            Exposure Time (μs)
          </Text>
          <Slider
            size="xs"
            mb="sm"
            value={exposureValue}
            min={10}
            max={1000000}
            marks={[
              { value: 10, label: "10" },
              { value: 500000, label: "500k" },
              { value: 1000000, label: "1M" },
            ]}
            className="flex-1"
            onChange={handleExposureChange}
          />
        </Group>
        <Group gap="xl">
          <Text size="xs" className="min-w-40 text-right">
            Gain
          </Text>
          <Slider
            size="xs"
            mb="sm"
            value={gainValue}
            min={0}
            max={24}
            marks={[
              { value: 0, label: "0" },
              { value: 24, label: "24" },
            ]}
            className="flex-1"
            onChange={handleGainChange}
          />
        </Group>
      </Stack>

      <Group gap="xs" pt="5" grow>
        <Group gap="xs">
          <Text size="xs">Select ROI:</Text>
          <Select
            size="xs"
            value={roiId}
            data={listOfRois.map((roi) => ({ value: roi.id, label: roi.name }))}
            onChange={(value) => {
              if (value !== null) handleROI(value);
            }}
            clearable={false}
            allowDeselect={false}
          />
          <Button size="compact-xs" onClick={handleToggleColor}>
            Toggle Color
          </Button>
        </Group>
      </Group>
    </Stack>
  );
};
