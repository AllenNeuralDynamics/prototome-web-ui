from backend.services.zmq_agent import DeviceProxy
from fastapi import APIRouter, Response
from pydantic import BaseModel

router = APIRouter()
stage_client = DeviceProxy()

class ValuePayload(BaseModel):
    value: float

@router.get("/stage/{stage_id}/{axis}/pos")
async def get_pos(stage_id: str, axis: str):
    return {"position" : stage_client.get_pos(stage_id, axis)}

@router.post("/stage/{stage_id}/{axis}/pos")
async def set_pos(stage_id: str, axis: str, value: ValuePayload):
    stage_client.set_pos(stage_id, axis, value.value)
    return {"status": "ok"}

@router.get("/stage/{stage_id}/{axis}/min_pos")
async def set_min_pos(stage_id: str, axis: str):
    return {"position" : stage_client.get_min_pos(stage_id, axis)}

@router.get("/stage/{stage_id}/{axis}/max_pos")
async def set_min_pos(stage_id: str, axis: str):
    return {"position" : stage_client.get_max_pos(stage_id, axis)}
    

@router.post("/stage/{stage_id}/{axis}/min_pos")
async def set_min_pos(stage_id: str, axis: str, value: ValuePayload):
    stage_client.set_min_pos(stage_id, axis, value.value)
    return {"status": "ok"}

@router.post("/stage/{stage_id}/{axis}/max_pos")
async def set_max_pos(stage_id: str, axis: str, value: ValuePayload):
    stage_client.set_max_pos(stage_id, axis, value.value)
    return {"status": "ok"}

@router.get("/stage/{stage_id}/{axis}/velocity")
async def get_velocity(stage_id: str, axis: str):
    return {"velocity" : stage_client.get_velocity(stage_id, axis)}
    
@router.post("/stage/{stage_id}/{axis}/velocity")
async def set_velocity(stage_id: str, axis: str, value: ValuePayload):
    stage_client.set_velocity(stage_id, axis, value.value)
    return {"status": "ok"}