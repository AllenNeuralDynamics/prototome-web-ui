export const prototomeSchema = {
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
    safe_pause_range: {
      type: "array",
      items: {
        type: "number",
      },
      minItems: 2,
      maxItems: 2,
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
    "safe_pause_range",
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
      orderable: "false",
      addable: "true",
      removable: "true",
    },
    "ui:field": "object",
    "ui:widget": "text",
    "ui:placeholder": "device_name.axisN",
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
  safe_pause_range: {
    items: {
      "ui:widget": "updown",
    },
    "ui:title": "Safe Pause Range",
  },
  section_thickness: {
    "ui:widget": "updown",
    "ui:title": "Section Thickness",
  },
  state_machine: {
    "ui:widget": "FilePathWidget",
    "ui:options": {},
  },
  top_position_mm: {
    "ui:widget": "updown",
    "ui:title": "Top Position (mm)",
  },
};
