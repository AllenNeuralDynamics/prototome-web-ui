from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.camera import camera_client, router as camera_router
from backend.api.stage import stage_client, router as stage_router
from backend.api.config import router as config_router

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(camera_router)
app.include_router(stage_router)
app.include_router(config_router)



