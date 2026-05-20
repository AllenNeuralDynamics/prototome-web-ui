from typing import Literal

from pydantic import BaseModel, Field

Protocol = Literal["tcp", "inproc", "ipc", "ws", "wss"]


class Stage(BaseModel):
    axes: list[str]
    unit: str


class Camera(BaseModel):
    id: str


class RouterClientKwargs(BaseModel):
    protocol: Protocol = Field(default="tcp")
    interface: str = Field(default="localhost")
    rpc_port: str = Field(default="5555")
    broadcast_port: str = Field(default="5556")


class PrototomeWebUiConfig(BaseModel):
    router_client_kwargs: RouterClientKwargs = Field(default_factory=RouterClientKwargs)
    port: int = Field(default=8000)
    data_channels: list[str] = Field(default_factory=list)
    video_streams: list[str] = Field(default_factory=list)
    gets: dict[str, str] = Field(default_factory=dict)
    posts: dict[str, str] = Field(default_factory=dict)
    stage: Stage = Field()
    camera: Camera = Field()
    axis_variable_mapping: dict
