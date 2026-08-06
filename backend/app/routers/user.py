from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.user import ProfileRequest

from app.services.user_service import UserService

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/{user_id}/profiles")
def create_profile(
    user_id: int,
    request: ProfileRequest,
    db: Session = Depends(get_db)
):
    return UserService.create_profile(
        user_id,
        request,
        db
    )


@router.get("/{user_id}/profiles")
def get_profiles(
    user_id: int,
    db: Session = Depends(get_db)
):
    return UserService.get_profiles(
        user_id,
        db
    )


@router.put("/profiles/{profile_id}")
def update_profile(
    profile_id: int,
    request: ProfileRequest,
    db: Session = Depends(get_db)
):
    return UserService.update_profile(
        profile_id,
        request,
        db
    )


@router.delete("/profiles/{profile_id}")
def delete_profile(
    profile_id: int,
    db: Session = Depends(get_db)
):
    return UserService.delete_profile(
        profile_id,
        db
    )


@router.post("/profiles/{profile_id}/watchlist/{video_id}")
def add_to_watchlist(
    profile_id: int,
    video_id: int,
    db: Session = Depends(get_db)
):
    return UserService.add_to_watchlist(
        profile_id,
        video_id,
        db
    )


@router.get("/profiles/{profile_id}/watchlist")
def get_watchlist(
    profile_id: int,
    db: Session = Depends(get_db)
):
    return UserService.get_watchlist(
        profile_id,
        db
    )

@router.delete("/profiles/{profile_id}/watchlist/{video_id}")
def remove_watchlist(
    profile_id: int,
    video_id: int,
    db: Session = Depends(get_db)
):
    return UserService.remove_from_watchlist(
        profile_id,
        video_id,
        db
    )


@router.post("/profiles/{profile_id}/history/{video_id}")
def save_history(
    profile_id: int,
    video_id: int,
    watched_seconds: int,
    total_seconds: int,
    db: Session = Depends(get_db)
):
    return UserService.save_watch_history(
        profile_id,
        video_id,
        watched_seconds,
        total_seconds,
        db
    )


@router.get("/profiles/{profile_id}/continue")
def continue_watching(
    profile_id: int,
    db: Session = Depends(get_db)
):
    return UserService.continue_watching(
        profile_id,
        db
    )


@router.delete("/profiles/{profile_id}/history/{video_id}")
def remove_continue_watching(
    profile_id: int,
    video_id: int,
    db: Session = Depends(get_db)
):
    return UserService.remove_continue_watching(
        profile_id,
        video_id,
        db
    )


@router.post("/profiles/{profile_id}/reviews/{video_id}")
def add_review(
    profile_id: int,
    video_id: int,
    rating: int,
    comment: str,
    db: Session = Depends(get_db)
):
    return UserService.add_review(
        profile_id,
        video_id,
        rating,
        comment,
        db
    )


@router.post("/profiles/{profile_id}/likes/{video_id}")
def like_video(
    profile_id: int,
    video_id: int,
    db: Session = Depends(get_db)
):
    return UserService.toggle_like(
        profile_id,
        video_id,
        db
    )


@router.post("/profiles/{profile_id}/search")
def save_search(
    profile_id: int,
    text: str,
    db: Session = Depends(get_db)
):
    return UserService.save_search(
        profile_id,
        text,
        db
    )


@router.post("/profiles/{profile_id}/share/{video_id}")
def share_video(
    profile_id: int,
    video_id: int,
    platform: str,
    url: str,
    db: Session = Depends(get_db)
):
    return UserService.share_video(
        profile_id,
        video_id,
        platform,
        url,
        db
    )


@router.get("/{user_id}/notifications")
def get_notifications(
    user_id: int,
    db: Session = Depends(get_db)
):
    return UserService.notifications(
        user_id,
        db
    )