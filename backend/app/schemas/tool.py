from datetime import datetime

from pydantic import BaseModel, HttpUrl, model_validator

from app.models.tool import ToolCategory


class ToolCreate(BaseModel):
    name: str
    description: str = ""
    category: ToolCategory = ToolCategory.OSINT
    icon: str = "\U0001f527"
    tags: list[str] = []
    license: str | None = None
    github_url: HttpUrl | None = None
    official_url: HttpUrl | None = None
    download_url: HttpUrl | None = None

    @model_validator(mode="after")
    def at_least_one_url(self):
        if not self.github_url and not self.official_url:
            raise ValueError("Потрібно вказати GitHub URL або офіційний сайт")
        return self


class ToolUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: ToolCategory | None = None
    icon: str | None = None
    tags: list[str] | None = None
    license: str | None = None
    github_url: HttpUrl | None = None
    official_url: HttpUrl | None = None
    download_url: HttpUrl | None = None
    about_content: str | None = None


class ToolResponse(BaseModel):
    id: str
    name: str
    description: str
    category: ToolCategory
    icon: str
    tags: list[str]
    license: str | None
    github_url: str | None
    official_url: str | None
    download_url: str | None
    is_published: bool
    owner_id: str
    created_at: datetime
    updated_at: datetime
    average_rating: float | None = None
    rating_count: int = 0
    user_rating: int | None = None  # рейтинг поточного користувача (1–5), якщо є


class ToolRatingSet(BaseModel):
    value: int  # 1..5

    @model_validator(mode="after")
    def value_in_range(self):
        if not 1 <= self.value <= 5:
            raise ValueError("Рейтинг має бути від 1 до 5")
        return self


class ToolDetailResponse(ToolResponse):
    readme_content: str | None = None
    about_content: str | None = None
