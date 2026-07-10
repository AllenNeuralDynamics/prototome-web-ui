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
