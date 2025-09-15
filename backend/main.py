from fastapi import FastAPI, WebSocket, WebSocketDisconnect, APIRouter, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from backend.api.config import router as config_router
from backend.services.zmq_agent import DeviceProxy
from contextlib import asynccontextmanager
import asyncio
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc import VideoStreamTrack
from av import VideoFrame
import zmq
import numpy as np
from aiortc.contrib.media import MediaPlayer, MediaRelay
import cv2
import json

# instantiate router client 
router_client = DeviceProxy()

# instantiate socketio instance
pc = RTCPeerConnection()

# create dataChannels based on config for sending info to front end
config_channels = ["position", "min_pos", "max_pos", "camera_frame_web_camera"]
data_channels = {}

for channel in config_channels:
    data_channels[channel] = pc.createDataChannel(channel)

#begin listening to zmq router at begining of app 
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # define background task
#     async def zmq_listener():
#         async for msg in router_client.listen():
#             print("i gotta msg")
#             # await data_channels[msg["destination"]].send(msg["payload"])

#     # schedule it as a task in the event loop
#     task = asyncio.create_task(zmq_listener())

#     yield

#     # cancel when app shuts down
#     task.cancel()


# create MediaStreamTrack for camera
class ZMQCameraTrack(VideoStreamTrack):
    kind = "video"

    def __init__(self, zmq_endpoint):
        super().__init__()
        self.ctx = zmq.asyncio.Context()
        self.sub = self.ctx.socket(zmq.SUB)
        self.sub.connect(zmq_endpoint)
        self.sub.setsockopt_string(zmq.SUBSCRIBE, "camera_frame_web_camera")
    
    async def recv(self):
        # get timestamp for WebRTC
        pts, time_base = await self.next_timestamp()

        # receive the next frame from ZMQ
        id, msg = await self.sub.recv_multipart()
        
        jpg_bytes  = np.frombuffer(msg, dtype=np.uint8)
        frame_array = cv2.imdecode(jpg_bytes, cv2.IMREAD_COLOR)  
        video_frame = VideoFrame.from_ndarray(frame_array, format="rgb24")
        video_frame.pts = pts
        video_frame.time_base = time_base
    
        return video_frame

# wait for offer from client
offer_router = APIRouter()
@offer_router.post("/offer")
async def offer(request:Request):
    params = await request.json()
    offer_sdp = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    # create a new peer connection for this client
    pc = RTCPeerConnection()
    
    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        print("Connection state is", pc.connectionState)
        if pc.connectionState == "failed":
            await pc.close()

    def channel_handler(channel):
        @channel.on("message")
        async def on_message(message):
            await router_client.send(json.loads(message))
    pc.on("datachannel", channel_handler)

    await pc.setRemoteDescription(offer_sdp)
    for t in pc.getTransceivers():
        if t.kind == "video":
            # open media source
            webcam = ZMQCameraTrack("tcp://localhost:6001")
            relay = MediaRelay()
            video = relay.subscribe(webcam)
            pc.addTrack(video)

    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)


    return {
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type
    }



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(config_router)
app.include_router(offer_router)
