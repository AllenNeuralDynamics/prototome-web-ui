from backend.services.zmq_agent import DeviceProxy
from fastapi import APIRouter, Response
from pydantic import BaseModel

router = APIRouter()

instrument_proxy = DeviceProxy()


class ValuePayload(BaseModel):
    value: float

@router.get("/acquisition_control/state")
async def get_state():
    return {"state": instrument_proxy.current_state()}

@router.post("/acquisition_control/facing")
async def set_facing():
    instrument_proxy.set_facing()

@router.post("/acquisition_control/cutting")
async def set_cutting():
    instrument_proxy.set_cutting()

@router.post("/acquisition_control/start")
async def set_start():
    instrument_proxy.start()

@router.post("/acquisition_control/stop")
async def set_stop():
    instrument_proxy.stop()

@router.post("/acquisition_control/safe_stop")
async def set_safe_stop():
    instrument_proxy.safe_stop()

@router.post("/acquisition_control/cut_one")
async def set_cut_one():
    instrument_proxy.cut_one()

@router.post("/acquisition_control/repeat_cut")
async def set_repeat_cut():
    instrument_proxy.repeat_cut()