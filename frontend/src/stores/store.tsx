import { configureStore } from "@reduxjs/toolkit";
import positionsReducer from "../features/stage/stores/positionSlice.tsx";

export const store = configureStore({
  reducer: {
    positions: positionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
