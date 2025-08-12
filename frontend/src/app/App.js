import React, { useEffect, useState } from "react";
import CameraWidget from "../features/camera/components/CameraWidget.tsx";
import StageWidget from "../features/stage/components/StageWidget.tsx";
import { Group, Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import validator from "@rjsf/validator-ajv8";
// import Form from "@rjsf/bootstrap-4";
// import "bootstrap/dist/css/bootstrap.min.css";
import Form from '@rjsf/mui';
import {FilePathWidget} from "../components/FilePathWidget.tsx"
import { prototomeSchema, uiPrototomeSchema } from "../types/prototomeConfigTypes.tsx";
import '../assets/rjsf-spacing.css';

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
                <CameraWidget key={key} cameraId={key} host={value.host} exposureSpecs={value.exposure_specs} gainSpecs={value.gain_specs} />
              );
            }
            return null;
          })}
        </Stack>
        <Stack>
          {Object.entries(config).map(([key, value]) => {
            if (value?.type === "stage") {
              return (
                <StageWidget
                  key={key}
                  stageId={key}
                  axes={value.axes}
                  host={value.host}
                />
              );
            }
            return null;
          })}
        </Stack>
        <div className="prototome-config-form">
        <Form
            uiSchema={uiPrototomeSchema}
            schema={prototomeSchema}
            validator={validator}
            widgets={{FilePathWidget}}
            formData={config.prototome_config}
            onChange={({ formData }) =>
              setConfig((prev) => ({ ...prev, ["prototome_config"]: formData }))
            }
            onSubmit={({ formData }) =>
              setConfig((prev) => ({ ...prev, ["prototome_config"]: formData }))
            }
          />
          </div>
      </Group>
    </div>
  );
}

export default App;
