import zmq
import threading


class ZMQAgent:
    def __init__(self, rep_port=6000, pub_port=6001, auto_register=True, start_background=True):
        self.context = zmq.Context()
        self.rep_socket = self.context.socket(zmq.REP)
        self.rep_socket.bind(f"tcp://localhost:{rep_port}")
        
        self.pub_socket = self.context.socket(zmq.PUB)
        self.pub_socket.bind(f"tcp://*:{pub_port}")

        
        self.methods = {}
        self._running = False
        self._thread = None

        if auto_register:
            self.register_all_methods()

        if start_background:
            self.start()

    def register_all_methods(self):
        for attr_name in dir(self):
            if not attr_name.startswith("_"):
                attr = getattr(self, attr_name)
                if callable(attr):
                    self.register(attr_name, attr)

    def register(self, name, fn):
        self.methods[name] = fn

    def serve_forever(self):
        self._running = True
        while self._running:
            try:
                msg = self.rep_socket.recv_pyobj()
                method = msg.get("method")
                args = msg.get("args", [])
                kwargs = msg.get("kwargs", {})

                if method == "__dir__":
                    # Return list of registered methods
                    self.rep_socket.send_pyobj(list(self.methods.keys()))
                    continue

                if method in self.methods:
                    try:
                        result = self.methods[method](*args, **kwargs)
                        self.rep_socket.send_pyobj({"result": result})
                    except Exception as e:
                        self.rep_socket.send_pyobj({"error": str(e)})
                else:
                    self.rep_socket.send_pyobj({"error": f"Unknown method: {method}"})
            except zmq.ZMQError:
                # Socket closed or interrupted
                break

    def start(self):
        if self._thread is None or not self._thread.is_alive():
            self._thread = threading.Thread(target=self.serve_forever, daemon=True)
            self._thread.start()

    def stop(self):
        self._running = False
        self.rep_socket.close()
        self.context.term()
        if self._thread is not None:
            self._thread.join()

    # Example method
    def print_hi(self):
        print("hi")