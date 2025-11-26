import { StageControl } from "../../features/stage/index.js";
import { Stack, Group, Button } from "@mantine/core";
import "@mantine/core/styles.css";
import type { AppConfig, StageConfig } from "../../types/configTypes.tsx";
import { api } from "../../lib/client.tsx"

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
      <Group style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <Button color="red" onClick={() => {api.post('/stop_all_axes')}}>Stop all axes</Button>
        <Button color="blue" onClick={() => {api.post('/home_all_axes')}}>Home all axes</Button>
    </Group> 
    </Stack>
  );
};
