from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    DIRECT_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # Supabase
    SUPABASE_URL: str
    SUPABASE_PUBLISHABLE_KEY: str
    SUPABASE_SECRET_KEY: str

    # Local upload directories (optional)
    UPLOAD_DIR: str = "uploads"
    PROFILE_PHOTO_DIR: str = "uploads/profile"

    # Razorpay
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str

    # CORS - comma separated list of extra allowed origins (e.g. your
    # production Vercel domain, a custom domain, etc). Set this in Render's
    # environment variables so you never have to redeploy the backend just
    # to allow a new frontend URL.
    # Example: ALLOWED_ORIGINS=https://lumina.vercel.app,https://myapp.com
    ALLOWED_ORIGINS: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()