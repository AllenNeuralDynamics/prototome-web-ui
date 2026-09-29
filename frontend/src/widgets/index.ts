export { LassoCameraWidget } from "./LassoCameraWidget";
export { LassoControlWidget } from "./LassoControlWidget";
export { MicrotomeControlWidget } from "./MicrotomeControlWidget";
export { StageControlWidget } from "./StageControlWidget";
export { WaferCalibrationWidget } from "./WaferCalibrationWidget";
import { LassoCameraWidget } from "./LassoCameraWidget";
import { LassoControlWidget } from "./LassoControlWidget";
import { MicrotomeControlWidget } from "./MicrotomeControlWidget";
import { StageControlWidget } from "./StageControlWidget";
import { WaferCalibrationWidget } from "./WaferCalibrationWidget";
import type { WidgetContract } from "./framework";

// NOTE: this is where you register a widget, everything else is derived from this
export const defaultWidgetRegistry = {
  LassoCameraWidget,
  LassoControlWidget,
  MicrotomeControlWidget,
  StageControlWidget,
  WaferCalibrationWidget,
} as const;

export type DefaultWidgetType = keyof typeof defaultWidgetRegistry;

// Map of widget type to its contract
export const defaultWidgetContractRegistry: Readonly<
  Record<string, WidgetContract>
> = Object.fromEntries(
  Object.values(defaultWidgetRegistry).map((widget) => [
    widget.contract.type,
    widget.contract,
  ]),
);
