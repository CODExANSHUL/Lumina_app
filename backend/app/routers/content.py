from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database import get_db
from app.services.content_service import ContentService

router = APIRouter(
    prefix="/content",
    tags=["Content"]
)


@router.get("/featured")
def featured(
    db: Session = Depends(get_db)
):
    return ContentService.featured_videos(db)


@router.get("/latest")
def latest(
    db: Session = Depends(get_db)
):
    return ContentService.latest_videos(db)


@router.get("/trending")
def trending(
    db: Session = Depends(get_db)
):
    return ContentService.trending_videos(db)


@router.get("/categories")
def categories(
    db: Session = Depends(get_db)
):
    return ContentService.categories(db)


@router.get("/categories/{category_id}")
def videos_by_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    return ContentService.videos_by_category(
        category_id,
        db
    )


@router.get("/videos/{video_id}")
def video_details(
    video_id: int,
    db: Session = Depends(get_db)
):
    return ContentService.video_details(
        video_id,
        db
    )


@router.get("/videos/{video_id}/similar")
def similar_videos(
    video_id: int,
    db: Session = Depends(get_db)
):
    return ContentService.similar_videos(
        video_id,
        db
    )


@router.get("/videos/{video_id}/seasons")
def seasons(
    video_id: int,
    db: Session = Depends(get_db)
):
    return ContentService.seasons(
        video_id,
        db
    )


@router.get("/seasons/{season_id}/episodes")
def episodes(
    season_id: int,
    db: Session = Depends(get_db)
):
    return ContentService.episodes(
        season_id,
        db
    )


@router.get("/search")
def search(
    keyword: str,
    db: Session = Depends(get_db)
):
    return ContentService.search(
        keyword,
        db
    )