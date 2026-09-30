import "@mantine/core/styles.css";
import { MicrotomeControlWidget } from "@/widgets/index.js";
import { useConfig } from "@/hooks/use-config";

export const HomePage = () => {

  const config = useConfig()

  if (!config) return null;

  const { stage, axis_variable_mapping } = config.ui;

  return (
    <MicrotomeControlWidget
      instanceId="microtomeControl1"
      axes={stage.axes}
      unit={stage.unit}
      axisVariableMapping={axis_variable_mapping}
    />
  );
};
