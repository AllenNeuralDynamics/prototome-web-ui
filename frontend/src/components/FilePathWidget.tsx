import React from "react";
import { FileButton, Button, TextInput, Group } from "@mantine/core";

export function FilePathWidget({ value, onChange }) {
    return (
      <Group gap="sm" grow>
        <TextInput
          value={value || ""}
          placeholder="No file selected"
          readOnly
        />
        <FileButton
        onChange={(file) => {
          if (file) {
            onChange(file.name); // update with selected file name
          }
        }}
        accept="*">
         {(props) => <Button {...props}>Browse Files</Button>}
      </FileButton>
      </Group>
    );
  }
