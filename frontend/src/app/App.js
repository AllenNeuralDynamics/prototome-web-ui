import React, { useEffect, useState } from "react";
import CameraWidget from "../features/camera/index.js";
import { StageControl, StagePosVis } from "../features/stage/index.js";
import { Group, Stack, Card, Tabs } from "@mantine/core";
import "@mantine/core/styles.css";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import { FilePathWidget } from "../components/FilePathWidget.tsx";
import {
  prototomeSchema,
  uiPrototomeSchema,
} from "../types/prototomeConfigTypes.tsx";
import "../assets/rjsf-spacing.css";
import { useStagePositions } from "../features/stage/index.js";

function App() {
  const [config, setConfig] = useState(null);

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

  useStagePositions({
    host: config?.host ?? "",
    instrumentStages: instrumentStages,
  });

  if (!config) return <div>Loading configuration...</div>;

  return (
    <div>
      <Group
        spacing="xl"
        style={{ flexWrap: "wrap", gap: "2rem" }}
        align="flex-start"
      >
        <Stack>
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
          <Tabs>
            <Tabs.List>
              {Object.entries(config).map(([key, value]) => {
                if (value?.type === "stage") {
                  return (
                    <Tabs.Tab value={key + "positions"}>
                      {key + "positions"}
                    </Tabs.Tab>
                  );
                }
                return null;
              })}
            </Tabs.List>
            {Object.entries(config).map(([key, value]) => {
              if (value?.type === "stage") {
                return (
                  <Tabs.Panel value={key + "positions"}>
                    <StagePosVis
                      stageId={key}
                      axes={value.axes}
                      host={value.host}
                    />
                  </Tabs.Panel>
                );
              }
              return null;
            })}
          </Tabs>
        </Stack>
        <Stack>
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
        <Card
          shadow="xs"
          padding="md"
          radius="md"
          withBorder
          className="bg-gray-50"
        >
          <div className="prototome-config-form">
            <Form
              uiSchema={uiPrototomeSchema}
              schema={prototomeSchema}
              validator={validator}
              widgets={{ FilePathWidget }}
              formData={config.prototome_config}
              onChange={({ formData }) =>
                setConfig((prev) => ({
                  ...prev,
                  ["prototome_config"]: formData,
                }))
              }
              onSubmit={({ formData }) =>
                setConfig((prev) => ({
                  ...prev,
                  ["prototome_config"]: formData,
                }))
              }
            />
          </div>
        </Card>
      </Group>
    </div>
  );
}

export default App;
