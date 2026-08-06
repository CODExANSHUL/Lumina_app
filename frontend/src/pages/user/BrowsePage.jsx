import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiError } from "../../api/client";
import { contentApi } from "../../api/content.api";
import { userApi } from "../../api/user.api";
import { ContentRow } from "../../components/content/ContentCard";
import { HeroBanner } from "../../components/content/HeroBanner";
import { ErrorState, PageLoader } from "../../components/common/States";
import { useAuthStore } from "../../store/auth";

export default function BrowsePage() {
  const profile = useAuthStore((s) => s.activeProfile);
  const qc = useQueryClient();
  const core = useQueries({
    queries: [
      { queryKey: ["featured"], queryFn: contentApi.featured },
      { queryKey: ["trending"], queryFn: contentApi.trending },
      { queryKey: ["latest"], queryFn: contentApi.latest },
      { queryKey: ["categories"], queryFn: contentApi.categories },
    ],
  });
  const [featured, trending, latest, categories] = core;
  const watch = useQuery({
    queryKey: ["watchlist", profile?.profile_id],
    queryFn: () => userApi.watchlist(profile.profile_id),
    enabled: !!profile,
  });
  const cont = useQuery({
    queryKey: ["continueWatching", profile?.profile_id],
    queryFn: () => userApi.continueWatching(profile.profile_id),
    enabled: !!profile,
  });
  const categoryQueries = useQueries({
    queries: (categories.data || []).slice(0, 6).map((c) => ({
      queryKey: ["categoryVideos", c.category_id],
      queryFn: () => contentApi.byCategory(c.category_id),
    })),
  });

  // Resolve full video records for whatever is in progress, keeping the
  // watched/total seconds around so we can render a progress bar per card.
  const continueEntries = cont.data || [];
  const continueVideoQueries = useQueries({
    queries: continueEntries.slice(0, 15).map((h) => ({
      queryKey: ["videoDetails", h.video_id],
      queryFn: () => contentApi.video(h.video_id),
    })),
  });
  const continueVideos = continueVideoQueries
    .map((q, i) => {
      const video = q.data;
      const entry = continueEntries[i];
      if (!video || !entry) return null;
      return { ...video, __watched: entry.watched_seconds, __total: entry.total_seconds };
    })
    .filter(Boolean);

  // Resolve the person's saved list into full video cards.
  const watchlistEntries = watch.data || [];
  const watchlistVideoQueries = useQueries({
    queries: watchlistEntries.slice(0, 20).map((w) => ({
      queryKey: ["videoDetails", w.video_id],
      queryFn: () => contentApi.video(w.video_id),
    })),
  });
  const watchlistVideos = watchlistVideoQueries.map((q) => q.data).filter(Boolean);

  // "Because you watched X" — recommend titles similar to whatever the
  // person most recently resumed, so the home page feels personalised.
  const mostRecent = continueEntries[0];
  const similar = useQuery({
    queryKey: ["similar", mostRecent?.video_id],
    queryFn: () => contentApi.similar(mostRecent.video_id),
    enabled: !!mostRecent,
  });

  const ids = (watch.data || []).map((x) => x.video_id);
  const toggle = useMutation({
    mutationFn: async (v) => {
      if (!profile) throw new Error("Choose a profile to use your watchlist.");
      return ids.includes(v.video_id)
        ? userApi.removeWatchlist(profile.profile_id, v.video_id)
        : userApi.addWatchlist(profile.profile_id, v.video_id);
    },
    onMutate: async (v) => {
      if (!profile) return;
      await qc.cancelQueries({ queryKey: ["watchlist", profile.profile_id] });
      const old = qc.getQueryData(["watchlist", profile.profile_id]);
      qc.setQueryData(["watchlist", profile.profile_id], (items = []) =>
        ids.includes(v.video_id)
          ? items.filter((i) => i.video_id !== v.video_id)
          : [
              ...items,
              {
                video_id: v.video_id,
                profile_id: profile.profile_id,
                watchlist_id: -v.video_id,
              },
            ],
      );
      return { old };
    },
    onError: (e, _v, c) => {
      if (profile) qc.setQueryData(["watchlist", profile.profile_id], c?.old);
      toast.error(apiError(e));
    },
    onSettled: () =>
      profile &&
      qc.invalidateQueries({ queryKey: ["watchlist", profile.profile_id] }),
  });

  const removeContinue = useMutation({
    mutationFn: (v) => userApi.removeContinueWatching(profile.profile_id, v.video_id),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ["continueWatching", profile.profile_id] });
      const old = qc.getQueryData(["continueWatching", profile.profile_id]);
      qc.setQueryData(["continueWatching", profile.profile_id], (items = []) =>
        items.filter((i) => i.video_id !== v.video_id),
      );
      return { old };
    },
    onError: (e, _v, c) => {
      qc.setQueryData(["continueWatching", profile.profile_id], c?.old);
      toast.error(apiError(e));
    },
    onSuccess: () => toast.success("Removed from Continue watching"),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: ["continueWatching", profile.profile_id] }),
  });

  if (core.some((q) => q.isLoading)) return <PageLoader />;
  if (core.some((q) => q.isError))
    return (
      <ErrorState
        message="The catalogue is unavailable."
        retry={() => core.forEach((q) => q.refetch())}
      />
    );

  // Rotate through a healthy pool of featured/trending/latest titles so the
  // banner isn't stuck on a single film, deduped by video id.
  const bannerSlides = Array.from(
    new Map(
      [
        ...(featured.data || []),
        ...(trending.data || []).slice(0, 5),
        ...(latest.data || []).slice(0, 5),
      ].map((v) => [v.video_id, v]),
    ).values(),
  ).slice(0, 8);

  return (
    <>
      <HeroBanner
        slides={bannerSlides}
        onToggleWatchlist={profile ? toggle.mutate : undefined}
        watchlistIds={ids}
      />
      {continueVideos.length > 0 && (
        <ContentRow
          title="Continue watching"
          subtitle="Pick up where you left off"
          videos={continueVideos}
          getProgress={(v) =>
            v.__total ? (v.__watched / v.__total) * 100 : 0
          }
          onRemove={profile ? removeContinue.mutate : undefined}
        />
      )}
      <ContentRow
        title="Trending now"
        videos={trending.data || []}
        onToggle={toggle.mutate}
        watchlistIds={ids}
      />
      {similar.data?.length > 0 && (
        <ContentRow
          title="Because you watched your recent pick"
          videos={similar.data}
          onToggle={toggle.mutate}
          watchlistIds={ids}
        />
      )}
      <ContentRow
        title="Latest releases"
        videos={latest.data || []}
        onToggle={toggle.mutate}
        watchlistIds={ids}
      />
      {watchlistVideos.length > 0 && (
        <ContentRow
          title="My list"
          videos={watchlistVideos}
          onToggle={toggle.mutate}
          watchlistIds={ids}
        />
      )}
      {(categories.data || []).map((c, i) => (
        <ContentRow
          key={c.category_id}
          title={c.category_name}
          videos={categoryQueries[i]?.data || []}
          onToggle={toggle.mutate}
          watchlistIds={ids}
        />
      ))}
    </>
  );
}
