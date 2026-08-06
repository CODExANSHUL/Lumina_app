from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.category import CommonStatus

from app.models.video import Video
from app.models.video import ContentStatus
from app.models.video import AgeRating

from app.models.video_category import VideoCategory

from app.models.season import Season
from app.models.episode import Episode

from app.models.subscription_plan import (
    SubscriptionPlan,
    VideoQuality
)

from app.models.review import Review
from app.models.user import User
from app.models.user import UserStatus

from app.schemas.category import CategoryCreate
from app.schemas.video import VideoRequest
from app.schemas.season import SeasonRequest
from app.schemas.episode import EpisodeRequest
from app.schemas.subscription import SubscriptionPlanRequest


class AdminService:

    # ----------------------------------
    # Category
    # ----------------------------------

    @staticmethod
    def add_category(
        request: CategoryCreate,
        db: Session
    ):

        category = db.query(Category).filter(
            Category.category_name == request.category_name
        ).first()

        if category:

            raise HTTPException(
                status_code=400,
                detail="Category already exists"
            )

        category = Category(
            category_name=request.category_name,
            description=request.description
        )

        db.add(category)
        db.commit()
        db.refresh(category)

        return category

    @staticmethod
    def categories(
        db: Session
    ):

        return db.query(Category).all()

    @staticmethod
    def update_category_status(
        category_id: int,
        status: CommonStatus,
        db: Session
    ):

        category = db.query(Category).filter(
            Category.category_id == category_id
        ).first()

        if category is None:

            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

        category.status = status

        db.commit()
        db.refresh(category)

        return category

    # ----------------------------------
    # Video Mapping
    # ----------------------------------

    @staticmethod
    def map_video(
        video: Video,
        request: VideoRequest
    ):

        video.title = request.title

        video.description = request.description

        video.content_type = request.content_type

        video.release_year = request.release_year

        video.duration_minutes = request.duration_minutes

        video.language = request.language

        video.age_rating = (
            request.age_rating
            if request.age_rating
            else AgeRating.ALL
        )

        video.thumbnail_name = request.thumbnail_name

        video.banner_name = request.banner_name

        video.video_url = request.video_url

        video.trailer_url = request.trailer_url

        video.status = (
            request.status
            if request.status
            else ContentStatus.DRAFT
        )

        return video

    # ----------------------------------
    # Video Category Mapping
    # ----------------------------------

    @staticmethod
    def save_video_categories(
        video_id: int,
        category_ids: list[int],
        db: Session
    ):

        if not category_ids:
            return

        for category_id in category_ids:

            category = db.query(Category).filter(
                Category.category_id == category_id
            ).first()

            if category is None:

                raise HTTPException(
                    status_code=404,
                    detail=f"Category {category_id} not found"
                )

            relation = VideoCategory(
                video_id=video_id,
                category_id=category_id
            )

            db.add(relation)

        db.commit()

            # ----------------------------------
    # Add Video
    # ----------------------------------

    @staticmethod
    def add_video(
        request: VideoRequest,
        uploaded_by: int,
        db: Session
    ):

        user = db.query(User).filter(
            User.user_id == uploaded_by
        ).first()

        if user is None:
            raise HTTPException(
                status_code=404,
                detail="Uploader not found"
            )

        video = Video(
            uploaded_by=uploaded_by
        )

        AdminService.map_video(
            video,
            request
        )

        db.add(video)
        db.commit()
        db.refresh(video)

        AdminService.save_video_categories(
            video.video_id,
            request.category_ids,
            db
        )

        return video

    # ----------------------------------
    # Update Video
    # ----------------------------------

    @staticmethod
    def update_video(
        video_id: int,
        request: VideoRequest,
        db: Session
    ):

        video = db.query(Video).filter(
            Video.video_id == video_id
        ).first()

        if video is None:
            raise HTTPException(
                status_code=404,
                detail="Video not found"
            )

        AdminService.map_video(
            video,
            request
        )

        db.query(VideoCategory).filter(
            VideoCategory.video_id == video_id
        ).delete()

        db.commit()

        AdminService.save_video_categories(
            video.video_id,
            request.category_ids,
            db
        )

        db.commit()
        db.refresh(video)

        return video

    # ----------------------------------
    # Delete Video
    # ----------------------------------

    @staticmethod
    def remove_video(
        video_id: int,
        db: Session
    ):

        video = db.query(Video).filter(
            Video.video_id == video_id
        ).first()

        if video is None:
            raise HTTPException(
                status_code=404,
                detail="Video not found"
            )

        db.query(VideoCategory).filter(
            VideoCategory.video_id == video_id
        ).delete()

        db.query(Season).filter(
            Season.video_id == video_id
        ).delete()

        db.delete(video)

        db.commit()

        return {
            "message": "Video deleted successfully"
        }
    
        # ----------------------------------
    # Add Season
    # ----------------------------------

    @staticmethod
    def add_season(
        request: SeasonRequest,
        db: Session
    ):

        video = db.query(Video).filter(
            Video.video_id == request.video_id
        ).first()

        if video is None:
            raise HTTPException(
                status_code=404,
                detail="Video not found"
            )

        season = Season(
            video_id=request.video_id,
            season_number=request.season_number,
            title=request.title,
            description=request.description,
            release_year=request.release_year
        )

        db.add(season)
        db.commit()
        db.refresh(season)

        return season

    # ----------------------------------
    # Add Episode
    # ----------------------------------

    @staticmethod
    def add_episode(
        request: EpisodeRequest,
        db: Session
    ):

        season = db.query(Season).filter(
            Season.season_id == request.season_id
        ).first()

        if season is None:
            raise HTTPException(
                status_code=404,
                detail="Season not found"
            )

        episode = Episode(
            season_id=request.season_id,
            episode_number=request.episode_number,
            title=request.title,
            description=request.description,
            duration_minutes=request.duration_minutes,
            thumbnail_name=request.thumbnail_name,
            video_url=request.video_url,
            release_date=request.release_date
        )

        db.add(episode)
        db.commit()
        db.refresh(episode)

        return episode

    # ----------------------------------
    # Add Subscription Plan
    # ----------------------------------

    @staticmethod
    def add_subscription_plan(
        request: SubscriptionPlanRequest,
        db: Session
    ):

        plan = SubscriptionPlan(
            plan_name=request.plan_name,
            description=request.description,
            price=request.price,
            duration_days=request.duration_days,
            max_screens=request.max_screens,
            video_quality=VideoQuality(request.video_quality)
        )

        db.add(plan)
        db.commit()
        db.refresh(plan)

        return plan

    # ----------------------------------
    # Update User Status
    # ----------------------------------

    @staticmethod
    def update_user_status(
        user_id: int,
        status: UserStatus,
        db: Session
    ):

        user = db.query(User).filter(
            User.user_id == user_id
        ).first()

        if user is None:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        user.status = status

        db.commit()
        db.refresh(user)

        return user

    # ----------------------------------
    # Update Subscription Plan Status
    # ----------------------------------

    @staticmethod
    def update_plan_status(
        plan_id: int,
        status: CommonStatus,
        db: Session
    ):

        plan = db.query(SubscriptionPlan).filter(
            SubscriptionPlan.plan_id == plan_id
        ).first()

        if plan is None:
            raise HTTPException(
                status_code=404,
                detail="Plan not found"
            )

        plan.status = status

        db.commit()
        db.refresh(plan)

        return plan

    # ----------------------------------
    # Update Review Status
    # ----------------------------------

    @staticmethod
    def update_review_status(
        review_id: int,
        status,
        db: Session
    ):

        review = db.query(Review).filter(
            Review.review_id == review_id
        ).first()

        if review is None:
            raise HTTPException(
                status_code=404,
                detail="Review not found"
            )

        review.status = status

        db.commit()
        db.refresh(review)

        return review