from pymongo import IndexModel

from beanie import Document, Indexed, PydanticObjectId


class ToolRating(Document):
    """Один рейтинг користувача для інструменту (1–5 зірочок)."""
    tool_id: Indexed(PydanticObjectId)  # type: ignore[valid-type]
    user_id: Indexed(PydanticObjectId)  # type: ignore[valid-type]
    value: int  # 1..5

    class Settings:
        name = "tool_ratings"
        indexes = [
            IndexModel([("tool_id", 1), ("user_id", 1)], unique=True),
        ]
