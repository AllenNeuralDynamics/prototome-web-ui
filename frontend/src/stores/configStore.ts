import { create } from "zustand";
import type { AppConfig } from "@/types/configTypes.tsx";

interface ConfigState {
  config: AppConfig | null;
  setConfig: (config: AppConfig) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: null,
  setConfig: (cfg) => set({ config: cfg }),
}));
