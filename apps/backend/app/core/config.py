from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "ArogyaVault API"
    debug: bool = False

    # JWT
    jwt_secret: str = "arogyavault-dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # AWS
    aws_region: str = "ap-south-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""

    # Cognito
    cognito_user_pool_id: str = ""
    cognito_client_id: str = ""
    cognito_region: str = "ap-south-1"

    # Database
    database_url: str = ""

    # S3
    s3_bucket_name: str = ""
    s3_region: str = "ap-south-1"

    # Redis
    redis_url: str = "redis://localhost:6379"

    model_config = {"env_file": ".env", "case_sensitive": False}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
