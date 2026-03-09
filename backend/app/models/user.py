from datetime import UTC, datetime

from beanie import Document, Indexed
from pydantic import EmailStr


class User(Document):
    username: Indexed(str, unique=True)  # type: ignore[valid-type]
    email: Indexed(EmailStr, unique=True)  # type: ignore[valid-type]
    hashed_password: str
    is_active: bool = True
    created_at: datetime = datetime.now(UTC)

    class Settings:
        name = "users"
