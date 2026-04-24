import { create } from "zustand";
import type { PrototomeConfig } from "@/types/prototomeConfig";

interface PrototomeConfigState {
  config: PrototomeConfig | null;
  setConfig: (config: PrototomeConfig | null) => void;
}

export const usePrototomeConfigStore = create<PrototomeConfigState>((set) => ({
  config: null,
  setConfig: (cfg) => set({ config: cfg }),
}));
