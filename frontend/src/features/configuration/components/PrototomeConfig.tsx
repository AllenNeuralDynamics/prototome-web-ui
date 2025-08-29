import React, { useState, useEffect, useRef } from "react";

import {
  prototomeSchema,
  uiPrototomeSchema,
} from "../types/PrototomeConfigTypes.tsx";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import { Button, FileButton } from "@mantine/core";
import "../assets/rjsf-spacing.css";
import { Card } from "@mantine/core";

type PrototomeConfigProps = {
  config: any;
  setPrototomeConfig: (newConfig: any) => void;
};

export default function PrototomeConfig({
  config,
  setPrototomeConfig,
}: PrototomeConfigProps) {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        // don't save all form values
        e.preventDefault();

        const activeEl = document.activeElement as HTMLInputElement | null;
        if (!activeEl) return;
        activeEl.classList.remove("edited-field");

        const configKey = activeEl.name.replace(/^root_/, ""); // hacky way to find the corresponding element. Will break if config is not flat
        const newConfig = config;
        newConfig[configKey] = Number(activeEl.value);
        setPrototomeConfig(newConfig);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [config]);

  const handleChange = (event: any) => {
    const activeEl = document.activeElement as HTMLInputElement | null;

    if (!activeEl) return;
    activeEl.classList.add("edited-field");
  };

  const loadConfig = (file: File | null) => {
    if (file) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const parsedData = JSON.parse(e.target.result);
            const validate = validator.ajv.compile(prototomeSchema)
            const valid = validate(parsedData?.prototome_config || parsedData);
            console.log(valid, parsedData?.prototome_config || parsedData)
            if (!valid) {
              throw new Error("Loaded json is not valid")
            }
            setPrototomeConfig(parsedData?.prototome_config || parsedData);
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        };
        reader.readAsText(file); // Read the file as text
      }
    };
  return (
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
          formData={config}
          onChange={handleChange}
          onSubmit={({ formData }) => {
            console;
            for (const key of Object.keys(formData)) {
              const el = document.getElementsByName(`root_${key}`)[0] as
                | HTMLInputElement
                | undefined;
              if (!el) continue;
              el.classList.remove("edited-field");
              console.log("asdfas");
              setPrototomeConfig(formData);
            }
          }}
        >
          <Button m="xs" type="submit">Submit</Button>
          <FileButton onChange={loadConfig} accept="json">
          {(props) => <Button {...props}>Upload Config</Button>}
        </FileButton>
        </Form>
      </div>
    </Card>
  );
}
