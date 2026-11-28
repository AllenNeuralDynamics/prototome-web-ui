import { createWidget } from "@/widgets/framework";
import { StateMachineWidgetContract } from "./contract";
import { StateMachineWidgetView } from "./view";

export { StateMachineWidgetContract } from "./contract";
export const StateMachineWidget = createWidget(
  StateMachineWidgetContract,
  StateMachineWidgetView,
);
