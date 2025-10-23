import asyncio
import struct
from aiortc.rtp import RtpPacket

class H264RtpTrack:
    """
    Zero-CPU H.264 RTP passthrough to an aiortc RTCRtpSender.
    """

    def __init__(self, sender, fps=30):
        """
        sender: aiortc RTCRtpSender object (must be H264)
        fps: target frames per second
        """
        self.sender = sender
        self.fps = fps
        self.sequence_number = 0
        self.timestamp = 0
        self.clock_rate = 90000  # H.264 default
        self.ts_increment = int(self.clock_rate / fps)
        self.mtu = 1200  # max RTP payload size in bytes

    async def send_frame(self, nal_unit: bytes):
        """
        Send one H.264 NAL unit (one video frame) as RTP packets.
        Handles fragmentation if nal_unit > MTU.
        """
        nal_size = len(nal_unit)

        if nal_size <= self.mtu:
            # single RTP packet
            packet = RtpPacket()
            packet.payload_type = 96  # dynamic type for H264
            packet.sequence_number = self.sequence_number
            packet.timestamp = self.timestamp
            packet.payload = nal_unit
            packet.marker = 1  # mark last packet of frame
            self.sender._transport._send_rtp(packet)
            self.sequence_number = (self.sequence_number + 1) % 65536
        else:
            # FU-A fragmentation
            nal_header = nal_unit[0]
            fu_indicator = (nal_header & 0xE0) | 28  # FU-A NAL type
            fu_header_start = 0x80 | (nal_header & 0x1F)
            fu_header_mid = nal_header & 0x1F
            fu_header_end = 0x40 | (nal_header & 0x1F)

            offset = 1
            while offset < nal_size:
                chunk_size = min(self.mtu - 2, nal_size - offset)
                chunk = nal_unit[offset:offset+chunk_size]
                fu_header = fu_header_mid
                if offset == 1:
                    fu_header = fu_header_start
                elif offset + chunk_size >= nal_size:
                    fu_header = fu_header_end

                packet = RtpPacket()
                packet.payload_type = 96
                packet.sequence_number = self.sequence_number
                packet.timestamp = self.timestamp
                packet.payload = bytes([fu_indicator, fu_header]) + chunk
                packet.marker = 1 if offset + chunk_size >= nal_size else 0
                await self.sender.transport._send_rtp(packet)

                self.sequence_number = (self.sequence_number + 1) % 65536
                offset += chunk_size

        self.timestamp = (self.timestamp + self.ts_increment) % 2**32

    async def send_loop(self, nal_queue: asyncio.Queue):
        """
        Continuously send NAL units from an asyncio queue.
        """
        while True:
            nal = await nal_queue.get()
            await self.send_frame(nal)
