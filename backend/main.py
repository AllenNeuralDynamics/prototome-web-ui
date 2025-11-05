from fastapi import FastAPI, WebSocket, WebSocketDisconnect, APIRouter, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from backend.api.config import router as config_router
from contextlib import asynccontextmanager
import asyncio
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCDataChannel, VideoStreamTrack
from av import VideoFrame
import numpy as np
from aiortc.contrib.media import MediaRelay
import cv2
import json
import asyncio
from one_liner.client import RouterClient
import zmq
import zmq.asyncio

# instantiate router client 
router_client = RouterClient()

stop_event = asyncio.Event()
tasks = []

@asynccontextmanager
async def lifespan(app: FastAPI):   # sup up lifespan function to kill tasks at end of app
    yield

    stop_event.set()
    # cancel when app shuts down
    for task in tasks:
        task.cancel()


def configure_stream_polling(stream_name: str) -> zmq.asyncio.Poller:
    """
        Add stream to client and configure poller for stream

        :param stream_name: name for client stream
    """

    router_client.configure_stream(stream_name, storage_type="cache")
    socket = router_client.stream_client.sub_sockets[stream_name]
    poller = zmq.asyncio.Poller()
    poller.register(socket, zmq.POLLIN)
    return poller

async def data_channel_propagation(channel: RTCDataChannel) -> None:
    """
        Propagate msg from client through datachannel to front end

        :param channel: data channel to send message through     
    """
    poller = configure_stream_polling(channel.label)
    while not stop_event.is_set():
        if dict(await poller.poll(timeout=1000)):   # block until msgs in stream
            timestamp, msg = router_client.get_stream(channel.label)
            channel.send(json.dumps(msg))
   
       
async def video_propagation(stream_name: str, queue: asyncio.Queue) -> None:
    """
        Propagate frames from client to queue to front end

        :param stream_name: name of stream
        :param queue: queue to place frames     
    """
    poller = configure_stream_polling(stream_name)
    while not stop_event.is_set():
        if dict(await poller.poll(timeout=1000)):   # block until msgs in stream
            timestamp, frame = router_client.get_stream(stream_name)
            if queue.full():
                queue.get_nowait()
            queue.put_nowait(frame)
                        
# create VideoStreamTrack for livestreams
class ZMQStreamTrack(VideoStreamTrack):
    
    """
        VideoStreamTrack that streams frames received asynchronously from queue through aiortc to a WebRTC client.

        :param queue: queue containing RGB numpt arrays frames to be streamed.
    """
    
    kind = "video"

    def __init__(self, queue: asyncio.Queue[np.ndarray]):
        super().__init__()
        self.queue = queue

    async def recv(self):
        try: 
            pts, time_base = await self.next_timestamp()
            frame = await self.queue.get()  
            yuv_frame = await asyncio.to_thread(cv2.cvtColor, frame, cv2.COLOR_RGB2YUV_I420) # decreases encoding time to frontend
            video_frame = VideoFrame.from_ndarray(yuv_frame, format="yuv420p")
            video_frame.pts = pts
            video_frame.time_base = time_base
            return video_frame
        except Exception as e:
            print(e)
        

# wait for offer from client
offer_router = APIRouter()
@offer_router.post("/offer")
async def offer(request:Request):
    
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
        tasks.append(asyncio.create_task(data_channel_propagation(channel)))    # create asyncio task to poll stream for messages
        
        @channel.on("message")
        async def on_message(message):                                          # create handler to send messages from data_channel through stream
            router_client.call(**json.loads(message))

    for t in pc.getTransceivers():
        if t.kind == "video":   # configure video sources
            stream_name = params["transceiverMidMapping"][t.mid]
            queue = asyncio.Queue(maxsize=1)
            tasks.append(asyncio.create_task(video_propagation(stream_name, queue)))    # create asyncio task to poll stream for frames and add to queue
            track = ZMQStreamTrack(queue)
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
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(config_router)
app.include_router(offer_router)