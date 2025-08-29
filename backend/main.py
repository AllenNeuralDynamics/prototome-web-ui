from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.api.camera import camera_client, router as camera_router
from backend.api.stage import stage_client, router as stage_router
from backend.api.config import router as config_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(camera_router)
app.include_router(stage_router)
app.include_router(config_router)



# # --- Stage WebSockets---

@app.websocket("/ws/stage_pos")
async def stage_pos_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        async for msg in stage_client.listen():
            if msg.get("type") == "stage_pos":
                await websocket.send_json(msg)
    except WebSocketDisconnect:
        pass

# --- Camera WebSockets---
@app.websocket("/ws/camera_frame")
async def camera_frame_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        async for msg in camera_client.listen():
            if msg.get("type") == "camera_frame":
                await websocket.send_json(msg)
    except WebSocketDisconnect:
        pass

