import "@mantine/core/styles.css";
import { MicrotomeControlWidget } from "@/widgets/index.js";
import { useConfig } from "@/hooks/use-config";

export const HomePage = () => {
  const config = useConfig();

  if (!config) return null;

  const { axis_variable_mapping } = config.ui;

  return (
    <MicrotomeControlWidget
      instanceId="microtomeControl1"
      unit={config.ui.unit} 
      axisVariableMapping={axis_variable_mapping}
    />
  );
};
