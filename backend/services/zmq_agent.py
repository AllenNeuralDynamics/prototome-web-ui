import zmq
from threading import Lock

class DeviceProxy:
    def __init__(self, host="localhost", port="6000"):
        self.address = f"tcp://{host}:{port}"
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.REQ)
        self.socket.connect(self.address)

        # Fetch remote method names and add them as methods
        self._add_remote_methods()


    def _add_remote_methods(self):
        methods = self.get_remote_attributes()
        for method_name in methods:
            # Skip if method already exists on instance
            print(method_name)
            if hasattr(self, method_name):
                continue
            # Create a proxy method
            setattr(self, method_name, self._make_proxy_method(method_name))

    def _make_proxy_method(self, method_name):
        def method(*args, **kwargs):
            return self.call_remote_method(method_name, *args, **kwargs)
        return method

    def call_remote_method(self, method_name, *args, **kwargs):
        packet = {
            "method": method_name,
            "args": args,
            "kwargs": kwargs
        }
        self.socket.send_pyobj(packet)
        reply = self.socket.recv_pyobj()
        if "error" in reply:
            raise RuntimeError(f"Remote error: {reply['error']}")
        return reply.get("result")

    def get_remote_attributes(self):
        self.socket.send_pyobj({"method": "__dir__"})
        return self.socket.recv_pyobj()

    def close(self):
        self.socket.close()
        self.context.term()

class ThreadProxy(DeviceProxy):
    def __init__(self, *args, **kwargs):
        self._lock = Lock()
        super().__init__(*args, **kwargs)

    def call_remote_method(self, method_name, *args, **kwargs):
        with self._lock:
            return super().call_remote_method(method_name, *args, **kwargs)