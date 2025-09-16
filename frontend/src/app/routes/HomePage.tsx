import CameraWidget from "../../features/camera/index.js";
import { StagePosVis } from "../../features/stage/index.js";
import {
  PrototomeConfig,
  axisVariablesMapping,
} from "../../features/configuration/index.js";
import { StateControl } from "../../features/acquisitionControl/index.js";
import { Group, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import { CameraConfig } from "../../types/configTypes.tsx";
import React, { useEffect } from "react";
import { CameraWidgetProps } from "../../features/camera/types/cameraTypes.tsx";
import { StageConfig } from "../../types/configTypes.tsx";
import { HomePageProps } from "../../types/pageTypes.tsx";

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
          <PrototomeConfig
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
                typeof value === "object" && (value as any).type === "camera"
              );
            })
            .map(([key, value]) => {
              return (
                <CameraWidget
                  key={key}
                  cameraId={key}
                  host={value.host}
                  exposureSpecs={value.exposure_specs}
                  gainSpecs={value.gain_specs}
                />
              );
            })}
          {Object.entries(config)
            .filter((entry): entry is [string, StageConfig] => {
              const [, value] = entry;
              return (
                typeof value === "object" && (value as any).type === "stage"
              );
            })
            .map(([key, value]) => {
              const visConfig = {};

              for (const axis of value.axes) {
                visConfig[axis] = {};
                const [ptStage, ptAxis] =
                  config.prototome_config.axis_map[axis].split(".");
                for (const cfgKey of axisVariablesMapping[ptStage][ptAxis]) {
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
