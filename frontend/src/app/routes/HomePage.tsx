import CameraWidget from "../../features/camera/index.js";
import { StagePosVis } from "../../features/stage/index.js";
import {
  PrototomeConfig,
  axisVariablesMapping,
} from "../../features/configuration/index.js";
import { StateControl } from "../../features/acquisitionControl/index.js";
import { Group, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import React, {useEffect} from "react";

export const HomePage = ({ config }) => {

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Group
        spacing="xl"
        style={{ gap: "2rem", justifyContent: "center", width: "100%" }}
        align="center"
      >
        <Stack spacing="xl" align="stretch">
          <PrototomeConfig
            config={config.prototome_config}
            setPrototomeConfig={(cfg) => {
              setConfig((prev) => ({ ...prev, prototome_config: cfg }));
            }}
          />
          <StateControl />
        </Stack>
        <Stack spacing="xl" align="stretch">
          {Object.entries(config).map(([key, value]) => {
            if (value?.type === "camera") {
              return (
                <CameraWidget
                  key={key}
                  cameraId={key}
                  host={value.host}
                  exposureSpecs={value.exposure_specs}
                  gainSpecs={value.gain_specs}
                />
              );
            }
            return null;
          })}
          {Object.entries(config).map(([key, value]) => {
            if (value?.type === "stage") {
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
                <StagePosVis
                  stageId={key}
                  axes={value.axes}
                  config={visConfig}
                />
              );
            }
            return null;
          })}
        </Stack>
      </Group>
    </div>
  );
};
