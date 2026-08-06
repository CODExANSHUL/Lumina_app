from fastapi import HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.watchlist import Watchlist
from app.models.video import Video
from app.models.watch_history import WatchHistory
from app.models.review import Review
from app.models.video_like import VideoLike
from app.models.search_history import SearchHistory
from app.models.video_share import VideoShare
from app.models.notification import Notification

from app.schemas.user import (
    ProfileRequest,
    ProfileResponse
)


class UserService:

    # ----------------------------------
    # Create Profile
    # ----------------------------------

    @staticmethod
    def create_profile(
        user_id: int,
        request: ProfileRequest,
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

        profile = UserProfile(
            user_id=user_id,
            display_name=request.display_name,
            avatar_name=request.avatar_name,
            language_preference=request.language_preference,
            age_rating_preference=request.age_rating_preference,
            default_profile=request.default_profile
        )

        db.add(profile)
        db.commit()
        db.refresh(profile)

        return profile

    # ----------------------------------
    # Get Profiles
    # ----------------------------------

    @staticmethod
    def get_profiles(
        user_id: int,
        db: Session
    ):

        return db.query(UserProfile).filter(
            UserProfile.user_id == user_id
        ).all()

    # ----------------------------------
    # Update Profile
    # ----------------------------------

    @staticmethod
    def update_profile(
        profile_id: int,
        request: ProfileRequest,
        db: Session
    ):

        profile = db.query(UserProfile).filter(
            UserProfile.profile_id == profile_id
        ).first()

        if profile is None:

            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            )

        profile.display_name = request.display_name
        profile.avatar_name = request.avatar_name
        profile.language_preference = request.language_preference
        profile.age_rating_preference = request.age_rating_preference
        profile.default_profile = request.default_profile

        db.commit()
        db.refresh(profile)

        return profile

    # ----------------------------------
    # Delete Profile
    # ----------------------------------

    @staticmethod
    def delete_profile(
        profile_id: int,
        db: Session
    ):

        profile = db.query(UserProfile).filter(
            UserProfile.profile_id == profile_id
        ).first()

        if profile is None:

            raise HTTPException(
                status_code=404,
                detail="Profile not found"
            )

        db.delete(profile)

        db.commit()

        return {
            "message": "Profile deleted successfully"
        }

    # ----------------------------------
    # Add To Watchlist
    # ----------------------------------

    @staticmethod
    def add_to_watchlist(
        profile_id: int,
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

        existing = db.query(Watchlist).filter(
            Watchlist.profile_id == profile_id,
            Watchlist.video_id == video_id
        ).first()

        if existing:

            return {
                "message": "Video already in watchlist"
            }

        watchlist = Watchlist(
            profile_id=profile_id,
            video_id=video_id
        )

        db.add(watchlist)

        db.commit()

        return {
            "message": "Added to watchlist"
        }

    # ----------------------------------
    # Get Watchlist
    # ----------------------------------

    @staticmethod
    def get_watchlist(
        profile_id: int,
        db: Session
    ):

        return db.query(Watchlist).filter(
            Watchlist.profile_id == profile_id
        ).all()

    # ----------------------------------
    # Remove From Watchlist
    # ----------------------------------

    @staticmethod
    def remove_from_watchlist(
        profile_id: int,
        video_id: int,
        db: Session
    ):

        item = db.query(Watchlist).filter(
            Watchlist.profile_id == profile_id,
            Watchlist.video_id == video_id
        ).first()

        if item is None:
            raise HTTPException(
                status_code=404,
                detail="Video not found in watchlist"
            )

        db.delete(item)
        db.commit()

        return {
            "message": "Removed from watchlist"
        }

    # ----------------------------------
    # Save Watch Progress
    # ----------------------------------

    @staticmethod
    def save_watch_history(
        profile_id: int,
        video_id: int,
        watched_seconds: int,
        total_seconds: int,
        db: Session
    ):

        history = db.query(WatchHistory).filter(
            WatchHistory.profile_id == profile_id,
            WatchHistory.video_id == video_id
        ).first()

        if history is None:

            history = WatchHistory(
                profile_id=profile_id,
                video_id=video_id
            )

            db.add(history)

        history.watched_seconds = watched_seconds
        history.total_seconds = total_seconds
        history.completed = watched_seconds >= total_seconds

        db.commit()
        db.refresh(history)

        return history

    # ----------------------------------
    # Continue Watching
    # ----------------------------------

    @staticmethod
    def continue_watching(
        profile_id: int,
        db: Session
    ):
        # Only surface titles that were actually started and not
        # already finished, most recently watched first, capped so
        # the row on the home page stays a manageable shelf of titles.

        return db.query(WatchHistory).filter(
            WatchHistory.profile_id == profile_id,
            WatchHistory.completed == False,
            WatchHistory.watched_seconds > 0
        ).order_by(
            desc(WatchHistory.last_watched_at)
        ).limit(20).all()

    # ----------------------------------
    # Remove From Continue Watching
    # ----------------------------------

    @staticmethod
    def remove_continue_watching(
        profile_id: int,
        video_id: int,
        db: Session
    ):

        history = db.query(WatchHistory).filter(
            WatchHistory.profile_id == profile_id,
            WatchHistory.video_id == video_id
        ).first()

        if history is None:
            raise HTTPException(
                status_code=404,
                detail="No watch history found for this title"
            )

        db.delete(history)
        db.commit()

        return {
            "message": "Removed from Continue Watching"
        }

    # ----------------------------------
    # Add Review
    # ----------------------------------

    @staticmethod
    def add_review(
        profile_id: int,
        video_id: int,
        rating: int,
        comment: str,
        db: Session
    ):

        review = Review(
            profile_id=profile_id,
            video_id=video_id,
            rating=rating,
            comment=comment
        )

        db.add(review)
        db.commit()
        db.refresh(review)

        return review

    # ----------------------------------
    # Like / Unlike Video
    # ----------------------------------

    @staticmethod
    def toggle_like(
        profile_id: int,
        video_id: int,
        db: Session
    ):

        like = db.query(VideoLike).filter(
            VideoLike.profile_id == profile_id,
            VideoLike.video_id == video_id
        ).first()

        if like is None:

            like = VideoLike(
                profile_id=profile_id,
                video_id=video_id,
                liked=True
            )

            db.add(like)

        else:

            like.liked = not like.liked

        db.commit()
        db.refresh(like)

        return like

    # ----------------------------------
    # Save Search
    # ----------------------------------

    @staticmethod
    def save_search(
        profile_id: int,
        text: str,
        db: Session
    ):

        history = SearchHistory(
            profile_id=profile_id,
            search_text=text
        )

        db.add(history)
        db.commit()

        return {
            "message": "Search saved"
        }

    # ----------------------------------
    # Share Video
    # ----------------------------------

    @staticmethod
    def share_video(
        profile_id: int,
        video_id: int,
        platform: str,
        url: str,
        db: Session
    ):

        share = VideoShare(
            profile_id=profile_id,
            video_id=video_id,
            platform=platform,
            share_url=url
        )

        db.add(share)
        db.commit()
        db.refresh(share)

        return share

    # ----------------------------------
    # User Notifications
    # ----------------------------------

    @staticmethod
    def notifications(
        user_id: int,
        db: Session
    ):

        return db.query(Notification).filter(
            Notification.user_id == user_id
        ).all()
