import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getPosition } from "../api/stageApi.tsx";
import { UseStagePositionsProps } from "../types/stageTypes.tsx";

type StagePositions = {
  [axes: string]: number;
};

export interface InstrumentStagePositions {
  [stageId: string]: StagePositions;
}

interface PositionsState {
  data: InstrumentStagePositions;
  loading: boolean;
  error: string | undefined;
}

const initialState: PositionsState = {
  data: {},
  loading: false,
  error: undefined,
};

export const fetchPositions = createAsyncThunk(
  "positions/fetchPositons",
  async ({ host, instrumentStages }: UseStagePositionsProps) => {
    const instrumentStagePositions: InstrumentStagePositions = {};
    for (const [stageId, axes] of Object.entries(instrumentStages)) {
      instrumentStagePositions[stageId] = {};
      for (const axis of axes) {
        instrumentStagePositions[stageId][axis] = await getPosition(
          host,
          stageId,
          axis,
        );
      }
    }
    return instrumentStagePositions;
  },
);

const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export default positionsSlice.reducer;
