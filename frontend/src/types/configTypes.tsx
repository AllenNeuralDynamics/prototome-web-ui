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
  safe_bottom_position_mm: number;
  safe_top_position_mm: number;
  section_thickness: number;
  state_machine: string;
  top_position_mm: number;
}

export interface AppConfig {
  prototome_config: PrototomeConfig;
  data_channels: string[];
  video_streams: string[];
  [key: string]:
    | CameraConfig
    | StageConfig
    | PrototomeConfig
    | string
    | string[];
}
