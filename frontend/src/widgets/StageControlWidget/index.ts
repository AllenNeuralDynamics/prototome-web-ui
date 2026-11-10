import { createWidget } from '@/widgets/framework';
import { StageControlWidgetContract } from './contract';
import { StageControlWidgetView } from './view';

export { StageControlWidgetContract } from './contract';
export const StageControlWidget = createWidget(StageControlWidgetContract, StageControlWidgetView);
