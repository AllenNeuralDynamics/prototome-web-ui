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
import asyncio
from one_liner.client import RouterClient
import zmq

# instantiate router client 
# router_client = DeviceProxy()
router_client = RouterClient()

# empty data channels to populate upon offer
data_channels = {}

# frame queues ZMQCameraTrack can pull from
frame_queue = {}

#begin listening to zmq router at begining of app 
@asynccontextmanager
async def lifespan(app: FastAPI):
    stop_event = asyncio.Event()
    
    # define background task
    async def zmq_listener():
            while True:
                try:
                    # iterate through all data channels
                    for ch_name, ch in data_channels.items():
                        try:
                            msg = router_client.get_stream(ch_name)
                        except zmq.Again:
                            continue
                        ch.send(json.dumps(msg[1]))

                    # # iterate through all frame queues
                    # for frame_name, frame_queue in frame_queue.items():
                    #     msg = await router_client.get_stream(frame_name)
                    #     if not frame_queue.full():
                    #         await frame_queue.put(msg["payload"])
                except Exception as e:
                    print(str(e))
                await asyncio.sleep(1)

        # async for msg in router_client.listen():
        #     if (key := msg["destination"]) in data_channels.keys():
        #         data_channels[key].send(json.dumps(msg["payload"]))
        #     elif (key := msg["destination"]) in frame_queue.keys():
        #         if frame_queue[key].full():
        #             return
        #         await frame_queue[key].put(msg["payload"])
                
    # schedule it as a task in the event loop
    task = asyncio.create_task(zmq_listener())

    yield

    # cancel when app shuts down
    task.cancel()


# create MediaStreamTrack for camera
class ZMQCameraTrack(VideoStreamTrack):
    kind = "video"

    def __init__(self, frame_queue: asyncio.Queue, cam_id: str):
        super().__init__()
        self.queue = frame_queue
        self.cam_id = cam_id

    async def recv(self):
        # get timestamp for WebRTC
        pts, time_base = await self.next_timestamp()

        # receive the next frame from ZMQ
        msg = await self.queue.get()
        jpg_bytes  = np.frombuffer(msg, dtype=np.uint8)
        frame_array = cv2.imdecode(jpg_bytes, cv2.IMREAD_COLOR)  
        video_frame = VideoFrame.from_ndarray(frame_array, format="rgb24")
        video_frame.pts = pts
        video_frame.time_base = time_base
        
        return video_frame

# wait for offer from client
offer_router = APIRouter()
@offer_router.post("/{element_id}/offer")
async def offer(element_id: str, request:Request):
    
    params = await request.json()
    offer_sdp = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    # create a new peer connection for this client
    pc = RTCPeerConnection()
    
    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        print("Connection state is", pc.connectionState)
        if pc.connectionState == "failed":
            await pc.close()

    @pc.on("datachannel")
    def on_datachannel(channel):
        data_channels[channel.label] = channel
        router_client.configure_stream(channel.label, storage_type="cache")
        
        @channel.on("open")
        def on_open():
            print("channel open:", channel.label)

        @channel.on("message")
        async def on_message(message):
            #await router_client.send(json.loads(message))
            print(message)
            #router_client.call(json.loads(message))

    await pc.setRemoteDescription(offer_sdp)
    for t in pc.getTransceivers():
        if t.kind == "video":
            # open media source
            frame_queue[f"frame_{element_id}"] = asyncio.Queue(maxsize=10)
            webcam = ZMQCameraTrack(frame_queue[f"frame_{element_id}"], element_id)
            relay = MediaRelay()
            video = relay.subscribe(webcam)
            pc.addTrack(video)
            
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)


    return {
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type
    }



app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(config_router)
app.include_router(offer_router)