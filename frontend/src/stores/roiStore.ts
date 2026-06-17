import { create } from "zustand";

interface RoiState {
  rois: "Consumer_dropoffimager" | "Consumer_lassorecorder";
  setRois: (rois: "Consumer_dropoffimager" | "Consumer_lassorecorder") => void;
  dropoffActiveColorIndex: number;
  setDropoffActiveColorIndex: (index: number) => void;
  lassoActiveColorIndex: number;
  setLassoActiveColorIndex: (index: number) => void;
}

export const useRoiStore = create<RoiState>((set) => ({
  rois: "Consumer_dropoffimager",
  dropoffActiveColorIndex: 0,
  lassoActiveColorIndex: 2,
  setRois: (rois) => set({ rois }),
  setDropoffActiveColorIndex: (index) =>
    set({ dropoffActiveColorIndex: index }),
  setLassoActiveColorIndex: (index) => set({ lassoActiveColorIndex: index }),
}));
