from datetime import UTC, datetime
from enum import StrEnum

from beanie import Document, Indexed, PydanticObjectId
from pydantic import HttpUrl


class ToolCategory(StrEnum):
    OSINT = "OSINT"
    ANALYTICS = "Аналітика"
    COMMUNICATIONS = "Комунікації"
    SECURITY = "Безпека"
    MONITORING = "Моніторинг"


class Tool(Document):
    name: str
    description: str = ""
    category: ToolCategory = ToolCategory.OSINT
    icon: str = "\U0001f527"
    tags: list[str] = []
    license: str | None = None
    github_url: HttpUrl | None = None
    official_url: HttpUrl | None = None
    download_url: HttpUrl | None = None
    readme_content: str | None = None
    about_content: str | None = None
    is_published: bool = False
    owner_id: Indexed(PydanticObjectId)  # type: ignore[valid-type]
    average_rating: float | None = None
    rating_count: int = 0
    created_at: datetime = datetime.now(UTC)
    updated_at: datetime = datetime.now(UTC)

    class Settings:
        name = "tools"
