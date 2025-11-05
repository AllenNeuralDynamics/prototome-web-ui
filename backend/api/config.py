from fastapi import APIRouter
from pathlib import Path
from kazoo.client import KazooClient
from kazoo.handlers.threading import KazooTimeoutError
import json
import logging
import os

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/config")
def get_config():
    try:  # Pull config from Zookeeper.
        zk = KazooClient(hosts='eng-logtools:2181')
        zk.start()

        rig = os.environ.get("aibs_comp_id")
        if not rig:
            raise FileNotFoundError("aibs_comp_id unspecified.")
        config_path = Path(f"/rigs/{rig}/projects/prototome/configuration")
        data, _ = zk.get(config_path)
        zk.stop()
        return json.loads(data.decode("utf-8"))

    except (KazooTimeoutError, FileNotFoundError): # local fallback
        logger.warning(f"Could not fetch a remote config for {rig}. Falling "
                       "back to a local config.")
        config_text = Path("./dev/web_ui_config.json").read_text()
        return json.loads(config_text)

