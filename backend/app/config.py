from pathlib import Path

from pydantic_settings import BaseSettings

# Шлях до .env у корені проекту (рівень вище за backend/)
_ROOT_DIR = Path(__file__).resolve().parent.parent.parent
_ENV_FILE = _ROOT_DIR / ".env"


class Settings(BaseSettings):
    # Повне посилання на MongoDB (локальне, Docker або зовнішнє — задати в .env)
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "litopis"

    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    debug: bool = False

    model_config = {"env_file": _ENV_FILE, "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
