import asyncio
import json
import logging
from typing import Any

import zmq.asyncio
from aiortc import RTCDataChannel, RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiortc.contrib.media import MediaRelay
from aiortc.mediastreams import MediaStreamError
from av import VideoFrame
import cv2
import time
from fractions import Fraction

from fastapi import Request
from one_liner.client import RouterClient
import sys

logger = logging.getLogger(__name__)

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

stop_event: asyncio.Event = asyncio.Event()

# The following dictionaries correlate streams to a single "reader"
# The reader is responsible for being the sole receiver of the stream from the source and distributing it to all subscribers.
broadcasters: dict[str, asyncio.Task[Any]] = {}  # One reader task (val) per data-channel label (key)
video_sources: dict[str, "ZMQStreamTrack"] = {}  # One reader track (val) per video source (key)

# The following dictionaries manage the "subscribers" for each stream
# A subscriber is the RTCDataChannel/RTCPeerConnection object that receives the stream data
channel_subscribers: dict[str, set[RTCDataChannel]] = {}  # Set of subscribers (val) per data-channel label (key)
video_viewers: dict[str, set[RTCPeerConnection]] = {}  # Set of video viewers (val) per video source (key)

# Relay takes a VideoStream track and relays it to multiple subscribers (multiple session/tab)
relay = MediaRelay()

pcs: set[RTCPeerConnection] = set()

################################################################################
#
#   Clean up functions
#
################################################################################


def cancel_tasks() -> None:
    """Clean up all broadcaster tasks and clear the global dictionary of broadcasters."""
    for task in broadcasters.values():
        task.cancel()
    broadcasters.clear()


async def close_peer_connections() -> None:
    """Clean up all RTCPeerConnections by closing each one."""
    await asyncio.gather(*(close_pc(pc) for pc in list(pcs)))


async def close_pc(pc: RTCPeerConnection) -> None:
    """Clean up a single RTCPeerConnection by closing it and removing it from global tracking.

    This includes:
    - Removing the peer connection from the global set of peer connections
    - Removing the peer connection from the list of video viewers for each stream
    - Stopping the video source if it has no more viewers
    """
    # Remove the peer connection from the global set of peer connections
    pcs.discard(pc)

    # For each video stream: remove peer connection from the list of video viewers
    for stream_name, viewers in list(video_viewers.items()):
        viewers.discard(pc)
        if not viewers:
            del video_viewers[stream_name]
            source = video_sources.pop(stream_name, None)
            # Stop the video source if it has no more viewers
            if source:
                source.stop()
    # aiortc stops each sender's relay track on close, which unsubscribes it from the relay
    await pc.close()


################################################################################
#
#   Utility functions
#
################################################################################


def get_stream_poller(client: RouterClient, stream_name: str) -> zmq.asyncio.Poller:
    """Get a ZMQ poller for the given stream from the client."""
    if stream_name not in client.stream_client.sub_sockets:
        client.configure_stream(stream_name, storage_type="cache")
    socket = client.stream_client.sub_sockets[stream_name]
    poller = zmq.asyncio.Poller()
    poller.register(socket, zmq.POLLIN)
    return poller


async def broadcast_stream(client: RouterClient, label: str) -> None:
    """Function to broadcast a stream to all subscribed RTCDataChannels."""
    poller = get_stream_poller(client, label)
    # Grab list of subscribers for this stream label (each tab connected to server)
    subscribers = channel_subscribers.setdefault(label, set())
    while not stop_event.is_set():
        if dict(await poller.poll(timeout=1000)):
            # Get stream data from RouterClient and send it to all subscribers
            _, msg = client.get_stream(label)
            payload = json.dumps(msg)
            for channel in list(subscribers):
                if channel.readyState == "open":
                    channel.send(payload)


def subscribe_channel(client: RouterClient, channel: RTCDataChannel) -> None:
    """
    Subscribe a RTCDataChannel to a stream.

    Channel subscribers = (key: data channel label, value: set of RTCDataChannel objects)
    - Subscribers are different sessions (e.g., different tabs connected to the server).
    - Each RTCDataChannel represents a subscriber to the stream with the given label.
    - The label of the RTCDataChannel corresponds to the stream name in the RouterClient.

    Broadcasters = (key: stream label, value: asyncio.Task broadcasting the stream)
    - The task continuously polls the stream from the RouterClient and broadcasts it to all subscribers.
    - The task is created when the first subscriber for the label is added.
    - The task uses channel subscribers to get all subscribers (RTCDataChannel objects) that it should broadcast data to.
    """
    label = channel.label
    subscribers = channel_subscribers.setdefault(label, set())
    subscribers.add(channel)

    # Clean up callback for when data channel is closed.
    def on_close() -> None:
        # Remove the channel from the set of subscribers for this label.
        subscribers.discard(channel)

        # If there are no more subscribers for this label, cancel the broadcasting task.
        if not subscribers:
            task = broadcasters.pop(label, None)
            if task:
                task.cancel()

    channel.on("close", on_close)
    task = broadcasters.get(label)
    if task is None or task.done():
        broadcasters[label] = asyncio.create_task(broadcast_stream(client, label))


def get_video_source(client: RouterClient, stream_name: str) -> "ZMQStreamTrack":
    if stream_name not in video_sources:
        video_sources[stream_name] = ZMQStreamTrack(client, stream_name)
    return video_sources[stream_name]


class ZMQStreamTrack(VideoStreamTrack):
    """
    VideoStreamTrack that streams frames received asynchronously from queue through aiortc to a WebRTC client.

    :param queue: queue containing RGB numpy arrays frames to be streamed.
    """

    kind = "video"

    def __init__(self, client: RouterClient, stream_name: str):
        """
        Parameters
        ----------
        client:
            a `RouterClient` that is receiving camera data.
        stream_name:
            a stream from the associated `RouterClient` that returns a frame as
            a numpy ndarray.
        """
        super().__init__()
        self.stream_name = stream_name
        self.client = client
        self.poller = get_stream_poller(client, stream_name)

    async def recv(self):
        # Raising this makes MediaRelay end its read loop for this source
        if self.readyState != "live":
            raise MediaStreamError
        try:
            await self.poller.poll(timeout=-1)
            timestamp, frame = self.client.get_stream(self.stream_name)
            frame = await asyncio.to_thread(
                cv2.cvtColor, frame, cv2.COLOR_RGB2YUV_I420
            )  # decreases encoding time to frontend
            video_frame = VideoFrame.from_ndarray(frame, format="yuv420p")
            # webrtc rtp uses 90kHz as standard clock rate
            video_frame.pts = int(time.monotonic() * 90000)  # presentation timestamp
            video_frame.time_base = Fraction(1, 90000)  # duration of one timestamp
            return video_frame

        except Exception as e:
            logger.error(e)


################################################################################
#
#   Offer Handler
#
################################################################################


async def handle_offer(client: RouterClient, request: Request) -> dict[str, str]:

    # Create peer connection
    params = await request.json()
    pc = RTCPeerConnection()
    pcs.add(pc)

    # Set remote description from the offer received from the client
    # aiortc will use this remote description to set up the connection
    await pc.setRemoteDescription(RTCSessionDescription(sdp=params["sdp"], type=params["type"]))

    @pc.on("connectionstatechange")
    async def on_connectionstatechange() -> None:
        logger.info(f"Peer connection state: {pc.connectionState}")
        if pc.connectionState in ("failed", "closed"):
            await close_pc(pc)

    ################################################################################
    #   DATA CHANNEL
    ################################################################################
    #
    #   Data channels are created by the browser and received here.
    #   Once connection is established, the browser will send "open channel ..." to
    #   the server. These callbacks handle the incoming data channel events and
    #   connect them to the corresponding RouterClient stream using the channel.label
    #   (which should be the same as the RouterClient stream name).
    #

    @pc.on("datachannel")
    def on_datachannel(channel: RTCDataChannel) -> None:
        subscribe_channel(client, channel)

    ################################################################################
    #   VIDEO
    ################################################################################
    #
    #   Video is created by the server (this) and sends to the browser.
    #   The server use the ZMQStreamTrack to grab frames from RouterClient stream
    #   and this ZMQStreamTrack is attached to the media relay for distribution to all peers.
    #

    # MIDs are the identifiers for the media tracks in the SDP offer (they're just integers assigned by the browser).
    # Map the MIDs to the corresponding stream names for later use when configuring video tracks.
    mid_to_name = {m["mid"]: m["name"] for m in params.get("media", [])}
    for t in pc.getTransceivers():
        if t.kind == "video":  # configure video sources
            stream_name = mid_to_name[t.mid]
            video_viewers.setdefault(stream_name, set()).add(pc)
            # Unbuffered: each peer gets the latest frame, so a slow peer can't build up a backlog.
            pc.addTrack(relay.subscribe(get_video_source(client, stream_name), buffered=False))

    # Create and return answer
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    return {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
