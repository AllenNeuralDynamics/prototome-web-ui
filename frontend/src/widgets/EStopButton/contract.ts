import { z } from "zod";

export const EStopButtonContract = {
  type: "EStopButton",
  slots: {
    stopCuttingNow: {
      params: z.object({ event: z.unknown().optional() }),
      results: z.unknown(),
      kind: "action",
    },
  },
} as const;
