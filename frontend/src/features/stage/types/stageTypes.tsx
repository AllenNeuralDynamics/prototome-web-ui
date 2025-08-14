export type StageWidgetProps = {
  stageId: string;
  axes: string[];
  host: string;
  unit: string;
};

type InstrumentStages = {
  [stageId: string]: string[];
};

export type UseStagePositionsProps = {
  host: string;
  instrumentStages: InstrumentStages;
};
