export type StageControlProps = {
  stageId: string;
  axes: string[];
  host: string;
  unit: string;
};

export type StagePosVisProps = {};

type InstrumentStages = {
  [stageId: string]: string[];
};

export type UseStageProps = {
  host: string;
  instrumentStages: InstrumentStages;
};


export type fetchApiArgs = {
  host: string;
  stageId: string;
  axis: string;
}
export type PostApiArgs = fetchApiArgs & {
  value: number;
}