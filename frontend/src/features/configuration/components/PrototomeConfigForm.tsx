import { useEffect } from "react";
import {
  prototomeSchema,
  uiPrototomeSchema,
} from "../types/PrototomeConfigTypes.tsx";
import type { PrototomeConfig } from "../../../types/configTypes.tsx"
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mantine";
import { Button, FileButton, Title } from "@mantine/core";
import "../assets/rjsf-spacing.css";
import { Card } from "@mantine/core";

type PrototomeConfigProps = {
  config: PrototomeConfig;
  setPrototomeConfig: (newConfig: any) => void;
};

export const PrototomeConfigForm = ({
  config,
  setPrototomeConfig,
}: PrototomeConfigProps) => {
  useEffect(() => {
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        
        // revert all blue fields
        const edited = document.querySelectorAll(".edited-field");
        edited.forEach((el) => el.classList.remove("edited-field"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [config]);

  const handleChange = () => {
    const activeEl = document.activeElement as HTMLInputElement | null;

    if (!activeEl) return;
    activeEl.classList.add("edited-field");
  };

  const loadConfig = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result !== "string") return;
          const parsedData = JSON.parse(result);
          const validate = validator.ajv.compile(prototomeSchema);
          const valid = validate(parsedData?.prototome_config || parsedData);
          console.log(valid, parsedData?.prototome_config || parsedData);
          if (!valid) {
            throw new Error("Loaded json is not valid");
          }
          setPrototomeConfig(parsedData?.prototome_config || parsedData);
        } catch (error) {
          console.error("Error parsing JSON:", error);
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
        <Title style={{ fontWeight: "bold", marginBottom: "0.5rem" }}> Prototome Config </Title>
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
          <Button m="xs" type="submit">
            Submit
          </Button>
          <FileButton onChange={loadConfig} accept="json">
            {(props) => <Button {...props}>Upload Config</Button>}
          </FileButton>
        </Form>
      </div>
    </Card>
  );
}
