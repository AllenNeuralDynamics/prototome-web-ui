import { StageControl } from "@/features/stage/index.js";
import { Stack, Group, Button } from "@mantine/core";
import "@mantine/core/styles.css";
import { api } from "../../lib/client.tsx";
import { useConfigStore } from "@/stores/configStore.ts";
import { usePrototomeConfigStore } from "@/stores/prototomeConfigStore.tsx";

export const StagesPage = () => {
  const config = useConfigStore((state) => state.config);
  const prototomeConfig = usePrototomeConfigStore((state) => state.config);


  if (!config || !prototomeConfig) return;

  return (
    <Stack align="center">
      <StageControl
        stageId={config.stage.id}
        axes={config.stage.axes}
        unit={config.stage.unit}
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
