export type StageWidgetProps = {
  stageId: string;
  axes: string[];
  host: string;
  positions: Positions;
  unit: string;
};

type Positions = {
  [key: string]: number;
}

