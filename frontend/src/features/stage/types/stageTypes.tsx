
export type StageControlProps = {
  stageId: string;
  axes: string[];
  unit?: string;
};

export type StagePosVisProps = {
  stageId: string;
  axes: string[];
  config: Record<string, Record<string, string[]>>;
  unit?: string;
};

type InstrumentStages = {
  [stageId: string]: string[];
};

export type UseStageProps = {
  instrumentStages: InstrumentStages;
};

export type fetchApiArgs = {
  stageId: string;
  axis: string;
};
export type PostApiArgs = fetchApiArgs & {
  value: number;
};
