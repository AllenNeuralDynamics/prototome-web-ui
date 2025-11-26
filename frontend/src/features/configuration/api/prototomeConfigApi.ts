import { api } from "../../../lib/client.tsx";
import type { PrototomeConfig } from "../../../types/configTypes.tsx"

export const prototomeConfigApi = {
  postConfig: (value: PrototomeConfig) =>
    api.post(`/set_prototome_config`, { value }),
  getConfig: (): Promise<PrototomeConfig> =>
    api.get<PrototomeConfig>(`/get_prototome_config`).then((res) => res.data),
};
