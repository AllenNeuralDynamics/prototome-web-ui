type NumericConfigKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never
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
  type: "camera";
  index: number;
  exposure_specs: { min: number; max: number; step: number };
  gain_specs: { min: number; max: number; step: number };
}

export interface StageConfig {
  type: "stage";
  axes: string[];
  unit?: string;
}

export interface PrototomeConfig {
  active: boolean;
  axis_map: Record<string, string>;
  bottom_position_mm: number;
  cut_speed: number;
  ep_cut_bottom: number;
  ep_cut_top: number;
  retract_distance: number;
  retract_piezo_distance: number;
  retract_speed: number;
  retract_time_ok_count: number;
  section_thickness: number;
  state_machine: string;
  top_position_mm: number;
  
}

export interface AppConfig {
  prototome_config: PrototomeConfig;
  data_channels: string[];
  video_streams: string[];
  gets: Record<string, string>;
  posts: Record<string, string>;
  axis_variable_mapping: AxisVariablesMapping
}
