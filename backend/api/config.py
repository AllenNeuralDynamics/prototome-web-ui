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
    # TODO: Grab config from somewhere else
    config_text = Path("./dev/web_ui_config.json").read_text()
    return json.loads(config_text)

