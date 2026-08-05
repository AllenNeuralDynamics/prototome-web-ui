import { useVideoStreamStore } from "@/stores/dataChannelStore";
import { Button, Group, Select, Slider, Stack, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { DrawableCamera } from "@/components/ui/DrawableCamera/DrawableCamera";
import { useRoiStore } from "@/stores/roiStore";
import { useRPCAction, useRPCData } from "@/lib/one-liner-router/call-rpc";

// TODO: do we need to pass in cameraId?
 
export const LassoCamera = () => {
  // Local state
  // -------------------------------
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [exposureOverride, setExposureOverride] = useState<number | null>(null);
  const [gainOverride, setGainOverride] = useState<number | null>(null);
  const [colorSettings] = useState({
    "saturation derivative": 0,
    red: 0,
    green: 0,
    blue: 0,
    hue: 0,
    saturation: 0,
    lightness: 0,
  });

  // Store state
  // -------------------------------
  const videoStream = useVideoStreamStore((state) => state.streams["camera_lasso"]);
  const { rois, selectedRoi, updateRoi } = useRoiStore();

  // Hook - RPC Action
  // -------------------------------
  const start_livestream = useRPCAction("camera_lasso_start_livestream");
  const stop_livestream = useRPCAction("camera_lasso_stop_livestream");
  const webcamera_set_auto_wb = useRPCAction<void, { key: string; value: number }>(
    "camera_lasso_set_auto_wb",
  );

  const { result: exposure } = useRPCData<number>("camera_lasso_get_exposure", {});
  const { result: gain } = useRPCData<number>("camera_lasso_get_gain", {});
  const setExposure = useRPCAction<void, { value: number }>("camera_lasso_set_exposure");
  const setGain = useRPCAction<void, { value: number }>("camera_lasso_set_gain");

  // Derived values
  // -------------------------------
  const exposureValue = exposureOverride ?? exposure ?? 0;
  const gainValue = gainOverride ?? gain ?? 0;

  // Effects
  // -------------------------------
  // set up livestream
  useEffect(() => {
    if (!videoRef.current || !videoStream) return;
    videoRef.current.srcObject = videoStream;
  }, [videoStream]);

  // Handlers
  // -------------------------------
  async function handleGainChange(value: number) {
    console.log("Gain change", value);
    setGainOverride(value);
    setGain.call({ value: value });
  }

  async function handleExposureChange(value: number) {
    console.log("Exposure change", value);
    setExposureOverride(value);
    setExposure.call({ value: value });
  }

  return (
    <Stack className="space-y-10">
      <Group grow>
        <Button>Start Automated Dropoff</Button>
        <Button>Minimize XY Distance</Button>
      </Group>

      <Stack>
        <DrawableCamera
          video={
            <video
              ref={videoRef}
              muted
              autoPlay
              playsInline
              height={400}
              width={600}
              className="border"
            />
          }
          selectedRoi={selectedRoi}
          onRoiStateChange={(id, newRoi) => {
            updateRoi(id, newRoi);
          }}
          rois={rois}
        />
        <Group>
          <Button onClick={() => start_livestream.call()}>Start Camera</Button>
          <Button onClick={() => stop_livestream.call()}>Stop Camera</Button>
        </Group>
      </Stack>

      <Group gap="xl" grow>
        <Stack gap="xl">
          <Group gap="xl">
            <Select
              data={Object.keys(colorSettings)}
              defaultValue={Object.keys(colorSettings)[0]}
              allowDeselect={false}
              className="w-50"
            />
            <Slider
              defaultValue={40}
              marks={[
                { value: 25, label: "25%" },
                { value: 50, label: "50%" },
                { value: 75, label: "75%" },
              ]}
              className="flex-1"
            />
          </Group>
          <Group gap="xl">
            <Text className="min-w-50 text-right"> Exposure Time (μs)</Text>
            <Slider
              value={exposureValue}
              min={10}
              max={1000000}
              marks={[
                { value: 10, label: "10" },
                { value: 500000, label: "500000" },
                { value: 1000000, label: "1000000" },
              ]}
              className="flex-1"
              onChange={handleExposureChange}
            />
          </Group>
          <Group gap="xl">
            <Text className="min-w-50 text-right"> Gain </Text>
            <Slider
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
      </Group>

      <Group grow>
        <Button
          onClick={() =>
            webcamera_set_auto_wb.call({ key: "enable_auto_white_balance", value: 1 })
          }
        >
          Enable Auto White Balance
        </Button>
        <Button>Save Camera Settings</Button>
      </Group>
    </Stack>
  );
};
