import { Stack, Group, Button } from "@mantine/core";
import "@mantine/core/styles.css";
import { api } from "../../lib/client.tsx";
import { StageControlWidget } from "@/widgets/index.ts";
import { useConfig } from "@/hooks/use-config.ts";

export const StagesPage = () => {
  const config = useConfig()

  if (!config) return;

  return (
    <Stack align="center">
      <StageControlWidget
        instanceId="stageControl1"
        unit={config.ui.unit}
      />
      <Group
        style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}
      >
        <Button
          color="red"
          onClick={() => {
            api.post("/stop_all_axes");
          }}
        >
          Stop all axes
        </Button>
        <Button
          color="blue"
          onClick={() => {
            api.post("/home_all_axes");
          }}
        >
          Home all axes
        </Button>
      </Group>
    </Stack>
  );
};
