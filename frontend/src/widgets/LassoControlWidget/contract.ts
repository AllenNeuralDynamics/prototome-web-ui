import { z } from "zod";

export const LassoControlWidgetContract = {
  type: "LassoControlWidget",
  slots: {
    pylassoData: {
      results: z.record(z.string(), z.unknown()),
      kind: "channel",
    },
    moveToStatePosition: {
      params: z.object({ state_name: z.unknown() }),
      results: z.unknown(),
      kind: "action",
    },
    storePosition: {
      params: z.object({ condition: z.unknown() }),
      results: z.unknown(),
      kind: "action",
    },
    homeAllAxes: {
      params: z.object({ home_order: z.unknown().optional() }),
      results: z.unknown(),
      kind: "action",
    },
    stopAllAxes: { params: z.object({}), results: z.unknown(), kind: "action" },
    homeAxis: {
      params: z.object({ logical_axis: z.string() }),
      results: z.unknown(),
      kind: "action",
    },
    stopAxis: {
      params: z.object({ logical_axis: z.string() }),
      results: z.unknown(),
      kind: "action",
    },
    guiUpdateSpeed: {
      params: z.object({
        axis: z.unknown(),
        speed: z.unknown(),
        unit: z.unknown().optional(),
      }),
      results: z.unknown(),
      kind: "action",
    },
  },
} as const;
