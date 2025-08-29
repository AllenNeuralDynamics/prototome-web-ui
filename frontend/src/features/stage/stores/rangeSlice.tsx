import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getMinimumPosition,
  getMaximumPosition,
  postMaximumPosition,
  postMinimumPosition,
} from "../api/stageApi.tsx";
import { UseStageProps, PostApiArgs } from "../types/stageTypes.tsx";

type AxesRange = {
  min: number;
  max: number;
};

type StangeRange = {
  [axes: string]: AxesRange;
};

export interface InstrumentStageRanges {
  [stageId: string]: StangeRange;
}

interface RangesState {
  data: InstrumentStageRanges;
  initialized: boolean;
  loading: boolean;
  error: string | undefined;
}

const initialState: RangesState = {
  data: {},
  initialized: false,
  loading: false,
  error: undefined,
};

export const initializeRanges = createAsyncThunk(
  "range/initializeRange",
  async ({ host, instrumentStages }: UseStageProps) => {
    const instrumentStageRanges: InstrumentStageRanges = {};
    for (const [stageId, axes] of Object.entries(instrumentStages)) {
      instrumentStageRanges[stageId] = {};
      for (const axis of axes) {
        const min = await getMinimumPosition(host, stageId, axis);
        const max = await getMaximumPosition(host, stageId, axis);
        instrumentStageRanges[stageId][axis] = { min, max };
      }
    }
    return instrumentStageRanges;
  },
);

export const postMinPos = createAsyncThunk(
  "range/postMinPos",
  async ({ host, stageId, axis, value }: PostApiArgs) => {
    await postMinimumPosition(host, stageId, axis, value);
  },
);

export const postMaxPos = createAsyncThunk(
  "range/postMaxPos",
  async ({ host, stageId, axis, value }: PostApiArgs) => {
    await postMaximumPosition(host, stageId, axis, value);
  },
);

const rangesSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeRanges.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeRanges.fulfilled, (state, action) => {
        state.data = action.payload;
        state.initialized = true;
        state.loading = false;
      })
      .addCase(initializeRanges.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(postMinPos.fulfilled, (state, action) => {
        const { stageId, axis, value } = action.meta.arg;
        state.data[stageId][axis].min = value;
      })
      .addCase(postMaxPos.fulfilled, (state, action) => {
        const { stageId, axis, value } = action.meta.arg;
        state.data[stageId][axis].max = value;
      });
  },
});

export default rangesSlice.reducer;
