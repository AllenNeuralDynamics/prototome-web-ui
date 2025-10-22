from fastapi import FastAPI, WebSocket, WebSocketDisconnect, APIRouter, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from backend.api.config import router as config_router
from backend.services.zmq_agent import DeviceProxy
from contextlib import asynccontextmanager
import asyncio
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCDataChannel, VideoStreamTrack
from aiortc.rtcrtpsender import RTCRtpSender
from av import VideoFrame
import zmq
import numpy as np
from aiortc.contrib.media import MediaPlayer, MediaRelay
import cv2
import json
import asyncio
from one_liner.client import RouterClient
import zmq
from threading import Thread
import time

# instantiate router client 
router_client = RouterClient()

stop_event = asyncio.Event()
tasks = []
videos = []

#begin listening to zmq router at begining of app 
@asynccontextmanager
async def lifespan(app: FastAPI):

    yield

    stop_event.set()

    # cancel when app shuts down
    for task in tasks:
        task.cancel()


async def data_channel_propagation(channel: RTCDataChannel) -> None:
    """
        Propagate msg from client through datachannel to front end

        :param channel: data channel to send message through     
    """
    
    while not stop_event.is_set():
        await asyncio.sleep(0)
        try:
            msg = router_client.get_stream(channel.label)
            channel.send(json.dumps(msg[1]))
        except zmq.Again as e:
            continue
                
# create MediaStreamTrack for camera
class ZMQCameraTrack(VideoStreamTrack):
    kind = "video"

    def __init__(self, stream_name: str):
        super().__init__()
        stream_name = stream_name
        self.queue = asyncio.Queue(maxsize=1)
        loop = asyncio.get_event_loop()
        
        # Start the background ZMQ thread
        self._frame_thread = Thread(target=self._frame_loop, args=[stream_name, loop])
        self._frame_thread.start()
    
    def _frame_loop(self, stream_name: str, loop: asyncio.AbstractEventLoop) -> None:
        """
        Loop to grab frames 

        stream_name: name of stream to configure 
        loop: event loop of thread
        """

        frame_client = RouterClient()
        frame_client.configure_stream(stream_name, storage_type="cache")
        socket = frame_client.stream_client.sub_sockets[stream_name]
        socket.setsockopt(zmq.CONFLATE, 1)
        poller = zmq.Poller()
        poller.register(socket, zmq.POLLIN)
        
        while not stop_event.is_set():
            t0 = time.perf_counter()
            if socket in dict(poller.poll(timeout=1000)):   # block until msg in stream
                timestamp, frame = frame_client.get_stream(stream_name)
                yuv_frame = cv2.cvtColor(np.frombuffer(frame, dtype=np.uint8).reshape(1088, 2048, 3), 
                                         cv2.COLOR_RGB2YUV_I420)
                t1 = time.perf_counter()
                loop.call_soon_threadsafe(self.queue_frame, yuv_frame)
                t2 = time.perf_counter()

                #print(f"ZMQ recv: {(t1 - t0)*1000:.2f} ms | queue push: {(t2 - t1)*1000:.2f} ms")

    def queue_frame(self, frame: np.array) -> None:
        """
        Replace frame in queue from thread

        param frame: numpy array of latest image
        """

        if self.queue.full():
            _ = self.queue.get_nowait()
        self.queue.put_nowait(frame)

    def stop_thread(self):
        self._frame_thread.stop()

    async def recv(self):
        # get timestamp for WebRTC
        pts, time_base = await self.next_timestamp()
        t0 = time.perf_counter()
        try: 
            frame = await self.queue.get()  
            t1 = time.perf_counter()
            video_frame = VideoFrame.from_ndarray(frame, format="yuv420p")
            t2 = time.perf_counter()
            video_frame.pts = pts
            video_frame.time_base = time_base
            #print(f"Queue wait: {(t1 - t0)*1000:.2f} ms | frame convert: {(t2 - t1)*1000:.2f} ms")
            return video_frame
        except Exception as e:
            print("I'm an error!", e)

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

    @pc.on("datachannel")
    async def on_datachannel(channel):
        router_client.configure_stream(channel.label, storage_type="cache")
        tasks.append(asyncio.create_task(data_channel_propagation(channel)))

        @channel.on("message")
        async def on_message(message):
            router_client.call(**json.loads(message))

    await pc.setRemoteDescription(offer_sdp)
    for t in pc.getTransceivers():
        if t.kind == "video":
            # open media source
            stream_name = "new_frame"
            videos.append(ZMQCameraTrack(stream_name))
            relay = MediaRelay()
            video = relay.subscribe(videos[-1])
            sender = pc.addTrack(video)
            sender._encoder = {
            "preset": "ultrafast",
            "tune": "zerolatency"
        }
            sender._encoder_params = {"preset": "ultrafast", "tune": "zerolatency"}
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    sdp = pc.localDescription.sdp
    sdp = "\r\n".join(line for line in sdp.split("\r\n") if "nack" not in line.lower())

    return {
        "sdp":sdp,
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