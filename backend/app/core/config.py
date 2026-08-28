from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = Field(min_length=1)
    JWT_SECRET_KEY: str = Field(min_length=1)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Registration guardrails
    SIGNUP_ALLOWED: bool = False
    SIGNUP_BLOCK_MESSAGE: str = "Cant create new account for the moment please reach us via whatsapp message"

    # Admin seed
    ADMIN_EMAIL: str = Field(min_length=1)
    ADMIN_PASSWORD: str = Field(min_length=1)
    ADMIN_FULLNAME: str = "Connectov Admin"

    # SSR template source (used by the frontend SSR proxy)
    SSR_INDEX_URL: str = ""
    SSR_INDEX_PATH: str = ""
    SSR_TEMPLATE_CACHE_TTL_SECONDS: int = 300
    TRACKING_CACHE_TTL_SECONDS: int = 30


settings = Settings()
