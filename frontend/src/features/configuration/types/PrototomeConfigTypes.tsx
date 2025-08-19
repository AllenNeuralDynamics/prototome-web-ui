import { RJSFSchema } from "@rjsf/utils";

export const prototomeSchema: RJSFSchema = {
  title: "Prototome Config",
  type: "object",
  properties: {
    active: {
      type: "boolean",
    },
    axis_map: {
      type: "object",
      propertyNames: {
        type: "string",
      },
      additionalProperties: {
        type: "string",
      },
    },
    bottom_position_mm: {
      type: "number",
    },
    cut_speed: {
      type: "number",
    },
    ep_cut_bottom: {
      type: "number",
    },
    ep_cut_top: {
      type: "number",
    },
    retract_distance: {
      type: "number",
    },
    retract_piezo_distance: {
      type: "number",
    },
    retract_speed: {
      type: "number",
    },
    retract_time_ok_count: {
      type: "integer",
    },
    safe_bottom_position_mm: {
      type: "number",
    },
    safe_top_position_mm: {
      type: "number",
    },
    section_thickness: {
      type: "number",
    },
    state_machine: {
      type: "string",
    },
    top_position_mm: {
      type: "number",
    },
  },
  required: [
    "active",
    "axis_map",
    "bottom_position_mm",
    "cut_speed",
    "ep_cut_bottom",
    "ep_cut_top",
    "retract_distance",
    "retract_piezo_distance",
    "retract_speed",
    "retract_time_ok_count",
    "safe_bottom_position_mm",
    "safe_top_position_mm",
    "section_thickness",
    "state_machine",
    "top_position_mm",
  ],
  additionalProperties: false,
};

export const uiPrototomeSchema = {
  active: {
    "ui:widget": "checkbox",
  },
  axis_map: {
    "ui:options": {
    orderable: false,
    addable: false,      // disables "+"
    removable: false     // disables "−"
  },
    "ui:field": "object",
    "ui:widget": "text",
    "ui:placeholder": "device_name.axisN",
    "ui:disabled": "true"
  },
  bottom_position_mm: {
    "ui:widget": "updown",
    "ui:title": "Bottom Position (mm)",
  },
  cut_speed: {
    "ui:widget": "updown",
    "ui:title": "Cut Speed",
  },
  ep_cut_bottom: {
    "ui:widget": "updown",
    "ui:title": "Epoxy Cut Bottom",
  },
  ep_cut_top: {
    "ui:widget": "updown",
    "ui:title": "Epoxy Cut Top",
  },
  retract_distance: {
    "ui:widget": "updown",
    "ui:title": "Retract Distance",
  },
  retract_piezo_distance: {
    "ui:widget": "updown",
    "ui:title": "Retract Piezo Distance",
  },
  retract_speed: {
    "ui:widget": "updown",
    "ui:title": "Retract Speed",
  },
  retract_time_ok_count: {
    "ui:widget": "updown",
    "ui:title": "Retract Time OK Count",
  },
  section_thickness: {
    "ui:widget": "updown",
    "ui:title": "Section Thickness",
  },
  safe_bottom_position_mm: {
    "ui:widget": "updown",
    "ui:title": "Safe Pause Bottom Position (mm)",
  },
  safe_top_position_mm: {
    "ui:widget": "updown",
    "ui:title": "Safe Pause Top Position (mm)",
  },
  state_machine: {
    "ui:widget": "hidden",
  },
  top_position_mm: {
    "ui:widget": "updown",
    "ui:title": "Top Position (mm)",
  },
};


export const axisVariablesMapping = {

  pt_stage_fine: {
    axis1:[
      "retract_piezo_distance"
    ]
  },
  pt_stage_coarse: {
    axis1: [
      "bottom_position_mm",
      "ep_cut_bottom",
      "ep_cut_top",
      "safe_bottom_position_mm",
      "safe_top_position_mm",
      "top_position_mm"
    ],
    axis2: [
      "retract_distance"
    ]
  }

}