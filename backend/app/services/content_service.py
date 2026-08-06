from sqlalchemy.orm import Session
from sqlalchemy import desc
from sqlalchemy import or_

from app.models.video import Video
from app.models.category import Category
from app.models.video_category import VideoCategory
from app.models.season import Season
from app.models.episode import Episode


class ContentService:

    # ----------------------------------
    # Featured Videos
    # ----------------------------------

    @staticmethod
    def featured_videos(db: Session):

        return db.query(Video).filter(
            Video.featured == True
        ).all()

    # ----------------------------------
    # Latest Videos
    # ----------------------------------

    @staticmethod
    def latest_videos(db: Session):

        return db.query(Video).order_by(
            desc(Video.video_id)
        ).limit(20).all()

    # ----------------------------------
    # Trending Videos
    # ----------------------------------

    @staticmethod
    def trending_videos(db: Session):

        return db.query(Video).order_by(
            desc(Video.total_views)
        ).limit(20).all()

    # ----------------------------------
    # Categories
    # ----------------------------------

    @staticmethod
    def categories(db: Session):

        return db.query(Category).all()

    # ----------------------------------
    # Videos By Category
    # ----------------------------------

    @staticmethod
    def videos_by_category(
        category_id: int,
        db: Session
    ):

        return (
            db.query(Video)
            .join(
                VideoCategory,
                Video.video_id == VideoCategory.video_id
            )
            .filter(
                VideoCategory.category_id == category_id
            )
            .all()
        )

    # ----------------------------------
    # Similar / Recommended Videos
    # ----------------------------------

    @staticmethod
    def similar_videos(
        video_id: int,
        db: Session,
        limit: int = 12
    ):
        # Recommend other titles that share at least one category with
        # this video ("More Like This"). Falls back to same content
        # type / language so new or uncategorised titles still get
        # reasonable suggestions instead of an empty row.

        source = db.query(Video).filter(
            Video.video_id == video_id
        ).first()

        if source is None:
            return []

        category_ids = [
            row.category_id for row in db.query(VideoCategory).filter(
                VideoCategory.video_id == video_id
            ).all()
        ]

        results = []

        if category_ids:
            results = (
                db.query(Video)
                .join(
                    VideoCategory,
                    Video.video_id == VideoCategory.video_id
                )
                .filter(
                    VideoCategory.category_id.in_(category_ids),
                    Video.video_id != video_id
                )
                .order_by(desc(Video.total_views))
                .distinct()
                .limit(limit)
                .all()
            )

        if len(results) < limit:
            existing_ids = {v.video_id for v in results} | {video_id}
            fallback = (
                db.query(Video)
                .filter(
                    Video.video_id.notin_(existing_ids),
                    or_(
                        Video.content_type == source.content_type,
                        Video.language == source.language
                    )
                )
                .order_by(desc(Video.total_views))
                .limit(limit - len(results))
                .all()
            )
            results.extend(fallback)

        return results

    # ----------------------------------
    # Video Details
    # ----------------------------------

    @staticmethod
    def video_details(
        video_id: int,
        db: Session
    ):

        return db.query(Video).filter(
            Video.video_id == video_id
        ).first()

    # ----------------------------------
    # Seasons
    # ----------------------------------

    @staticmethod
    def seasons(
        video_id: int,
        db: Session
    ):

        return db.query(Season).filter(
            Season.video_id == video_id
        ).order_by(
            Season.season_number
        ).all()

    # ----------------------------------
    # Episodes
    # ----------------------------------

    @staticmethod
    def episodes(
        season_id: int,
        db: Session
    ):

        return db.query(Episode).filter(
            Episode.season_id == season_id
        ).order_by(
            Episode.episode_number
        ).all()

    # ----------------------------------
    # Search
    # ----------------------------------

    @staticmethod
    def search(
        keyword: str,
        db: Session
    ):

        return db.query(Video).filter(
            or_(
                Video.title.ilike(f"%{keyword}%"),
                Video.description.ilike(f"%{keyword}%"),
                Video.language.ilike(f"%{keyword}%")
            )
        ).all()