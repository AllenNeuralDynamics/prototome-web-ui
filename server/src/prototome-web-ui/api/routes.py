from typing import Any

from fastapi import APIRouter, HTTPException, Request
from one_liner.client import RouterClient

from prototome_web_ui_config_model import PrototomeWebUiConfig
from .webrtc import handle_offer


def make_router(config: PrototomeWebUiConfig, client: RouterClient) -> APIRouter:
    router = APIRouter(prefix="/api")

    @router.post("/offer")
    async def offer(request: Request) -> dict[str, str]:
        return await handle_offer(client, request)

    @router.get("/ui_config")
    async def ui_config() -> dict[str, Any]:
        return config.model_dump()

    for path, call_name in config.gets.items():

        def make_get(cn: str = call_name) -> Any:
            async def endpoint(request: Request, element_id: str | None = None) -> Any:
                try:
                    return client.call_by_name(
                        cn.format(element_id=element_id),
                        kwargs=dict(request.query_params),
                    )
                except Exception as e:
                    raise HTTPException(status_code=400, detail=str(e))

            return endpoint

        router.add_api_route(path, make_get(), methods=["GET"])

    for path, call_name in config.posts.items():

        def make_post(cn: str = call_name) -> Any:
            async def endpoint(element_id: str | None = None, kwargs: dict[str, Any] | None = None) -> Any:
                try:
                    client.call_by_name(
                        cn.format(element_id=element_id),
                        kwargs=kwargs,
                    )
                except Exception as e:
                    raise HTTPException(status_code=400, detail=str(e))

            return endpoint

        router.add_api_route(path, make_post(), methods=["POST"])

    return router
