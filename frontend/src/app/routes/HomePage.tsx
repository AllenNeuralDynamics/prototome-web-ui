import { CameraWidget } from "../../features/camera/index.js";
import { StagePosVis } from "../../features/stage/index.js";
import { PrototomeConfigForm } from "../../features/configuration/index";
import { StateControl } from "../../features/acquisitionControl/index";
import { Group, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import type { CameraConfig, PrototomeConfig } from "@/types/configTypes.tsx";
import type { StageConfig } from "@/types/configTypes.tsx";
import type { HomePageProps } from "@/types/pageTypes.tsx";
import { axisVariablesMapping } from "@/types/axisVariableMapping.tsx";

export const HomePage = ({ config, setConfig }: HomePageProps) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Group
        style={{ gap: "2rem", justifyContent: "center", width: "100%" }}
        align="center"
      >
        <Stack align="stretch">
          <PrototomeConfigForm
            config={config.prototome_config}
            setPrototomeConfig={(cfg) => {
              setConfig((prev) => ({ ...prev, prototome_config: cfg }));
            }}
          />
          <StateControl />
        </Stack>
        <Stack align="stretch">
          {Object.entries(config)
            .filter((entry): entry is [string, CameraConfig] => {
              const [, value] = entry;
              return (
                // TODO: fix no-explicit-any error
                // This may change if configurations gets refactored
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                typeof value === "object" && (value as any).type === "camera"
              );
            })
            .map(([key]) => {
              return (
                <CameraWidget
                  key={key}
                  cameraId={key}
                />
              );
            })}
          {Object.entries(config)
            .filter((entry): entry is [string, StageConfig] => {
              const [, value] = entry;
              return (
                // TODO: fix no-explicit-any error
                // This may change if configurations gets refactored
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                typeof value === "object" && (value as any).type === "stage"
              );
            })
            .map(([key, value]) => {
              // TODO: fix no-explicit-any error
              // This may change if configurations gets refactored
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const visConfig: Record<string, Record<string, any>> = {};
              for (const axis of value.axes) {

                visConfig[axis] = {};
                const [ptStage, ptAxis] =
                  config.prototome_config.axis_map[axis].split(".");
                type ProtoKey = keyof PrototomeConfig;
                for (const cfgKey of axisVariablesMapping[ptStage][
                  ptAxis
                ] as ProtoKey[]) {
                  visConfig[axis][cfgKey] = config.prototome_config[cfgKey];
                }
              }

              return (
                <div>
                  <StagePosVis
                    stageId={key}
                    axes={value.axes}
                    config={visConfig}
                    unit={value.unit}
                  />
                </div>
              );
            })}
        </Stack>
      </Group>
    </div>
  );
};
