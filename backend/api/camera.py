from fastapi import APIRouter, Depends
from main import get_router_client
import logging


logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/{camera_id}/set_exposure")
def set_exposure(camera_id:str, value: int, router_clinet: Depends[get_router_client]):
    router_clinet.call(obj_name=camera_id,
                       attr_name='set',
                       key='exposure',
                       value=value)

@router.post("/{camera_id}/set_gain")
def set_gain(camera_id:str, value: int, router_clinet: Depends[get_router_client]):
    router_clinet.call(obj_name=camera_id,
                       attr_name='set',
                       key='gain',
                       value=value)
    
@router.post("/{camera_id}/start_livestream")
def start_livestream(camera_id:str, router_clinet: Depends[get_router_client]):
    router_clinet.call(obj_name=camera_id,
                       attr_name='start_imaging')
    
@router.post("/{camera_id}/stop_livestream")
def stop_livestream(camera_id:str, router_clinet: Depends[get_router_client]):
    router_clinet.call(obj_name=camera_id,
                       attr_name='stop_imaging')
    
@router.get("/{camera_id}/exposure_min")
def get_exsposure_min(camera_id:str, router_clinet: Depends[get_router_client]):
    # TODO: implement correct call
    # router_clinet.call(obj_name=camera_id,
    #                    attr_name='get'
    #                    key="expos")
    pass
@router.get("/{camera_id}/exposure_max")
def get_exsposure_max(camera_id:str, router_clinet: Depends[get_router_client]):
    # TODO: implement correct call
    # router_clinet.call(obj_name=camera_id,
    #                    attr_name='get'
    #                    key="expos")
    pass
@router.get("/{camera_id}/exposure_step")
def get_exsposure_step(camera_id:str, router_clinet: Depends[get_router_client]):
    # TODO: implement correct call
    # router_clinet.call(obj_name=camera_id,
    #                    attr_name='get'
    #                    key="expos")
    pass

@router.get("/{camera_id}/gain_min")
def get_gain_min(camera_id:str, router_clinet: Depends[get_router_client]):
    # TODO: implement correct call
    # router_clinet.call(obj_name=camera_id,
    #                    attr_name='get'
    #                    key="expos")
    pass
@router.get("/{camera_id}/gain_max")
def get_gain_max(camera_id:str, router_clinet: Depends[get_router_client]):
    # TODO: implement correct call
    # router_clinet.call(obj_name=camera_id,
    #                    attr_name='get'
    #                    key="expos")
    pass
@router.get("/{camera_id}/gain_step")
def get_gain_step(camera_id:str, router_clinet: Depends[get_router_client]):
    # TODO: implement correct call
    # router_clinet.call(obj_name=camera_id,
    #                    attr_name='get'
    #                    key="expos")
    pass
