import { api } from "@/lib/client";

/**
 * - [get]  exposure
 * - [get]  gain
 * - [get]  color setting?
 * - [post] startLivestream
 * - [post] stopLivestream
 * - [post] minimize xy distance
 * - [post] start automated drop off
 * - [post] enable auto white balance
 * - [post] save camera settings
 * - [post] consumer_dropoffimager (image selection box)
 */

export const lassoCameraApi = {
  postAutoWhiteBalance: (cameraId: string, value: number) => 
    api.post(`/${cameraId}/set`, { value }),
  postUpdateApertureStatus: (aperture_id: string, status: string) => 
    api.post('/update_aperture_status', { aperture_id, status }),
  postRemoveAperture: (aperture_id: string) => 
    api.post('/remove_aperture', { aperture_id }),
  postSetWorldRefpoint: (key: string) => 
    api.post('/set_world_refpoint', { key }),
  postCalibrate: () =>
    api.post('/calibrate'),
  getWafer: () => 
    api.get("/get_wafer").then((res) => res.data),
  getNavigatorData: () => 
    api.get("/get_navigator_data").then((res) => res.data), 
};
