import { api } from "../../../lib/client.tsx";
export const stageApi = {
  postPosition: (stageId: string, axis: string, position: number) =>
    api.post(`/${stageId}/set_position`, { axis, position }),
  
  postVelocity: (stageId: string, axis: string, speed: number) =>
    api.post(`/${stageId}/set_velocity`, { axis, speed }),

  postRange: (stageId: string, axis:string, range: number[]) =>
    api.post(`/${stageId}/set_range`, { axis, range }),

  getVelocity: (stageId: string, axis: string) =>
    api.get(`/${stageId}/velocity`, {params:{axis}}).then((res) => res.data),

  getMaxVelocity: (stageId: string, axis: string) =>
    api.get(`/${stageId}/max_velocity`, {params:{axis}}).then((res) => res.data),

  getRange: (stageId: string, axis: string) =>
    api.get(`/${stageId}/range`, {params:{axis}}).then((res) => res.data),

};