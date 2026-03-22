from functools import lru_cache
from urllib.parse import quote_plus

from pydantic import AliasChoices, Field, computed_field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    postgres_user: str | None = None
    postgres_password: str | None = None
    postgres_db: str | None = None
    postgres_host: str = "localhost"
    postgres_port: int = 5432

    database_url_override: str | None = Field(
        default=None,
        validation_alias=AliasChoices("DATABASE_URL"),
    )

    db_echo: bool = False

    @model_validator(mode="after")
    def require_db_settings(self) -> "Settings":
        if self.database_url_override and self.database_url_override.strip():
            return self
        missing: list[str] = []
        if not self.postgres_user:
            missing.append("POSTGRES_USER")
        if self.postgres_password is None:
            missing.append("POSTGRES_PASSWORD")
        if not self.postgres_db:
            missing.append("POSTGRES_DB")
        if missing:
            msg = (
                "Set DATABASE_URL, or provide all of: "
                + ", ".join(missing)
            )
            raise ValueError(msg)
        return self

    @computed_field
    @property
    def database_url(self) -> str:
        if self.database_url_override and self.database_url_override.strip():
            return self.database_url_override.strip()
        u = quote_plus(self.postgres_user or "")
        p = quote_plus(self.postgres_password or "")
        return (
            f"postgresql+asyncpg://{u}:{p}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
