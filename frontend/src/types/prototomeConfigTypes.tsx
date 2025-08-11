export const prototomeSchema = {
  title: "Prototome Config",
  type: "object",
  properties: {
    active: { type: "boolean", title: "Active" },
    axis_map: {
      type: "object",
      title: "Axis Map",
      additionalProperties: { type: "string" },
    },
    bottom_position_mm: { type: "number", title: "Bottom Position (mm)" },
    cut_speed: { type: "number", title: "Cut Speed" },
    ep_cut_bottom: { type: "number", title: "EP Cut Bottom" },
  },
  required: [
    "active",
    "axis_map",
    "bottom_position_mm",
    "cut_speed",
    "ep_cut_bottom",
  ],
};

export const uiPrototomeSchema = {
    prototome_config: {
      classNames: "card card-body bg-light mb-3",
      "ui:order": ["active", "axis_map", "bottom_position_mm", "cut_speed", "ep_cut_bottom"],
      active: {
        "ui:widget": "checkbox",
        "ui:title": "Enable Prototome",
        "ui:description": "Check to activate the prototome system."
      },
      axis_map: {
        classNames: "row g-3",
        Piezo: {
          "ui:widget": "text",
          "ui:placeholder": "e.g. pt_stage_fine.axis1",
          classNames: "col-md-4",
          "ui:title": "Piezo Axis"
        },
        Y: {
          "ui:widget": "text",
          "ui:placeholder": "e.g. pt_stage_coarse.axis2",
          classNames: "col-md-4",
          "ui:title": "Y Axis"
        },
        Z: {
          "ui:widget": "text",
          "ui:placeholder": "e.g. pt_stage_coarse.axis1",
          classNames: "col-md-4",
          "ui:title": "Z Axis"
        }
      },
      bottom_position_mm: {
        "ui:widget": "updown",
        "ui:title": "Bottom Position (mm)",
        "ui:description": "Lowest cutting position in millimeters.",
        "ui:options": {
          step: 0.1,
          min: 0
        }
      },
      cut_speed: {
        "ui:widget": "updown",
        "ui:title": "Cut Speed (mm/s)",
        "ui:description": "Speed at which the cut is performed.",
        "ui:options": {
          step: 0.1,
          min: 0
        }
      },
      ep_cut_bottom: {
        "ui:widget": "updown",
        "ui:title": "EP Cut Bottom (mm)",
        "ui:description": "End position for EP cutting process.",
        "ui:options": {
          step: 0.1,
          min: 0
        }
      }
    }
  };
