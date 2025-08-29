import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Websocket connection 

let socket;

export const connectFrameSocket = (dispatch) => {
  socket = new WebSocket("ws://localhost:8000/ws/camera_frame");

  socket.onopen = () => {
    console.log("Camera WebSocket connected");
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log("Frame Update:", msg);
    dispatch(
        cameraFrameUpdated({
        cameraId: msg.camera_id,
        frame: msg.frame
      })
    )
  };

  socket.onclose = () => {
    console.log("Camera WebSocket closed, reconnecting...");
    setTimeout(() => connectFrameSocket(dispatch), 2000); // auto-reconnect
  };
};

export interface InstrumentCameraFrames {
  [cameraId: string]: Blob;
}

interface CameraFrames {
  data: InstrumentCameraFrames;
  loading: boolean;
  error: string | undefined;
}

const initialState: CameraFrames = {
  data: {},
  loading: false,
  error: undefined,
};

const framesSlice = createSlice({
  name: "frames",
  initialState,
  reducers: {
    cameraFrameUpdated: (
      state,
      action: PayloadAction<{
        cameraId: string;
        frame: Blob;
      }>,
    ) => {
      const { cameraId, frame } = action.payload;
      state.data[cameraId] = frame;
    },
  }
});

export const { cameraFrameUpdated } = framesSlice.actions;
export default framesSlice.reducer;