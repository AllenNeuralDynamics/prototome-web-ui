from pydantic import BaseModel


class RouteMetadata(BaseModel):
    name: str
    route: str | None
    params_schema: dict | None = None
    return_schema: dict | None = None
    description: str | None = None


class StreamModel(RouteMetadata):
    frequency_hz: float | None = None
    encoding: str
    enabled: bool


class RPCModel(RouteMetadata):
    pass
