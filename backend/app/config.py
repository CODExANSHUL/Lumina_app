from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / "./.env"

print("BASE_DIR:", BASE_DIR)
print("ENV FILE:", ENV_FILE)
print("ENV EXISTS:", ENV_FILE.exists())

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    UPLOAD_DIR: str
    PROFILE_PHOTO_DIR: str
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()