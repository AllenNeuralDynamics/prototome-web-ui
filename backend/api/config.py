from fastapi import APIRouter
from pathlib import Path
from kazoo.client import KazooClient
from kazoo.handlers.threading import KazooTimeoutError
import json
import os

router = APIRouter()

@router.get("/config")
def get_config():
    try:  # Pull config from Zookeeper.
        zk = KazooClient(hosts='eng-logtools:2181')
        zk.start()

        rig = os.environ.get("aibs_comp_id")
        if not rig:
            raise FileNotFoundError("aibs_comp_id unspecified.")
        config_path = f"/rigs/{rig}/projects/prototome/configuration"
        data, _ = zk.get(config_path)
        zk.stop()
        return json.loads(data.decode("utf-8"))

    except (KazooTimeoutError, FileNotFoundError): # local fallback
        config_text = Path("./dev/web_ui_config.json").read_text()
        return json.loads(config_text)

