from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.api.camera import camera_client, router as camera_router
from backend.api.stage import stage_client, router as stage_router
from backend.api.config import router as config_router
import asyncio
from contextlib import asynccontextmanager

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



# --- Stage WebSockets---

stage_websockets: set[WebSocket] = set()


@app.websocket("/ws/stage_pos")
async def stage_pos_ws(websocket: WebSocket):
    await websocket.accept()
    stage_websockets.add(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass
    finally:
        stage_websockets.remove(websocket)

async def broadcast_stage_pos(msg: dict):
    dead = []
    for ws in stage_websockets:
        try:
            await ws.send_json(msg)
        except WebSocketDisconnect:
            dead.append(ws)
    for ws in dead:
        stage_websockets.remove(ws)

# --- Camera WebSockets---
camera_websockets: set[WebSocket] = set()


@app.websocket("/ws/camera_frame")
async def camera_frame_ws(websocket: WebSocket):
    await websocket.accept()
    stage_websockets.add(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass
    finally:
        camera_websockets.remove(websocket)

async def broadcast_camera_frame(msg: dict):
    dead = []
    for ws in camera_websockets:
        try:
            await ws.send_json(msg)
        except WebSocketDisconnect:
            dead.append(ws)
    for ws in dead:
        camera_websockets.remove(ws)


@app.on_event("startup")
async def start_stage_listener():
    async def forward_stage_updates():
        async for msg in stage_client.listen():
            if msg.get("type") == "stage_pos":
                await broadcast_stage_pos(msg)
        async for msg in camera_websockets.listen():
            if msg.get("type") == "camera_frame":
                await broadcast_camera_frame(msg)
    
    asyncio.create_task(forward_stage_updates())
