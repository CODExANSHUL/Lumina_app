import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { contentApi } from "../../api/content.api";
import { apiError } from "../../api/client";
import { userApi } from "../../api/user.api";
import { ContentCard } from "../../components/content/ContentCard";
import {
  EmptyState,
  ErrorState,
  SkeletonGrid,
} from "../../components/common/States";
import { useAuthStore } from "../../store/auth";
export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [value, setValue] = useState(params.get("q") || "");
  const profile = useAuthStore((s) => s.activeProfile);
  useEffect(() => {
    const t = setTimeout(() => {
      const q = value.trim();
      setParams(q ? { q } : {}, { replace: true });
    }, 350);
    return () => clearTimeout(t);
  }, [value, setParams]);
  const q = params.get("q") || "";
  const result = useQuery({
    queryKey: ["search", q],
    queryFn: () => contentApi.search(q),
    enabled: q.length > 1,
  });
  useEffect(() => {
    if (q && profile)
      userApi
        .saveSearch(profile.profile_id, q)
        .catch((error) => toast.error(apiError(error)));
  }, [q, profile]);
  return (
    <div className="container-page min-h-[70vh] py-12">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Find your next story</p>
        <h1 className="mt-3 font-display text-5xl">Search Lumina</h1>
        <div className="relative mt-8">
          <Search className="absolute left-5 top-4 text-mist" />
          <input
            className="field h-14 rounded-2xl pl-14 pr-12 text-base"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Titles, languages, or themes"
            aria-label="Search videos"
          />
          {value && (
            <button
              onClick={() => setValue("")}
              className="absolute right-4 top-4 text-mist"
              aria-label="Clear search"
            >
              <X />
            </button>
          )}
        </div>
      </div>
      <div className="mt-12">
        {result.isLoading && <SkeletonGrid count={10} />}{" "}
        {result.isError && <ErrorState retry={() => result.refetch()} />}{" "}
        {q.length < 2 && (
          <EmptyState
            title="What are you in the mood for?"
            message="Type at least two characters to begin."
          />
        )}
        {result.data?.length === 0 && (
          <EmptyState
            title="No matching stories"
            message={`We couldn't find anything for “${q}”. Try another word.`}
          />
        )}{" "}
        {result.data && result.data.length > 0 && (
          <>
            <p className="mb-5 text-sm text-mist">
              {result.data.length} result{result.data.length === 1 ? "" : "s"}{" "}
              for “{q}”
            </p>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {result.data.map((v) => (
                <ContentCard key={v.video_id} video={v} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
