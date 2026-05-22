import { cameraApi } from "@/features/camera/api/cameraApi";
import { lassoCameraApi } from "@/features/pylasso/api/lassoCameraApi";
import { useVideoStreamStore } from "@/stores/dataChannelStore";
import { Button, Group, Select, Slider, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface LassoCameraProps {
  cameraId: string;
}

export const LassoCamera = ({ cameraId }: LassoCameraProps) => {
  /***************************************
   *
   *    STATES
   *
   ***************************************/

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoStream = useVideoStreamStore((state) => state.streams["lasso"]);
  const [colorSettings] = useState({
    "saturation derivative": 0,
    red: 0,
    green: 0,
    blue: 0,
    hue: 0,
    saturation: 0,
    lightness: 0,
  });

  /***************************************
   *
   *    FETCH DATA
   *
   ***************************************/

  // set up livestream
  useEffect(() => {
    if (!videoRef.current || !videoStream) return;
    videoRef.current.srcObject = videoStream;
  }, [videoStream]);

  const { data: exposure } = useQuery({
    queryKey: ["lasso_camera_exposure"],
    queryFn: () => cameraApi.getExposure(cameraId),
  });

  const { data: gain } = useQuery({
    queryKey: ["lasso_camera_gain"],
    queryFn: () => cameraApi.getGain(cameraId),
  });

  /***************************************
   *
   *    HANDLERS
   *
   ***************************************
   *
   *  - exposure change             < update exposure, call api
   *  - gain change                 < update gain, call api
   *  - color setting change        < update color, call api
   *  - minimize xy distance        < direct api call onClick
   *  - start automated dropoff     < direct api call onClick
   *  - enable auto white balance   < direct api call onClick
   *  - save camera settings        < direct api call onClick (maybe handler to format setting)
   *  - consumer dropoffimager      < get ROI (format to what prototome saves), call api
   *
   */

  async function handleGainChange(value: number) {
    console.log("Gain change", value);
    cameraApi.postGain(cameraId, value);
  }

  async function handleExposureChange(value: number) {
    console.log("Exposure change", value);
    cameraApi.postExposure(cameraId, value);
  }

  return (
    <Stack className="space-y-10">
      <Group grow>
        <Button>Start Automated Dropoff</Button>
        <Button>Minimize XY Distance</Button>
      </Group>

      <Stack>
        <video ref={videoRef} muted autoPlay playsInline className="border" />
        <Group>
          <Button onClick={() => cameraApi.startLivestream(cameraId)}>
            Start Camera
          </Button>
          <Button onClick={() => cameraApi.stopLivestream(cameraId)}>
            Stop Camera
          </Button>
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
              defaultValue={exposure}
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
              defaultValue={gain}
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
          onClick={() => lassoCameraApi.postAutoWhiteBalance(cameraId, 1)}
        >
          Enable Auto White Balance
        </Button>
        <Button>Save Camera Settings</Button>
      </Group>
    </Stack>
  );
};
