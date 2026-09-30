export type LassoPosition = {
  X: number;
  Y: number;
  Z: number;
};

export type Axis = {
  position: number;
  speed: number;
};

export type AxesData = {
  X: Axis;
  Y: Axis;
  Z: Axis;
};

export type LassoData = {
  state: string;
  cycle_count: number;
  state_positions: { [state: string]: LassoPosition };
  axes: AxesData;
};
