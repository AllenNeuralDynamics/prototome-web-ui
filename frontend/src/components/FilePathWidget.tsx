import React from "react";
import { FileButton, Button, Group } from "@mantine/core";
import { TextField } from "@mui/material";

export function FilePathWidget({ id, label, value, onChange }) {
  return (
    <Group gap="sm" grow>
      <TextField
        id={id}
        label={label}
        value={value || ""}
        placeholder="No file selected"
        variant="outlined"
        size="small"
        onChange={(e) => onChange(e.target.value)}
      />
      <FileButton
        onChange={(file) => {
          if (file) {
            onChange(file.name);
          }
        }}
        accept="*"
      >
        {(props) => <Button {...props}>Browse Files</Button>}
      </FileButton>
    </Group>
  );
}
