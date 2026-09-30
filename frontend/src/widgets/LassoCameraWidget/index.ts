import { createWidget } from '@/widgets/framework';
import { LassoCameraWidgetContract } from './contract';
import { LassoCameraWidgetView } from './view';

export { LassoCameraWidgetContract } from './contract';
export const LassoCameraWidget = createWidget(LassoCameraWidgetContract, LassoCameraWidgetView);
