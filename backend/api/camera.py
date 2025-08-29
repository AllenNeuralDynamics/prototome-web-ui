from backend.services.zmq_agent import DeviceProxy
from fastapi import APIRouter, Response
from pydantic import BaseModel

router = APIRouter()

# TODO: Load in config which contains camera host. That way if cameras are seperate 
# from instrument, can still be loaded. Does that make sense?

camera_client = DeviceProxy()


class ValuePayload(BaseModel):
    value: float

@router.post("/camera/{camera_id}/start")
async def start(camera_id: str):
    camera_client.start_camera(camera_id)
    return {"status": "ok"}

@router.post("/camera/{camera_id}/stop")
async def stop(camera_id: str):
    camera_client.stop_camera(camera_id)
    return {"status": "ok"}

@router.post("/camera/{camera_id}/exposure")
async def set_exposure_time(camera_id: str, value: ValuePayload):
    camera_client.set_exposure_time(camera_id, value.value)
    return {"status": "ok"}

@router.post("/camera/{camera_id}/gain")
async def set_gain(camera_id: str, value: ValuePayload):
    camera_client.set_gain(camera_id, value.value)
    return {"status": "ok"}