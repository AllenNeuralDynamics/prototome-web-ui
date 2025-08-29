import { configureStore } from "@reduxjs/toolkit";
import { positionsReducer, rangesReducer } from "../features/stage/index.js";

export const store = configureStore({
  reducer: {
    positions: positionsReducer,
    range: rangesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
