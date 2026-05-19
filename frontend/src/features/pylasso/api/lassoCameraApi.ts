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
  postMoveToStatePosition: (state_name: string) =>
    api.post('/move_to_state_position', { state_name }),
  postStorePosition: (condition: string) =>
    api.post('/store_position', { condition }),
  postHomeAllAxes: () =>
    api.post('/lasso_home_all_axes'),
  postStopAllAxes: () =>
    api.post('/lasso_stop_all_axes'),
  postHomeAxis: (axis: string) =>
    api.post('/home_axis', { axis }),
  postStopAxis: (axis: string) =>
    api.post('/stop_axis', { axis }),
  postGuiUpdateSpeed: (axis: 'X' | 'Y' | 'Z', speed: number) =>
    api.post('/gui_update_speed', { axis, speed }),
  getWafer: () => 
    api.get("/get_wafer").then((res) => res.data),
  getNavigatorData: () => 
    api.get("/get_navigator_data").then((res) => res.data), 
  getLassoData: () => 
    api.get("/get_lasso_data").then((res) => res.data), 
};
