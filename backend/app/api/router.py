from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.tools import router as tools_router
from app.api.ws import router as ws_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(tools_router)
api_router.include_router(ws_router)
