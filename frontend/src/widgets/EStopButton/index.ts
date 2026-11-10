import { createWidget } from "@/widgets/framework";
import { EStopButtonContract } from "./contract";
import { EStopButtonView } from "./view";

export { EStopButtonContract } from "./contract";
export const EStopButton = createWidget(EStopButtonContract, EStopButtonView);
