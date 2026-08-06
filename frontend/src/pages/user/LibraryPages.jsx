import { useQueries, useQuery } from "@tanstack/react-query";
import { contentApi } from "../../api/content.api";
import { userApi } from "../../api/user.api";
import { ContentCard } from "../../components/content/ContentCard";
import {
  EmptyState,
  ErrorState,
  SkeletonGrid,
} from "../../components/common/States";
import { useAuthStore } from "../../store/auth";
function VideoIdsGrid({ ids }) {
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["videoDetails", id],
      queryFn: () => contentApi.video(id),
    })),
  });
  if (queries.some((q) => q.isLoading)) return <SkeletonGrid />;
  const videos = queries.map((q) => q.data).filter(Boolean);
  if (!videos.length) return <EmptyState />;
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {videos.map((v) => (
        <ContentCard key={v.video_id} video={v} />
      ))}
    </div>
  );
}
export function WatchlistPage() {
  const p = useAuthStore((s) => s.activeProfile);
  const q = useQuery({
    queryKey: ["watchlist", p?.profile_id],
    queryFn: () => userApi.watchlist(p.profile_id),
    enabled: !!p,
  });
  return (
    <Library title="My watchlist" subtitle="Everything you saved for later.">
      {!p ? (
        <EmptyState
          title="Choose a profile"
          message="A profile keeps your watchlist personal."
        />
      ) : q.isLoading ? (
        <SkeletonGrid />
      ) : q.isError ? (
        <ErrorState retry={() => q.refetch()} />
      ) : q.data?.length ? (
        <VideoIdsGrid ids={q.data.map((x) => x.video_id)} />
      ) : (
        <EmptyState
          title="Your list is waiting"
          message="Add a title from Browse to find it here."
        />
      )}
    </Library>
  );
}
export function ContinuePage() {
  const p = useAuthStore((s) => s.activeProfile);
  const q = useQuery({
    queryKey: ["continueWatching", p?.profile_id],
    queryFn: () => userApi.continueWatching(p.profile_id),
    enabled: !!p,
  });
  return (
    <Library
      title="Continue watching"
      subtitle="Return to the exact moment you left."
    >
      {!p ? (
        <EmptyState title="Choose a profile" />
      ) : q.isLoading ? (
        <SkeletonGrid />
      ) : q.isError ? (
        <ErrorState retry={() => q.refetch()} />
      ) : q.data?.length ? (
        <>
          <VideoIdsGrid ids={q.data.map((x) => x.video_id)} />
          <div className="mt-8 grid gap-2">
            {q.data.map((h) => (
              <div
                key={h.history_id}
                className="h-1 overflow-hidden rounded bg-white/10"
              >
                <div
                  className="h-full bg-coral"
                  style={{
                    width: `${h.total_seconds ? Math.min(100, (h.watched_seconds / h.total_seconds) * 100) : 0}%`,
                  }}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="No unfinished stories"
          message="Start watching and your progress will appear here."
        />
      )}
    </Library>
  );
}
function Library({ title, subtitle, children }) {
  return (
    <div className="container-page min-h-[70vh] py-12">
      <p className="eyebrow">Your library</p>
      <h1 className="mt-3 font-display text-5xl">{title}</h1>
      <p className="mt-3 text-mist">{subtitle}</p>
      <div className="mt-10">{children}</div>
    </div>
  );
}
