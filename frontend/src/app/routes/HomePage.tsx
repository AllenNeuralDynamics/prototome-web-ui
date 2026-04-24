import { CameraWidget } from "../../features/camera/index.js";
import { StagePosVis } from "../../features/stage/index.js";
import { PrototomeConfigForm } from "../../features/configuration/index";
import { StateControl } from "../../features/acquisitionControl/index";
import { Group, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import { useConfigStore } from "@/stores/configStore.ts";
import { usePrototomeConfigStore } from "@/stores/prototomeConfigStore.tsx";
import type { PrototomeConfig } from "@/types/prototomeConfig";
import type { StageConfig } from "@/types/configTypes.tsx";

const buildVisConfig = (
  stage: StageConfig,
  prototomeConfig: PrototomeConfig,
  axisVariableMapping: Record<
    string,
    Record<string, (keyof PrototomeConfig)[]>
  >,
): Record<string, Record<string, any>> => {
  return Object.fromEntries(
    stage.axes.map((axis) => {
    const [ptStage, ...rest] = prototomeConfig.axis_map[axis].split(".");
    const ptAxis = rest.join(".");
      const cfgKeys = axisVariableMapping[ptStage][
        ptAxis
      ] as (keyof PrototomeConfig)[];
      const axisConfig = Object.fromEntries(
        cfgKeys.map((key) => [key, prototomeConfig[key]]),
      );
      return [axis, axisConfig];
    }),
  );
};

export const HomePage = () => {
  const config = useConfigStore((state) => state.config);
  const prototomeConfig = usePrototomeConfigStore((state) => state.config);

  if (!config) return null;

  const { stage, camera, axis_variable_mapping } = config;
  const visConfig = prototomeConfig 
    ? buildVisConfig(stage, prototomeConfig, axis_variable_mapping)
    : null;

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Group
        style={{ gap: "2rem", justifyContent: "center", width: "100%" }}
        align="center"
      >
        <Stack align="stretch">
          {/* Render the form only if config exists */}
          {prototomeConfig && <PrototomeConfigForm />}
          <StateControl />
        </Stack>
        <Stack align="stretch">
          <CameraWidget cameraId={camera.id} />
          <StagePosVis
            stageId={stage.id}
            axes={stage.axes}
            config={visConfig}
            unit={stage.unit}
          />
        </Stack>
      </Group>
    </div>
  );
};
