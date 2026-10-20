import argparse
import asyncio
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
from prototome_web_ui.api.session import ensure_session_cookie
from prototome_web_ui.api.webrtc import cancel_tasks, close_peer_connections, stop_event
from prototome_web_ui.api.write_lock import WriteLock
from prototome_web_ui.config import Config 

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


async def _expire_lease_and_token(write_lock: WriteLock, interval_s: float = 5.0) -> None:
    """Periodically check to see if lease and token should be expired.""" 
    while True:
        try:
            expired = write_lock.check_and_expire_lease_and_token()
            if expired:
                logger.info("Expired write lease and token")
        except Exception:
            logger.exception("Failed to release expired write lease")
        await asyncio.sleep(interval_s)


@asynccontextmanager
async def lifespan(app: FastAPI) -> Any:
    """Lifespan context: clean up tasks on shutdown"""
    sweeper = asyncio.create_task(_expire_lease_and_token(app.state.write_lock))
    yield
    sweeper.cancel()
    stop_event.set()
    cancel_tasks()
    await close_peer_connections()


def create_app(config: Config) -> FastAPI:
    """Create FastAPI app with config"""

    app = FastAPI(lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.middleware("http")(ensure_session_cookie)

    router_client: RouterClient = RouterClient(**config.server.router_client.model_dump())
    
    # TODO: allow users to define TTL and idle timeout in the config
    app.state.write_lock = WriteLock(client=router_client)
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
        config: Config = Config(**json.load(f))

    app = create_app(config)

    if not args.dev:
        static_path = files("prototome_web_ui") / "dist"
        ui_dir = Path(static_path)
        app.mount("/assets", StaticFiles(directory=ui_dir / "assets"), name="assets")

        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str) -> FileResponse:
            return FileResponse(ui_dir / "index.html")

    uvicorn.run(app, host="0.0.0.0", port=config.server.port, log_level=args.log_level.lower())


if __name__ == "__main__":
    main()
