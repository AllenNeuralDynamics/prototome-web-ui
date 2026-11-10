import { createWidget } from '@/widgets/framework';
import { WaferCalibrationWidgetContract } from './contract';
import { WaferCalibrationWidgetView } from './view';

export { WaferCalibrationWidgetContract } from './contract';
export const WaferCalibrationWidget = createWidget(
  WaferCalibrationWidgetContract,
  WaferCalibrationWidgetView,
);
