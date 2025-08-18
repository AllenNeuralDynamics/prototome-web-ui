import React, { useState, useEffect, useRef } from "react";

import {
  prototomeSchema,
  uiPrototomeSchema,
} from "../types/PrototomeConfigTypes.tsx";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import { FilePathWidget } from "./FilePathWidget.tsx";
import "../assets/rjsf-spacing.css";
import { Card } from "@mantine/core";

type PrototomeConfigProps = {
  config: any;
  setConfig: (newConfig: any) => void;
};
export default function PrototomeConfig({
  config,
  setConfig,
}: PrototomeConfigProps) {
  
  useEffect(() => {
    console.log("Current form state:", config);
  }, [config]);
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
          widgets={{ FilePathWidget }}
          formData={config.prototome_config}
          onChange={({ formData }) =>
            setConfig({ ...config, prototome_config: formData })
          }
          onSubmit={({ formData }) =>
            setConfig({ ...config, prototome_config: formData })
          }
        />
      </div>
    </Card>
  );
}
