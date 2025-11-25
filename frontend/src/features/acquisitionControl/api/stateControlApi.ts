import { api } from "../../../lib/client.tsx";
export const stateControlApi = {
  postCutOne: () =>
    api.post('/cut_one'),
  postStartCutting: () =>
    api.post('/start_cutting'),
  postPauseCutting: () =>
    api.post('/pause_cutting'),
  postStopCuttingSafely: () =>
    api.post('/stop_cutting_safely'),
  postStopCuttingNow: () =>
    api.post('/stop_cutting_now'),
    
};