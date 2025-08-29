from fastapi import APIRouter
from kazoo.client import KazooClient
from kazoo.handlers.threading import KazooTimeoutError
import json
import os

router = APIRouter()

@router.get("/config")
def get_config():
    # try: 
    #     zk = KazooClient(hosts='eng-logtools:2181')
    #     zk.start()

    #     rig = os.environ.get("aibs_comp_id")
    #     config_path = f"/rigs/{rig}/projects/prototome/configuration"
    #     data, _ = zk.get(config_path)
    #     zk.stop()
    #     return json.loads(data.decode("utf-8"))
    
    # except KazooTimeoutError:
         print("sdfgad")
         with open(r".\dev\web_ui_config.json", "r") as config:
            return json.load(config)
    