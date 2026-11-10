import { createWidget } from "@/widgets/framework";
import { LassoControlWidgetContract } from "./contract";
import { LassoControlWidgetView } from "./view";

export { LassoControlWidgetContract } from "./contract";
export const LassoControlWidget = createWidget(
  LassoControlWidgetContract,
  LassoControlWidgetView,
);
