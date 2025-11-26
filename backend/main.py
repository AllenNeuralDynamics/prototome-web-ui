from fastapi import FastAPI, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.api.config import router as config_router
#from backend.api.camera import router as camera_router
from contextlib import asynccontextmanager
import asyncio
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCDataChannel, VideoStreamTrack
from av import VideoFrame
from aiortc.contrib.media import MediaRelay
import cv2
import json
import asyncio
import logging
from one_liner.client import RouterClient
import zmq
import zmq.asyncio
import time
from fractions import Fraction
from typing import Union

logger = logging.getLogger(__name__)

# instantiate router client 
#router_client = RouterClient(interface="10.132.17.9")
router_client = RouterClient()

# Make it available to all routers
def get_router_client() -> RouterClient:
    return router_client


stop_event = asyncio.Event()
tasks: list[asyncio.Task] = []

@asynccontextmanager
async def lifespan(app: FastAPI):   # sup up lifespan function to kill tasks at end of app
    yield

    stop_event.set()
    cancel_tasks(tasks)  # cancel when app shuts down


def cancel_tasks(tasks:list[asyncio.Task]):
    for task in tasks:
        task.cancel()


def configure_stream_polling(stream_name: str) -> zmq.asyncio.Poller:
    """
        Add stream to client and configure poller for stream

        :param stream_name: name for client stream
    """

    if stream_name not in router_client.stream_client.sub_sockets.keys():
        router_client.configure_stream(stream_name, storage_type="cache")
    socket = router_client.stream_client.sub_sockets[stream_name]
    poller = zmq.asyncio.Poller()
    poller.register(socket, zmq.POLLIN)
    return poller

async def propagate_data_channel(channel: RTCDataChannel) -> None:
    """
        Propagate msg from client through datachannel to front end

        :param channel: data channel to send message through     
    """
    poller = configure_stream_polling(channel.label)
    while not stop_event.is_set():
        if dict(await poller.poll(timeout=1000)):   # block until msgs in stream
            timestamp, msg = router_client.get_stream(channel.label)
            channel.send(json.dumps(msg))   
                        
# create VideoStreamTrack for livestreams
class ZMQStreamTrack(VideoStreamTrack):
    
    """
        VideoStreamTrack that streams frames received asynchronously from queue through aiortc to a WebRTC client.

        :param queue: queue containing RGB numpt arrays frames to be streamed.
    """
    
    kind = "video"

    def __init__(self, stream_name: str):
        super().__init__()
        self.stream_name = stream_name
        self.poller = configure_stream_polling(stream_name)
    
    async def recv(self):
        try: 
            await self.poller.poll(timeout=-1)
            timestamp, frame = router_client.get_stream(self.stream_name)
            frame = await asyncio.to_thread(cv2.cvtColor, frame, cv2.COLOR_RGB2YUV_I420) # decreases encoding time to frontend
            video_frame = VideoFrame.from_ndarray(frame, format="yuv420p")
            # webrtc rtp uses 90kHz as standard clock rate
            video_frame.pts = int(time.monotonic() * 90000) # presentation timestamp 
            video_frame.time_base = Fraction(1, 90000)      # duration of one timestamp
            return video_frame
            
        except Exception as e:
            print(e)
        

# wait for offer from client
offer_router = APIRouter()
@offer_router.post("/offer")
async def offer(request:Request):
    
    cancel_tasks(tasks) # cancel existing 
    tasks.clear()   # clear all tasks from previous loads
    
    params = await request.json()
    offer_sdp = RTCSessionDescription(sdp=params["sdp"], type=params["type"])   # create description of frontend connection
    pc = RTCPeerConnection()                    # create a new peer connection for this client
    await pc.setRemoteDescription(offer_sdp)    # set remote description of data channels and transceivers
    
    # set up handlers for connection events
    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        if pc.connectionState == "failed":
            await pc.close()
    
    # set up handlers for all data_channels on peer connection 
    @pc.on("datachannel")
    async def on_datachannel(channel):
        tasks.append(asyncio.create_task(propagate_data_channel(channel)))    # create asyncio task to poll stream for messages
        
        @channel.on("message")
        async def on_message(message):                                          # create handler to send messages from data_channel through stream
            msg = json.loads(message)
            logger.debug(f"Received: {msg}")
            router_client.call(**msg)
        
        @channel.on("error")
        async def error(e):                                          
           print(e, channel.label)
        
        @channel.on("close")
        async def close():                                          
           print("close", channel.label)
        
        @channel.on("open")
        async def open():                                          
           print("open", channel.label)


    for t in pc.getTransceivers():
        if t.kind == "video":   # configure video sources
            stream_name = params["transceiverMidMapping"][t.mid]
            track = ZMQStreamTrack(stream_name)
            relay = MediaRelay()
            video = relay.subscribe(track)
            pc.addTrack(video)
    
    answer = await pc.createAnswer() 
    await pc.setLocalDescription(answer)
   
    return {
        "sdp":pc.localDescription.sdp,
        "type": pc.localDescription.type
    }


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gets = {"/{element_id}/gain_min": "{element_id}_gain_min", 
        "/{element_id}/gain_max": "{element_id}_gain_max", 
        "/{element_id}/gain_step": "{element_id}_gain_step",
        "/{element_id}/exposure_min": "{element_id}_exposure_min", 
        "/{element_id}/exposure_max": "{element_id}_exposure_max", 
        "/{element_id}/exposure_step": "{element_id}_exposure_step", 
        "/{element_id}/velocity": "get_axis_velocity",
        "/{element_id}/max_velocity": "get_axis_max_velocity",
        "/{element_id}/range": "get_axis_travel_range",
        "/get_prototome_config": "get_prototome_config",
        "/get_prototome_state":"get_prototome_state"}

posts = {"/{element_id}/set_gain": "{element_id}_set_gain",
         "/{element_id}/set_exposure": "{element_id}_set_exposure",
         "/{element_id}/start_livestream": "{element_id}_start_livestream",
         "/{element_id}/stop_livestream": "{element_id}_stop_livestream", 
         "/{element_id}/set_position": "set_axis_position",
         "/{element_id}/set_velocity": "set_axis_velocity",
         "/cut_one":"cut_one",
         "/start_cutting":"start_cutting",
         "/pause_cutting":"pause_cutting",
         "/stop_cutting_safely":"stop_cutting_safely",
         "/stop_cutting_now":"stop_cutting_now",
         "/set_prototome_config": "set_prototome_config"
         }  

for path, call_name in posts.items():
    async def endpoint(element_id: str = None, kwargs: dict = None, call_name=call_name):
        call_name = call_name.format(element_id=element_id)
        router_client.call_by_name(call_name, kwargs=kwargs)
    app.add_api_route(path, endpoint, methods=["POST"])

for path, call_name in gets.items():
    async def endpoint(request: Request, element_id: str = None, call_name=call_name):
        call_name = call_name.format(element_id=element_id)
        kwargs = dict(request.query_params)
        return router_client.call_by_name(call_name, kwargs=kwargs)
    app.add_api_route(path, endpoint, methods=["GET"])

app.include_router(config_router)
app.include_router(offer_router)