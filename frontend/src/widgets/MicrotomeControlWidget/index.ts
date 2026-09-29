import { createWidget } from "@/widgets/framework";
import { MicrotomeControlWidgetContract } from "./contract";
import { MicrotomeControlWidgetView } from "./view";

export { MicrotomeControlWidgetContract } from "./contract";
export const MicrotomeControlWidget = createWidget(
  MicrotomeControlWidgetContract,
  MicrotomeControlWidgetView,
);
