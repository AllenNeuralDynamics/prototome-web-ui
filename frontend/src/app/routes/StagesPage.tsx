import React, { useEffect, useState } from "react";
import { StageControl } from "../../features/stage/index.js";
import { Stack } from "@mantine/core";
import "@mantine/core/styles.css";

export const StagesPage = ({ config }) => {
  return (
    <Stack align="center">
      {Object.entries(config).map(([key, value]) => {
        if (value?.type === "stage") {
          return (
            <div key={key + "stage widget"}>
              <StageControl stageId={key} axes={value.axes} host={value.host} />
            </div>
          );
        }
        return null;
      })}
    </Stack>
  );
};
