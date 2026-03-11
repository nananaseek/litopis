from pymongo import IndexModel

from beanie import Document, Indexed, PydanticObjectId


class ToolFavorite(Document):
    """Улюблений інструмент користувача."""
    user_id: Indexed(PydanticObjectId)  # type: ignore[valid-type]
    tool_id: Indexed(PydanticObjectId)  # type: ignore[valid-type]

    class Settings:
        name = "tool_favorites"
        indexes = [
            IndexModel([("user_id", 1), ("tool_id", 1)], unique=True),
        ]
