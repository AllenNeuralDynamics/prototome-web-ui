import { api } from "../../../lib/client.tsx";
export const cameraApi = {
  postExposure: (camerId: string, value: number) =>
    api.post(`/${camerId}/set_exposure`, { value }),
  postGain: (camerId: string, value: number) =>
    api.post(`/${camerId}/set_gain`, { value }),
  startLivestream: (camerId: string) =>
    api.post(`/${camerId}/start_livestream`),
  stopLivestream: (camerId: string) => api.post(`/${camerId}/stop_livestream`),

  getMinExposure: (camerId: string): Promise<number> =>
    api.get<number>(`/${camerId}/exposure_min`).then((res) => res.data),
  getMaxExposure: (camerId: string): Promise<number> =>
    api.get<number>(`/${camerId}/exposure_max`).then((res) => res.data),
  getStepExposure: (camerId: string): Promise<number> =>
    api.get<number>(`/${camerId}/exposure_step`).then((res) => res.data),

  getMinGain: (camerId: string): Promise<number> =>
    api.get<number>(`/${camerId}/gain_min`).then((res) => res.data),
  getMaxGain: (camerId: string): Promise<number> =>
    api.get<number>(`/${camerId}/gain_max`).then((res) => res.data),
  getStepGain: (camerId: string): Promise<number> =>
    api.get<number>(`/${camerId}/gain_step`).then((res) => res.data),
};
