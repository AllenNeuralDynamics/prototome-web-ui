import logging
from typing import Any

import jsonref
from fastapi import APIRouter, Depends, HTTPException, Request
from one_liner.client import RouterClient

from prototome_web_ui.api.write_lock import (
    WriteLock,
    get_write_lock,
    record_activity,
    require_write,
)
from prototome_web_ui.config import Config
from prototome_web_ui.route_metadata_model import RPCModel, StreamModel
from .session import get_session_id
from .webrtc import handle_offer


def make_router(config: Config, client: RouterClient) -> APIRouter:
    """
    Construct endpoints for RPCs, streams, webRTC offer, and metadata endpoints.
    """
    router = APIRouter(prefix="/api")

    # Get stream and RPC configurations from the RouterServer
    streams = client.get_stream_configurations(as_dict=True)[1]
    periodic_streams = streams["periodic_streams"]  # only include periodic streams for now
    manual_streams = streams["manual_streams"]
    rpcs = client.get_rpc_configurations(as_dict=True)[1]

    def create_rpc_post_endpoint(
        call_name: str,
        description: str | None = None,
        params_schema: dict[str, Any] | None = None,
        access_type: str | None = None,
    ) -> Any:
        def make_post(call_name: str = call_name) -> Any:
            async def endpoint(kwargs: dict[str, Any] | None = None) -> Any:
                try:
                    return client.call_by_name(
                        call_name,
                        kwargs=kwargs,
                    )[1]  # omit timestamp
                except Exception as e:
                    raise HTTPException(status_code=400, detail=str(e))

            return endpoint

        # Add openapi_extra to include the request body schema in the OpenAPI documentation
        openapi_extra: dict[str, Any] | None = None
        if params_schema:
            # jsonref is used to remove any $ref references in the schema
            # OpenAPI can't handle individual $ref references
            params_schema = jsonref.replace_refs(params_schema).get("properties", {})
            openapi_extra = {
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "additionalProperties": False,
                                "properties": params_schema,
                            },
                        },
                    },
                },
            }

        router.add_api_route(
            f"/{call_name}",
            make_post(),
            methods=["POST"],
            description=description,
            openapi_extra=openapi_extra,
            # TODO: fix this logic
            # right now this is blocking all RPC calls if the browser doesn't have write access
            # implement the new one-liner and use access_type to determine whether its a GET or POST endpoint
            # afterwards, all POST endpoints should depend on require_write
            dependencies=[Depends(require_write)] + ([Depends(record_activity)] if access_type != "get" else []),
        )

    stream_models = {}
    rpc_models = {}

    for call_name in rpcs:
        # RPC model with schema and the endpoint corresponding to the RPC
        rpc_models[call_name] = RPCModel(
            name=call_name,
            route=f"/api/{call_name}",
            description=rpcs[call_name].get("description"),
            params_schema=rpcs[call_name].get("params_schema"),
            return_schema=rpcs[call_name].get("return_schema"),
        )
        create_rpc_post_endpoint(
            call_name,
            description=rpcs[call_name].get("description"),
            params_schema=rpcs[call_name].get("params_schema"),
            access_type=rpcs[call_name].get("access_type"),
        )
        logging.info(f"Added RPC endpoint: /api/{call_name}")

    for call_name in manual_streams:
        # Stream model with schema and the endpoint corresponding to the stream
        stream_models[call_name] = StreamModel(
            name=call_name,
            route=f"/api/{call_name}",
            params_schema=manual_streams[call_name].get("params_schema"),
            return_schema=manual_streams[call_name].get("return_schema"),
            description=manual_streams[call_name].get("description"),
            encoding=manual_streams[call_name].get("encoding"),
        )
        logging.info(f"Added QT stream endpoint: /api/{call_name}")

    for call_name in periodic_streams:
        # Stream model with schema and the endpoint corresponding to the stream
        stream_models[call_name] = StreamModel(
            name=call_name,
            route=f"/api/{call_name}",
            params_schema=periodic_streams[call_name].get("params_schema"),
            return_schema=periodic_streams[call_name].get("return_schema"),
            description=periodic_streams[call_name].get("description"),
            encoding=periodic_streams[call_name].get("encoding"),
            frequency_hz=periodic_streams[call_name].get("frequency_hz"),
            enabled=periodic_streams[call_name].get("enabled", True),
        )

    ################################################################################
    #
    #   Additional endpoints
    #
    ################################################################################

    # WebRTC offer endpoint - triggers the creation of a WebRTC connection and returns the answer
    @router.post("/offer")
    async def offer(request: Request) -> dict[str, str]:
        return await handle_offer(client, request)

    @router.get("/config", tags=["Config"])
    def get_config() -> dict[str, Any]:
        """Get UI config."""
        return config.model_dump()

    @router.get("/streams")
    async def streams_endpoint() -> dict[str, Any]:
        """Return the stream model with metadata and route info"""
        return stream_models

    @router.get("/rpcs")
    async def rpcs_endpoint() -> dict[str, Any]:
        """Return the RPC model with metadata and route info"""
        return rpc_models

    @router.get("/get_write_token")
    async def read_write_token_status(
        session_id: str = Depends(get_session_id), write_lock: WriteLock = Depends(get_write_lock)
    ) -> dict[str, bool]:
        if write_lock.is_holder(session_id):
            return {"has_token": True}
        return {"has_token": False}

    @router.post("/get_write_token")
    async def get_write_token(
        session_id: str = Depends(get_session_id), write_lock: WriteLock = Depends(get_write_lock)
    ) -> dict[str, bool]:
        if write_lock.acquire(session_id):
            return {"has_token": True}
        return {"has_token": False}

    @router.post("/renew_write_token")
    async def renew_write_token(
        session_id: str = Depends(get_session_id), write_lock: WriteLock = Depends(get_write_lock)
    ) -> dict[str, bool]:
        return {"has_token": write_lock.renew(session_id)}

    return router
