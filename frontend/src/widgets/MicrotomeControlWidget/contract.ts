import { z } from "zod";

const cameraGetParams = z.object({ key: z.unknown().optional() });
const cameraSetParams = z.object({
  key: z.unknown().optional(),
  value: z.unknown(),
});
const stateEventParams = z.object({ event: z.unknown().optional() });

export const MicrotomeControlWidgetContract = {
  type: "MicrotomeControlWidget",
  slots: {
    // Prototome config
    getPrototomeConfig: {
      params: z.object({ key: z.unknown().optional() }),
      results: z.unknown(),
      kind: "data",
    },
    setPrototomeConfig: {
      params: z.object({ value: z.record(z.string(), z.unknown()) }),
      results: z.unknown(),
      kind: "action",
    },

    // State control
    prototomeState: { results: z.unknown(), kind: "channel" },
    startCutting: {
      params: stateEventParams,
      results: z.unknown(),
      kind: "action",
    },
    cutOne: {
      params: z.object({ n: z.unknown().optional() }),
      results: z.unknown(),
      kind: "action",
    },
    stopCuttingSafely: {
      params: stateEventParams,
      results: z.unknown(),
      kind: "action",
    },
    stopCuttingNow: {
      params: stateEventParams,
      results: z.unknown(),
      kind: "action",
    },

    // Camera
    cameraPrototome: { results: z.unknown(), kind: "video" },
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
    getExposure: {
      params: cameraGetParams,
      results: z.unknown(),
      kind: "data",
    },
    getExposureMax: {
      params: cameraGetParams,
      results: z.unknown(),
      kind: "data",
    },
    getExposureMin: {
      params: cameraGetParams,
      results: z.unknown(),
      kind: "data",
    },
    getExposureStep: {
      params: cameraGetParams,
      results: z.unknown(),
      kind: "data",
    },
    getGain: { params: cameraGetParams, results: z.unknown(), kind: "data" },
    getGainMax: { params: cameraGetParams, results: z.unknown(), kind: "data" },
    getGainMin: { params: cameraGetParams, results: z.unknown(), kind: "data" },
    getGainStep: {
      params: cameraGetParams,
      results: z.unknown(),
      kind: "data",
    },
    setExposure: {
      params: cameraSetParams,
      results: z.unknown(),
      kind: "action",
    },
    setGain: { params: cameraSetParams, results: z.unknown(), kind: "action" },

    // Stage position
    stagePositions: { results: z.unknown(), kind: "channel" },
    getAxisTravelRanges: {
      params: z.object({}),
      results: z.unknown(),
      kind: "data",
    },
  },
} as const;
