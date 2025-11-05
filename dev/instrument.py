import cv2
import numpy as np
import json
import os
import keyboard

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")

with open(CONFIG_PATH, "r") as f:
    CONFIG_DEFAULT = json.load(f)


class Instrument:

    def __init__(self, config: dict = CONFIG_DEFAULT):
        self.cameras = {k: Camera(**cfg.get("kwds", {})) for k, cfg in config.items() if
                         type(cfg) == dict and cfg.get("type", None) == "camera"}
        self.stages = {k: Stage(**cfg.get("kwds", {})) for k, cfg in config.items() if
                        type(cfg) == dict and cfg.get("type", None) == "stage"}
        keyboard.on_press(self.joystick_moved)

        super().__init__()

    def joystick_moved(self, e):
        if e.name == "right":
            self.set_pos("fake_coarse_stage", "Z", self.stages["fake_coarse_stage"].positions["Z"] + -1)
        elif e.name == "left":
            self.set_pos("fake_coarse_stage", "Z", self.stages["fake_coarse_stage"].positions["Z"] + 1)
        elif e.name == "up":
            self.set_pos("fake_fine_stage", "Piezo", self.stages["fake_fine_stage"].positions["Piezo"] + 1)
        elif e.name == "down":
            self.set_pos("fake_fine_stage", "Piezo", self.stages["fake_fine_stage"].positions["Piezo"] + -1)

    def start_camera(self, cam_id):
        print(f"Starting camera {cam_id}.")

    def stop_camera(self, cam_id):
        print(f"Stopping camera {cam_id}")

    def grab_frame(self, cam_id) -> np.ndarray:
        return self.cameras[cam_id].grab_frame()

    def set_exposure_time(self, cam_id, value: float):
        self.cameras[cam_id].set_exposure_time(value)

    def set_gain(self, cam_id, value: float):
        self.cameras[cam_id].set_gain(value)

    def get_pos(self, stage_id: str, axis: str):
        return self.stages[stage_id].get_pos(axis)

    def set_pos(self, stage_id: str, axis: str, value: float):
        self.stages[stage_id].set_pos(axis, value)

    def get_range(self, stage_id: str, axis: str):
        rng = {"min":self.get_min_pos(stage_id, axis),
               "max":self.get_max_pos(stage_id, axis)}
        return rng

    def set_min_pos(self, stage_id: str, axis: str, value: float):
        self.stages[stage_id].set_min_pos(axis, value)

    def get_min_pos(self, stage_id: str, axis: str):
        return self.stages[stage_id].get_min_pos(axis)

    def set_max_pos(self, stage_id: str, axis: str, value: float):
        self.stages[stage_id].set_max_pos(axis, value)

    def get_max_pos(self, stage_id: str, axis: str):
        return self.stages[stage_id].get_max_pos(axis)

    def set_velocity(self, stage_id: str, axis: str, value: float):
        self.stages[stage_id].set_velocity(axis, value)

    def get_velocity(self, stage_id: str, axis: str):
        return self.stages[stage_id].get_velocity(axis)

    def get_travel_ranges(self):
        """Get all axis travel ranges. Assume axis names across stages are unique"""
        ranges = {}
        for stage_name, stage in self.stages.items():
            for axis_name in stage.positions.keys():
                ranges[axis_name] = self.get_range(stage_name, axis_name)
        return ranges

    def get_positions(self):
        """Get all axis positions. Assume axis names across stages are unique"""
        positions = {}
        for stage_name, stage in self.stages.items():
            for axis_name in stage.positions.keys():
                positions[axis_name] = stage.get_pos(axis_name)
        return positions

    def get_velocities(self):
        """Get all axis velocities. Assume axis names across stages are unique"""
        velocities = {}
        for stage_name, stage in self.stages.items():
            for axis_name in stage.velocity.keys():
                velocities[axis_name] = stage.get_velocity(axis_name)
        return velocities


class Camera:

    def __init__(self, exposure_range: dict,
                 gain_range: dict,
                 index=1):

        self.camera = cv2.VideoCapture(index)
        self.camera.set(cv2.CAP_PROP_AUTO_EXPOSURE, .25)  # 0.25 for manual exposure on some cameras
        self._exposure_time = 1
        self._gain = 0

    def grab_frame(self) -> np.ndarray:
        _, frame = self.camera.read()
        return frame

    def grab_frame_as_jpg(self) -> np.ndarray:
        frame = self.grab_frame()
        _, encoded = cv2.imencode(".jpg", frame)
        return encoded

    def set_exposure_time(self, value: float):
        self.camera.set(cv2.CAP_PROP_EXPOSURE, value)

    def get_exposure_time(self):
        return self.camera.get(cv2.CAP_PROP_EXPOSURE)

    def set_gain(self, value: float):
        self.camera.set(cv2.CAP_PROP_GAIN, value)

    def get_gain(self):
        return self.camera.get(cv2.CAP_PROP_GAIN)


class Stage:

    def __init__(self, axes: list[str]):

        self.positions = {axis: 10 for axis in axes}
        self.min_positions = {axis: 0 for axis in axes}
        self.max_positions = {axis: 100 for axis in axes}
        self.velocity = {axis: 10 for axis in axes}

    def get_pos(self, axis: str):
        return self.positions[axis]

    def set_pos(self, axis: str, value: float):
        if self.min_positions[axis] > value or value > self.max_positions[axis]:
            print(f"Stage pos {value} outside of bounds {self.min_positions[axis]} and {self.max_positions[axis]}")
            return
        self.positions[axis] = value

    def set_min_pos(self, axis: str, value: float):
        self.min_positions[axis] = value

    def set_max_pos(self, axis: str, value: float):
        self.max_positions[axis] = value

    def get_min_pos(self, axis: str):
        return self.min_positions[axis]

    def get_max_pos(self, axis: str):
        return self.max_positions[axis]

    def set_velocity(self, axis, value: float):
        self.velocity[axis] = value

    def get_velocity(self, axis):
        return self.velocity[axis]
