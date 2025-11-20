import { api } from "../../../lib/client";
export const stageApi = {
  postPosition: (stageId: string, value: Record<string, number>) =>
    api.post(`/${stageId}/set_position`, { value }),
  
  postVelocity: (stageId: string, value: Record<string, number>) =>
    api.post(`/${stageId}/set_velocity`, { value }),

  postRange: (stageId: string, value: Record<string, number[]>) =>
    api.post(`/${stageId}/set_range`, { value }),

  getVelocity: (stageId: string) =>
    api.get(`/${stageId}/velocity`).then((res) => res.data),

  getMaxVelocity: (stageId: string, axis: string) =>
    api.get(`/${stageId}/max_velocity`, {params:{axis}}).then((res) => res.data),


  getRange: (stageId: string) =>
    api.get(`/${stageId}/range`).then((res) => res.data),

};