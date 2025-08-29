import { configureStore } from "@reduxjs/toolkit";
import { positionsReducer, rangesReducer } from "../features/stage/index.js";
import { framesReducer } from "../features/camera/index.js";

export const store = configureStore({
  reducer: {
    positions: positionsReducer,
    range: rangesReducer,
    frames: framesReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
