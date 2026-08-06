from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.category import CategoryCreate
from app.schemas.video import VideoRequest
from app.schemas.season import SeasonRequest
from app.schemas.episode import EpisodeRequest
from app.schemas.subscription import SubscriptionPlanRequest

from app.services.admin_service import AdminService

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# TODO(security): enforce authenticated ADMIN role dependencies on every route.


@router.post("/categories")
def create_category(
    request: CategoryCreate,
    db: Session = Depends(get_db)
):
    return AdminService.add_category(request, db)


@router.post("/videos")
def create_video(
    request: VideoRequest,
    uploaded_by: int,
    db: Session = Depends(get_db)
):
    return AdminService.add_video(
        request,
        uploaded_by,
        db
    )


@router.put("/videos/{video_id}")
def update_video(
    video_id: int,
    request: VideoRequest,
    db: Session = Depends(get_db)
):
    return AdminService.update_video(
        video_id,
        request,
        db
    )


@router.delete("/videos/{video_id}")
def delete_video(
    video_id: int,
    db: Session = Depends(get_db)
):
    return AdminService.remove_video(
        video_id,
        db
    )


@router.post("/seasons")
def create_season(
    request: SeasonRequest,
    db: Session = Depends(get_db)
):
    return AdminService.add_season(request, db)


@router.post("/episodes")
def create_episode(
    request: EpisodeRequest,
    db: Session = Depends(get_db)
):
    return AdminService.add_episode(request, db)


@router.post("/plans")
def create_plan(
    request: SubscriptionPlanRequest,
    db: Session = Depends(get_db)
):
    return AdminService.add_subscription_plan(
        request,
        db
    )
