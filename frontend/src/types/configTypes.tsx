import type { PrototomeConfig } from "@/types/prototomeConfig.ts";

type NumericConfigKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

export type PrototomeNumericKey = NumericConfigKeys<PrototomeConfig>;

export interface CameraConfig {
  id: string;
}

export interface StageConfig {
  axes: string[];
  unit: string;
  id: string;
}

export interface AppConfig {
  FASTAPI_BASE_URL: string;
  STREAM_METADATA_ENDPOINT: string;
  RPC_METADATA_ENDPOINT: string;
  data_channels: string[];
  video_streams: string[];
  gets: Record<string, string>;
  posts: Record<string, string>;
  axis_variable_mapping: AxisVariablesMapping;
  stage: StageConfig;
  camera: CameraConfig;
}
