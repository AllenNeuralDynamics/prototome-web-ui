import type { PrototomeConfig } from "@/types/prototomeConfig.ts";

type NumericConfigKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

type PrototomeNumericKey = NumericConfigKeys<PrototomeConfig>;

type AxisVariablesMapping = Record<
  string, // device name (pt_stage_fine, pt_stage_coarse, etc.)
  Record<
    string, // axis name (axis1, axis2, etc.)
    PrototomeNumericKey[]
  >
>;
export interface CameraConfig {
  id: string;
}

export interface StageConfig {
  axes: string[];
  unit: string;
  id: string;
}

export interface AppConfig {
  data_channels: string[];
  video_streams: string[];
  gets: Record<string, string>;
  posts: Record<string, string>;
  axis_variable_mapping: AxisVariablesMapping;
  stage: StageConfig;
  camera: CameraConfig;
}
