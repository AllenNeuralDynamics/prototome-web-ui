export const axisVariablesMapping: Record<string, Record<string, string[]>> = {
  pt_stage_fine: {
    axis1: ["retract_piezo_distance"],
  },
  pt_stage_coarse: {
    axis1: [
      "bottom_position_mm",
      "ep_cut_bottom",
      "ep_cut_top",
      "top_position_mm",
    ],
    axis2: ["retract_distance"],
  },
};
