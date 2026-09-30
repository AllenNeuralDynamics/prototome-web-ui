import { z } from "zod";

export const WaferCalibrationWidgetContract = {
  type: "WaferCalibrationWidget",
  slots: {
    waferData: { results: z.record(z.string(), z.unknown()), kind: "channel" },
    navigatorData: {
      results: z.record(z.string(), z.unknown()),
      kind: "channel",
    },
    calibrate: { params: z.object({}), results: z.unknown(), kind: "action" },
    setWorldRefpoint: {
      params: z.object({ key: z.unknown() }),
      results: z.unknown(),
      kind: "action",
    },
    updateApertureStatus: {
      params: z.object({ aperture_id: z.unknown(), status: z.unknown() }),
      results: z.unknown(),
      kind: "action",
    },
    removeAperture: {
      params: z.object({ aperture_id: z.unknown() }),
      results: z.unknown(),
      kind: "action",
    },
  },
} as const;
