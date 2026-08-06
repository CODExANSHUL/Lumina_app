from sqlalchemy.orm import Session

from fastapi import HTTPException

from app.models.user import User
from app.models.user import Role
from app.models.user import VerifiedStatus

from app.models.user_profile import UserProfile

from app.schemas.auth import RegisterRequest
from app.schemas.auth import LoginRequest
from app.schemas.auth import AuthResponse

from app.security.password import hash_password
from app.security.password import verify_password

from app.security.jwt import create_access_token


class AuthService:

    @staticmethod
    def register(
        request: RegisterRequest,
        db: Session
    ):

        if db.query(User).filter(
            User.email == request.email
        ).first():

            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        if db.query(User).filter(
            User.mobile == request.mobile
        ).first():

            raise HTTPException(
                status_code=400,
                detail="Mobile already registered"
            )

        user = User(
            full_name=request.full_name,
            email=request.email,
            mobile=request.mobile,
            password=hash_password(request.password),
            role=Role.USER,
            verified_status=VerifiedStatus.VERIFIED
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        profile = UserProfile(
            user_id=user.user_id,
            display_name=user.full_name,
            default_profile=True
        )

        db.add(profile)
        db.commit()

        token = create_access_token(
            {
                "sub": user.email
            }
        )

        return AuthResponse(
            user_id=user.user_id,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            access_token=token
        )

    @staticmethod
    def login(
        request: LoginRequest,
        db: Session
    ):

        user = db.query(User).filter(
            User.email == request.email
        ).first()

        if user is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )

        if not verify_password(
            request.password,
            user.password
        ):

            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )

        token = create_access_token(
            {
                "sub": user.email
            }
        )

        return AuthResponse(
            user_id=user.user_id,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            access_token=token
        )