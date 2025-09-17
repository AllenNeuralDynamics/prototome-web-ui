import zmq
import zmq.asyncio
from threading import Lock
import asyncio
import time
from  pydantic import BaseModel
from typing import Any

class DeviceProxyMessage(BaseModel):
    destination: str
    payload: Any

class DeviceProxy:
    def __init__(self, host="localhost", req_port="6000", sub_port="6001"):
        self.address = f"tcp://{host}:{req_port}"
        self.context = zmq.Context()

        # REQ socket for RPC calls
        self.req_socket = self.context.socket(zmq.REQ)
        self.req_socket.connect(self.address)
        
        # SUB socket for receiving published updates
        self.async_context = zmq.asyncio.Context()
        self.sub_socket = self.async_context.socket(zmq.SUB)
        self.sub_socket.connect(f"tcp://localhost:{sub_port}")
        self.sub_socket.setsockopt_string(zmq.SUBSCRIBE, "")
    
        # Fetch remote method names and register
        self._add_remote_methods()

    async def listen(self):
        """Generator to yield messages from the PUB socket"""
        while True:
            msg: DeviceProxyMessage = await self.sub_socket.recv_pyobj()  # asyncio-friendly
            yield msg

    async def send(self, data: dict):
        
        if data["destination"] == "livestream":
            if data["value"]:
                self.start_camera(data["camera_id"])
            else: 
                self.stop_camera(data["camera_id"])
        
        elif data["destination"] == "exposure":
            self.set_exposure_time(data["camera_id"], data["value"])

        elif data["destination"] == "gain":
            self.set_gain(data["camera_id"], data["value"])

        elif data["destination"] == "position":
            pos = self.get_pos(data["stage_id"], data["axis"])

        elif data["destination"] == "position":
            pos = self.get_pos(data["stage_id"], data["axis"])

        elif data["destination"] == "range":
            if "value" in data.keys():
                self.set_min_pos(data["stage_id"], data["axis"], data["value"]["min"])
                self.set_max_pos(data["stage_id"], data["axis"], data["value"]["max"])
                self.get_range(data["stage_id"], data["axis"])
            else:
                rng = self.get_range(data["stage_id"], data["axis"])

        elif data["destination"] == "velocity":
            if "value" in data.keys():
                self.set_velocity(data["stage_id"], data["axis"], data["value"])
                self.get_velocity(data["stage_id"], data["axis"])
            else: 
                velocity = self.get_velocity(data["stage_id"], data["axis"])
           
    def _add_remote_methods(self):
        methods = self.get_remote_attributes()
        for method_name in methods:
            if isinstance(method_name, str) and not hasattr(self, method_name):
                setattr(self, method_name, self._make_proxy_method(method_name))

    def _make_proxy_method(self, method_name):
        """Return a synchronous proxy method"""
        def method(*args, **kwargs):
            return self.call_remote_method(method_name, *args, **kwargs)
        return method

    def call_remote_method(self, method_name, *args, **kwargs):
        packet = {"method": method_name, "args": args, "kwargs": kwargs}
        self.req_socket.send_pyobj(packet)
        reply = self.req_socket.recv_pyobj()
        if "error" in reply:
            raise RuntimeError(f"Remote error: {reply['error']}")
        return reply.get("result")

    def get_remote_attributes(self):
        self.req_socket.send_pyobj({"method": "__dir__"})
        return self.req_socket.recv_pyobj()

    def close(self):
        self.req_socket.close()
        self.sub_socket.close()
        self.context.term()
