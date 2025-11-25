import React, { useEffect, useState } from "react";
import { StageControl } from "../../features/stage/index.js";
import { Stack } from "@mantine/core";
import "@mantine/core/styles.css";
import type { AppConfig, StageConfig } from "../../types/configTypes.tsx";

export const StagesPage = ({ config }: { config: AppConfig }) => {
  return (
    <Stack align="center">
      {Object.entries(config)
        .filter((entry): entry is [string, StageConfig] => {
          const [, value] = entry;
          return typeof value === "object" && (value as any).type === "stage";
        })
        .map(([key, value]) => {
          if (value?.type === "stage") {
            return (
              <div key={key + "stage widget"}>
                <StageControl
                  stageId={key}
                  axes={value.axes}
                  unit={value.unit}
                />
              </div>
            );
          }
          return null;
        })}
    </Stack>
  );
};
