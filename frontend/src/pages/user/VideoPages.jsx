import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart, ListPlus, Play, Send, Share2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiError } from "../../api/client";
import { contentApi } from "../../api/content.api";
import { userApi } from "../../api/user.api";
import { ErrorState, PageLoader } from "../../components/common/States";
import { ContentRow } from "../../components/content/ContentCard";
import { VideoPlayer } from "../../components/player/VideoPlayer";
import { useAuthStore } from "../../store/auth";
import { mediaUrl } from "../../utils/media";
export function VideoDetailsPage() {
  const id = Number(useParams().videoId);
  const nav = useNavigate();
  const profile = useAuthStore((s) => s.activeProfile);
  const qc = useQueryClient();
  const video = useQuery({
    queryKey: ["videoDetails", id],
    queryFn: () => contentApi.video(id),
    enabled: Number.isFinite(id),
  });
  const similar = useQuery({
    queryKey: ["similar", id],
    queryFn: () => contentApi.similar(id),
    enabled: Number.isFinite(id),
  });
  const watch = useQuery({
    queryKey: ["watchlist", profile?.profile_id],
    queryFn: () => userApi.watchlist(profile.profile_id),
    enabled: !!profile,
  });
  const seasons = useQuery({
    queryKey: ["seasons", id],
    queryFn: () => contentApi.seasons(id),
    enabled: video.data?.content_type === "WEB_SERIES",
  });
  const episodeQueries = useQueries({
    queries: (seasons.data || []).map((s) => ({
      queryKey: ["episodes", s.season_id],
      queryFn: () => contentApi.episodes(s.season_id),
    })),
  });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const action = useMutation({
    mutationFn: (kind) => {
      if (!profile) throw new Error("Choose a profile first.");
      if (kind === "watchlist")
        return userApi.addWatchlist(profile.profile_id, id);
      if (kind === "like") return userApi.like(profile.profile_id, id);
      if (kind === "share")
        return userApi.share(profile.profile_id, id, "web", location.href);
      return userApi.review(profile.profile_id, id, rating, comment);
    },
    onSuccess: (_, kind) => {
      toast.success(kind === "review" ? "Review posted" : "Done");
      setComment("");
      qc.invalidateQueries({ queryKey: ["watchlist", profile?.profile_id] });
    },
    onError: (e) => toast.error(apiError(e)),
  });
  const ids = (watch.data || []).map((x) => x.video_id);
  const rowToggle = useMutation({
    mutationFn: (v) => {
      if (!profile) throw new Error("Choose a profile to use your watchlist.");
      return ids.includes(v.video_id)
        ? userApi.removeWatchlist(profile.profile_id, v.video_id)
        : userApi.addWatchlist(profile.profile_id, v.video_id);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["watchlist", profile?.profile_id] }),
    onError: (e) => toast.error(apiError(e)),
  });
  if (video.isLoading) return <PageLoader />;
  if (video.isError || !video.data)
    return (
      <ErrorState
        message="This title could not be found."
        retry={() => video.refetch()}
      />
    );
  const v = video.data;
  return (
    <div>
      <section className="relative min-h-[62vh] overflow-hidden">
        <div className="absolute inset-0">
          {v.banner_name ? (
            <img
              src={mediaUrl(v.banner_name, "banner")}
              className="h-full w-full object-cover"
              alt=""
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-coral/20 via-slate-900 to-ink" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
        </div>
        <div className="container-page relative flex min-h-[62vh] items-end pb-12">
          <div className="max-w-3xl">
            <p className="eyebrow">{v.content_type.replace("_", " ")}</p>
            <h1 className="mt-3 font-display text-5xl sm:text-7xl">
              {v.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-mist">
              <span>{v.release_year}</span>
              <span>{v.duration_minutes} min</span>
              <span>{v.language}</span>
              <span className="rounded border border-white/20 px-2 py-0.5">
                {v.age_rating}
              </span>
            </div>
            <p className="mt-5 max-w-2xl leading-relaxed text-white/75">
              {v.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={`/watch/${id}`} className="btn-primary">
                <Play fill="currentColor" size={17} />
                Play
              </Link>
              {v.trailer_url && (
                <a
                  href={v.trailer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  Trailer
                </a>
              )}
              <button
                className="btn-secondary"
                onClick={() => action.mutate("watchlist")}
              >
                <ListPlus size={18} />
                My list
              </button>
              <button
                className="btn-secondary !px-3"
                onClick={() => action.mutate("like")}
                aria-label="Like"
              >
                <Heart size={18} />
              </button>
              <button
                className="btn-secondary !px-3"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(location.href);
                  } catch (error) {
                    toast.error(apiError(error));
                  }
                  action.mutate("share");
                }}
                aria-label="Share"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
      {seasons.data && (
        <section className="container-page py-10">
          <h2 className="text-2xl font-semibold">Episodes</h2>
          {seasons.data.map((s, i) => (
            <div key={s.season_id} className="mt-7">
              <h3 className="mb-3 font-semibold">
                Season {s.season_number} · {s.title}
              </h3>
              <div className="grid gap-3">
                {(episodeQueries[i]?.data || []).map((ep) => (
                  <button
                    key={ep.episode_id}
                    onClick={() =>
                      nav(
                        `/watch/${id}?episode=${ep.episode_id}&season=${s.season_id}`,
                      )
                    }
                    className="panel flex items-center gap-4 p-3 text-left hover:border-white/20"
                  >
                    <div className="grid aspect-video w-28 place-items-center overflow-hidden rounded-lg bg-white/5">
                      {ep.thumbnail_name ? (
                        <img
                          className="h-full w-full object-cover"
                          src={mediaUrl(ep.thumbnail_name)}
                          alt=""
                        />
                      ) : (
                        <Play />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-coral">
                        EPISODE {ep.episode_number}
                      </p>
                      <p className="font-semibold">{ep.title}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-mist">
                        {ep.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
      {similar.data?.length > 0 && (
        <ContentRow
          title="More like this"
          videos={similar.data}
          onToggle={profile ? rowToggle.mutate : undefined}
          watchlistIds={ids}
        />
      )}
      <section className="container-page py-10">
        <div className="panel max-w-2xl p-6">
          <h2 className="text-xl font-semibold">Rate this title</h2>
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                className={`h-10 w-10 rounded-full ${rating === n ? "bg-coral" : "bg-white/10"}`}
                onClick={() => setRating(n)}
                key={n}
              >
                {n}
              </button>
            ))}
          </div>
          <textarea
            className="field mt-4"
            rows={3}
            maxLength={3000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share a spoiler-free thought"
          />
          <button
            className="btn-primary mt-3"
            disabled={!comment.trim() || action.isPending}
            onClick={() => action.mutate("review")}
          >
            <Send size={16} />
            Post review
          </button>
        </div>
      </section>
    </div>
  );
}
export function WatchPage() {
  const id = Number(useParams().videoId);
  const profile = useAuthStore((s) => s.activeProfile);
  const video = useQuery({
    queryKey: ["videoDetails", id],
    queryFn: () => contentApi.video(id),
  });
  const history = useQuery({
    queryKey: ["continueWatching", profile?.profile_id],
    queryFn: () => userApi.continueWatching(profile.profile_id),
    enabled: !!profile,
  });
  const save = useMutation({
    mutationFn: ({ watched, total }) =>
      userApi.saveProgress(profile.profile_id, id, watched, total),
    onError: (e) => toast.error(apiError(e)),
  });
  if (video.isLoading) return <PageLoader />;
  if (!video.data || video.isError) return <ErrorState />;
  const resume =
    history.data?.find((h) => h.video_id === id)?.watched_seconds || 0;
  return (
    <div className="container-page py-8">
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <VideoPlayer
          src={mediaUrl(video.data.video_url, "video")}
          title={video.data.title}
          resumeAt={resume}
          onSave={
            profile
              ? (watched, total) => save.mutate({ watched, total })
              : undefined
          }
        />
      </div>
      <div className="mx-auto max-w-4xl py-8">
        <p className="eyebrow">Now playing</p>
        <h1 className="mt-2 font-display text-4xl">{video.data.title}</h1>
        <p className="mt-3 text-mist">{video.data.description}</p>
      </div>
    </div>
  );
}
