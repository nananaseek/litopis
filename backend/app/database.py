from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.models.favorite import ToolFavorite
from app.models.rating import ToolRating
from app.models.tool import Tool
from app.models.user import User

DOCUMENT_MODELS = [User, Tool, ToolRating, ToolFavorite]


async def init_db() -> AsyncIOMotorClient:
    client = AsyncIOMotorClient(settings.mongodb_url)
    await init_beanie(
        database=client[settings.mongodb_db_name],
        document_models=DOCUMENT_MODELS,
    )
    return client
