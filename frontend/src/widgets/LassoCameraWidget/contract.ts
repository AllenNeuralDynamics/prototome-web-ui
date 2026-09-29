import { z } from "zod";

/**
 * Schemas mirror the backend's advertised JSON schemas exactly (see validate-zmq-bindings.ts).
 * Untyped backend params are `z.unknown()`; params with a backend default are `.optional()`.
 */
export const LassoCameraWidgetContract = {
  type: "LassoCameraWidget",
  slots: {
    cameraLasso: { results: z.unknown(), kind: "video" },
    startLivestream: {
      params: z.object({}),
      results: z.unknown(),
      kind: "action",
    },
    stopLivestream: {
      params: z.object({}),
      results: z.unknown(),
      kind: "action",
    },
    setAutoWb: {
      params: z.object({ key: z.unknown().optional(), value: z.unknown() }),
      results: z.unknown(),
      kind: "action",
    },
    getExposure: {
      params: z.object({ key: z.unknown().optional() }),
      results: z.unknown(),
      kind: "data",
    },
    getGain: {
      params: z.object({ key: z.unknown().optional() }),
      results: z.unknown(),
      kind: "data",
    },
    setExposure: {
      params: z.object({ key: z.unknown().optional(), value: z.unknown() }),
      results: z.unknown(),
      kind: "action",
    },
    setGain: {
      params: z.object({ key: z.unknown().optional(), value: z.unknown() }),
      results: z.unknown(),
      kind: "action",
    },
  },
} as const;
