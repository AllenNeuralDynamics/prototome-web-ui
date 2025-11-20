from fastapi import APIRouter, Depends
from main import get_router_client
import logging


logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/{stage_id}/set_position")
def set_position(stage_id:str, value: dict, router_clinet: Depends[get_router_client]):
    router_clinet.call(obj_name=stage_id,
                       attr_name='set',
                       key='exposure',
                       value=value)
    
@router.post("/{stage_id}/set_velocity")
def set_position(stage_id:str, value: dict, router_clinet: Depends[get_router_client]):
    router_clinet.call(obj_name=stage_id,
                       attr_name='set',
                       key='exposure',
                       value=value)
    

@router.get("/{camera_id}/gain_step")
def get_gain_step(camera_id:str, router_clinet: Depends[get_router_client]):
    # TODO: implement correct call
    # router_clinet.call(obj_name=camera_id,
    #                    attr_name='get'
    #                    key="expos")
    pass
