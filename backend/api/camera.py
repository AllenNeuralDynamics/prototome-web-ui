from backend.services.zmq_agent import DeviceProxy
from fastapi import APIRouter, Response
from pydantic import BaseModel

router = APIRouter()

# TODO: Load in config which contains camera host. That way if cameras are seperate 
# from instrument, can still be loaded. Does that make sense?

camera_client = DeviceProxy()


class ValuePayload(BaseModel):
    value: float

@router.get("/camera/{camera_id}/frame")
async def get_frame(camera_id: str):
    return Response(content=camera_client.grab_frame(camera_id).tobytes(), media_type='image/jpeg')

@router.post("/camera/{camera_id}/exposure")
async def set_exposure_time(camera_id: str, value: ValuePayload):
    camera_client.set_exposure_time(camera_id, value.value)
    return {"status": "ok"}

@router.post("/camera/{camera_id}/gain")
async def set_gain(camera_id: str, value: ValuePayload):
    camera_client.set_gain(camera_id, value.value)
    return {"status": "ok"}