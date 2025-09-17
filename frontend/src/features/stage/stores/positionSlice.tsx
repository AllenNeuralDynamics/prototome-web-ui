import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getPosition } from "../api/stageApi.tsx";
import { UseStageProps } from "../types/stageTypes.tsx";

// Websocket connection

let socket;

export const connectPositionSocket = (dispatch) => {
  // socket = new WebSocket("ws://localhost:8000/ws/stage_pos");
  // socket.onopen = () => {
  //   console.log("Stage WebSocket connected");
  // };
  // socket.onmessage = (event) => {
  //   const msg = JSON.parse(event.data);
  //   console.log("Stage update:", msg);
  //   dispatch(
  //     stagePositionUpdated({
  //       stageId: msg.stage_id,
  //       axis: msg.axis,
  //       position: msg.position,
  //     })
  //   )
  // };
  // socket.onclose = () => {
  //   console.log("Stage WebSocket closed, reconnecting...");
  //   setTimeout(() => connectPositionSocket(dispatch), 2000); // auto-reconnect
  // };
};

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

export const initializePosition = createAsyncThunk(
  "positions/fetchPositons",
  async ({ host, instrumentStages }: UseStageProps) => {
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
  reducers: {
    stagePositionUpdated: (
      state,
      action: PayloadAction<{
        stageId: string;
        axis: string;
        position: number;
      }>,
    ) => {
      const { stageId, axis, position } = action.payload;
      if (!state.data[stageId]) {
        state.data[stageId] = {};
      }
      state.data[stageId][axis] = position;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializePosition.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializePosition.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(initializePosition.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { stagePositionUpdated } = positionsSlice.actions;
export default positionsSlice.reducer;
