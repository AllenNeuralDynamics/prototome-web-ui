import React, { useState, useEffect, useRef } from "react";

import {
  prototomeSchema,
  uiPrototomeSchema,
} from "../types/PrototomeConfigTypes.tsx";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import { toPathSchema } from "@rjsf/utils";
import { FilePathWidget } from "./FilePathWidget.tsx";
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
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        // don't save all form values
        e.preventDefault();
        
        const activeEl = document.activeElement as HTMLInputElement | null;
        if (!activeEl) return;
        if (activeEl) {
          activeEl.classList.remove("edited-field");         
        }
        
        const configKey = activeEl.name.replace(/^root_/, "")   // hacky way to find the corresponding element. Will break if config is not flat 
        console.log(configKey)
        setPrototomeConfig((prev) => ({
          ...prev,
          [configKey]: Number(activeEl.value)
        }));

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
        if (activeEl) {
          activeEl.classList.add("edited-field");         
        }
  };

  const editedUiSchema = Object.fromEntries(
    Object.keys(uiPrototomeSchema).map((key) => [
      key,
      {
        ...uiPrototomeSchema[key],
        "ui:classNames": editedFields.has(key)
          ? "edited-field" // CSS class for edited fields
          : uiPrototomeSchema[key].classNames || "",
      },
    ]),
  );

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
          uiSchema={editedUiSchema}
          schema={prototomeSchema}
          validator={validator}
          widgets={{ FilePathWidget }}
          formData={config}
          onChange={handleChange}
          onSubmit={({ formData }) => setConfig(formData)}
        />
      </div>
    </Card>
  );
}
