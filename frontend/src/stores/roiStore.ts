import { create } from "zustand";

type Roi = {
  id: string;
  name: string;
  colorIndex: number;
  positions: RoiBoxPosition | null;
};

interface RoiBoxPosition {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface RoiStore {
  rois: Roi[];
  selectedRoi: string;
  setSelectedRoi: (id: string) => void;
  addRoi: (roi: Roi) => void;
  updateRoi: (id: string, updatedRoi: Partial<Roi>) => void;
}

export const useRoiStore = create<RoiStore>((set) => ({
  rois: [],
  selectedRoi: "",
  setSelectedRoi: (id) => set({ selectedRoi: id }),
  addRoi: (roi) =>
    set((state) =>
      state.rois.some((r) => r.id === roi.id)
        ? state
        : { rois: [...state.rois, roi] },
    ),
  updateRoi: (id, updatedRoi) =>
    set((state) => ({
      rois: state.rois.map((roi) =>
        roi.id === id ? { ...roi, ...updatedRoi } : roi,
      ),
    })),
}));
