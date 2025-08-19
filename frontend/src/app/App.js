import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../stores/store.tsx";
import CameraWidget from "../features/camera/index.js";
import { StageControl, StagePosVis } from "../features/stage/index.js";
import {
  PrototomeConfig,
  StateControl,
  axisVariablesMapping,
} from "../features/configuration/index.js";
import { Group, Stack, Tabs } from "@mantine/core";
import "@mantine/core/styles.css";
import { useStagePositions } from "../features/stage/index.js";
import { initializeRanges } from "../features/stage/stores/rangeSlice.tsx";

function App() {
  const [config, setConfig] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("http://localhost:8000/config");

        if (!response.ok) throw new Error("Failed to fetch config");
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    }

    fetchConfig();
  }, []);

  const instrumentStages = Object.fromEntries(
    Object.entries(config ?? {})
      .filter(([_, value]) => value?.type === "stage")
      .map(([key, value]) => [key, value.axes]),
  );

  useEffect(() => {
    // initialize the stage range stores
    dispatch(initializeRanges({ host: config?.host, instrumentStages }));
  }, [dispatch, config?.host, instrumentStages]);

  useStagePositions({
    host: config?.host ?? "",
    instrumentStages: instrumentStages,
  });

  if (!config) return <div>Loading configuration...</div>;

  const defaultTab = Object.entries(config).find(
    ([key, value]) => value?.type === "stage",
  )?.[0];
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
            setConfig={(config) => {
              setConfig((prev) => ({ ...prev, prototome_config: config }));
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
            console.log(config)
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
        <Stack Stack spacing="xl" align="stretch">
          {Object.entries(config).map(([key, value]) => {
            if (value?.type === "stage") {
              return (
                <div key={key + "stage widget"}>
                  <StageControl
                    stageId={key}
                    axes={value.axes}
                    host={value.host}
                  />
                </div>
              );
            }
            return null;
          })}
        </Stack>
      </Group>
    </div>
  );
}

export default App;
