import argparse
import json
import logging
from contextlib import asynccontextmanager
from importlib.resources import files
from pathlib import Path
from typing import Any

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from one_liner.client import RouterClient

from prototome_web_ui.api.routes import make_router
from prototome_web_ui.api.webrtc import cancel_tasks, stop_event
from prototome_web_ui.prototome_web_ui_config_model import PrototomeWebUiConfig

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI) -> Any:
    """Lifespan context: clean up tasks on shutdown"""
    yield
    stop_event.set()
    cancel_tasks()


def create_app(config: PrototomeWebUiConfig) -> FastAPI:
    """Create FastAPI app with config"""

    app = FastAPI(lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    router_client: RouterClient = RouterClient(**config.router_client_kwargs.model_dump())
    app.include_router(make_router(config, router_client))

    return app


def main():

    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, required=True)
    parser.add_argument("--log-level", type=str, default="INFO", choices=["INFO", "DEBUG"])
    parser.add_argument("--dev", action="store_true", default=False)

    args = parser.parse_args()

    logging.getLogger().setLevel(args.log_level.upper())

    with open(args.config) as f:
        config: PrototomeWebUiConfig = PrototomeWebUiConfig(**json.load(f))

    app = create_app(config)

    if not args.dev:
        static_path = files("prototome_web_ui") / "dist"
        ui_dir = Path(static_path)
        app.mount("/assets", StaticFiles(directory=ui_dir / "assets"), name="assets")

        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str) -> FileResponse:
            return FileResponse(ui_dir / "index.html")

    uvicorn.run(app, port=config.port, log_level=args.log_level.lower())


if __name__ == "__main__":
    main()
