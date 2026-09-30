import { z } from "zod";

export const StageControlWidgetContract = {
  type: "StageControlWidget",
  slots: {
    stagePositions: { results: z.unknown(), kind: "channel" },
    getAxisVelocities: {
      params: z.object({}),
      results: z.unknown(),
      kind: "data",
    },
    getAxisTravelRanges: {
      params: z.object({}),
      results: z.unknown(),
      kind: "data",
    },
    getAxisMaxVelocity: {
      params: z.object({ logical_axis: z.string() }),
      results: z.unknown(),
      kind: "action",
    },
    setAxisPosition: {
      params: z.object({ logical_axis: z.string(), position: z.number() }),
      results: z.unknown(),
      kind: "action",
    },
    setAxisMaxVelocity: {
      params: z.object({
        logical_axis: z.string(),
        speed: z.number(),
        unit: z.string().optional(),
      }),
      results: z.unknown(),
      kind: "action",
    },
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
  },
} as const;
