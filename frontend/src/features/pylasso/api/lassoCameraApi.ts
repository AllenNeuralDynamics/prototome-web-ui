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
};
