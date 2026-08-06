import { Check, Info, Play, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { mediaUrl } from "../../utils/media";
export function ContentCard({ video, inWatchlist, onToggle, progress, onRemove }) {
  return (
    <article className="group relative min-w-0">
      <Link
        to={`/video/${video.video_id}`}
        className="block overflow-hidden rounded-2xl bg-panel"
      >
        <div className="aspect-[2/3] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950">
          {video.thumbnail_name ? (
            <img
              src={mediaUrl(video.thumbnail_name)}
              alt={`${video.title} poster`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center px-5 text-center font-display text-xl text-white/50">
              {video.title}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent opacity-70" />
          {typeof progress === "number" && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
              <div
                className="h-full bg-coral"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </Link>
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemove(video);
          }}
          aria-label={`Remove ${video.title} from Continue watching`}
          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-black/80"
        >
          <X size={14} />
        </button>
      )}
      <div className="mt-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/video/${video.video_id}`}
            className="truncate font-semibold hover:text-coral"
          >
            {video.title}
          </Link>
          {onToggle && (
            <button
              onClick={() => onToggle(video)}
              className="shrink-0 rounded-full border border-white/15 p-1.5 text-mist hover:text-white"
              aria-label={
                inWatchlist ? "Remove from watchlist" : "Add to watchlist"
              }
            >
              {inWatchlist ? <Check size={15} /> : <Plus size={15} />}
            </button>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-mist">
          <span>{video.release_year || "New"}</span>
          <span>•</span>
          <span>{video.content_type?.replace("_", " ")}</span>
          {video.age_rating && (
            <span className="rounded border border-white/20 px-1.5">
              {video.age_rating}
            </span>
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-2 top-[52%] flex translate-y-2 justify-center gap-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
        <Link
          className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-coral"
          to={`/watch/${video.video_id}`}
          aria-label="Play"
        >
          <Play size={17} fill="currentColor" />
        </Link>
        <Link
          className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black"
          to={`/video/${video.video_id}`}
          aria-label="Details"
        >
          <Info size={17} />
        </Link>
      </div>
    </article>
  );
}
export function ContentRow({
  title,
  videos,
  onToggle,
  watchlistIds = [],
  getProgress,
  onRemove,
  subtitle = "Swipe to explore",
}) {
  if (!videos.length) return null;
  return (
    <section className="container-page py-7">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        <span className="text-xs text-mist">{subtitle}</span>
      </div>
      <div className="scrollbar-none flex snap-x gap-4 overflow-x-auto pb-4">
        {videos.map((v) => (
          <div
            key={v.video_id}
            className="w-[150px] shrink-0 snap-start sm:w-[185px] lg:w-[205px]"
          >
            <ContentCard
              video={v}
              onToggle={onToggle}
              inWatchlist={watchlistIds.includes(v.video_id)}
              progress={getProgress ? getProgress(v) : undefined}
              onRemove={onRemove}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
