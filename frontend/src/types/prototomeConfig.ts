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
