import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Edit3,
  Film,
  Folder,
  Layers,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { adminApi } from "../../api/admin.api";
import { apiError } from "../../api/client";
import { contentApi } from "../../api/content.api";
import { subscriptionApi } from "../../api/subscription.api";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageLoader,
} from "../../components/common/States";
import { FormField, Input } from "../../components/common/FormField";
import { UploadDropzone } from "../../components/upload/UploadDropzone";
import { useAuthStore } from "../../store/auth";
import { mediaUrl, money } from "../../utils/media";
const Header = ({ eyebrow = "Admin studio", title, action }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">{title}</h1>
    </div>
    {action}
  </div>
);
function useVideoCollection() {
  const q = useQueries({
    queries: [
      { queryKey: ["latest"], queryFn: contentApi.latest },
      { queryKey: ["trending"], queryFn: contentApi.trending },
      { queryKey: ["featured"], queryFn: contentApi.featured },
    ],
  });
  const videos = useMemo(
    () =>
      Array.from(
        new Map(
          q.flatMap((x) => x.data || []).map((v) => [v.video_id, v]),
        ).values(),
      ),
    [q],
  );
  return {
    videos,
    loading: q.some((x) => x.isLoading),
    error: q.some((x) => x.isError),
    refetch: () => q.forEach((x) => x.refetch()),
  };
}
export function AdminDashboard() {
  const v = useVideoCollection();
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: contentApi.categories,
  });
  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: subscriptionApi.plans,
  });
  const cards = [
    { value: v.videos.length, label: "Visible titles", icon: Film },
    { value: categories.data?.length || 0, label: "Categories", icon: Folder },
    { value: plans.data?.length || 0, label: "Plans", icon: Layers },
    {
      value: v.videos.filter((x) => x.status === "DRAFT").length,
      label: "Drafts",
      icon: Edit3,
    },
  ];
  return (
    <>
      <Header title="Control room" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ value, label, icon: Icon }) => (
          <div className="panel p-5" key={label}>
            <Icon className="text-coral" />
            <p className="mt-6 text-3xl font-bold">{value}</p>
            <p className="mt-1 text-sm text-mist">{label}</p>
          </div>
        ))}
      </div>
      <div className="panel mt-8 p-6">
        <h2 className="text-xl font-semibold">Backend-aware overview</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mist">
          Totals are derived from featured, latest, and trending endpoints. The
          backend does not expose a complete admin video list or analytics
          endpoint, so these figures are intentionally limited to visible
          catalogue data.
        </p>
      </div>
    </>
  );
}
export function AdminVideos() {
  const coll = useVideoCollection();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [del, setDel] = useState();
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id) => adminApi.deleteVideo(id),
    onSuccess: () => {
      toast.success("Video deleted");
      setDel(undefined);
      ["latest", "trending", "featured"].forEach((k) =>
        qc.invalidateQueries({ queryKey: [k] }),
      );
    },
    onError: (e) => toast.error(apiError(e)),
  });
  const filtered = coll.videos.filter(
    (v) =>
      v.title.toLowerCase().includes(search.toLowerCase()) &&
      (!type || v.content_type === type),
  );
  if (coll.loading) return <PageLoader />;
  if (coll.error) return <ErrorState retry={coll.refetch} />;
  return (
    <>
      <Header
        title="Video library"
        action={
          <Link className="btn-primary" to="/admin/videos/new">
            <Plus size={17} />
            New video
          </Link>
        }
      />
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-mist" size={18} />
          <input
            className="field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter titles"
          />
        </div>
        <select
          className="field max-w-52"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All types</option>
          <option>MOVIE</option>
          <option>WEB_SERIES</option>
          <option>DOCUMENTARY</option>
          <option>TRAILER</option>
        </select>
      </div>
      {!filtered.length ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-mist">
              <tr>
                <th className="p-4">Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Year</th>
                <th className="pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.video_id} className="border-t border-white/10">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-10 overflow-hidden rounded bg-white/5">
                        {v.thumbnail_name && (
                          <img
                            className="h-full w-full object-cover"
                            src={mediaUrl(v.thumbnail_name)}
                            alt=""
                          />
                        )}
                      </div>
                      <span className="font-medium">{v.title}</span>
                    </div>
                  </td>
                  <td>{v.content_type.replace("_", " ")}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${v.status === "PUBLISHED" ? "bg-green-400/10 text-green-400" : "bg-amber-400/10 text-amber-300"}`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td>{v.release_year || "—"}</td>
                  <td className="pr-4 text-right">
                    <Link
                      className="inline-block rounded-full p-2 hover:bg-white/10"
                      to={`/admin/videos/${v.video_id}/edit`}
                    >
                      <Edit3 size={17} />
                    </Link>
                    <button
                      className="rounded-full p-2 text-coral hover:bg-white/10"
                      onClick={() => setDel(v)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(undefined)}
        onConfirm={() => del && mutation.mutate(del.video_id)}
        title="Delete video?"
        body="This permanently deletes the video metadata and related season mappings. Uploaded files may remain on disk."
        busy={mutation.isPending}
      />
    </>
  );
}
const videoSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().optional(),
  content_type: z.enum(["MOVIE", "WEB_SERIES", "DOCUMENTARY", "TRAILER"]),
  release_year: z
    .number()
    .int()
    .min(1888)
    .max(new Date().getFullYear() + 2)
    .optional(),
  duration_minutes: z.number().int().positive().optional(),
  language: z.string().optional(),
  age_rating: z.enum(["ALL", "KIDS", "TEEN", "ADULT"]),
  thumbnail_name: z.string().min(1, "Upload a thumbnail"),
  banner_name: z.string().min(1, "Upload a banner"),
  trailer_url: z.union([z.url(), z.literal("")]).optional(),
  video_url: z.string().min(1, "Upload a video"),
  status: z.enum(["DRAFT", "PUBLISHED", "REMOVED"]),
  category_ids: z.array(z.number()),
});
export function VideoFormPage() {
  const id = Number(useParams().videoId);
  const editing = Number.isFinite(id);
  const user = useAuthStore((s) => s.user);
  const nav = useNavigate();
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: contentApi.categories,
  });
  const existing = useQuery({
    queryKey: ["videoDetails", id],
    queryFn: () => contentApi.video(id),
    enabled: editing,
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "",
      description: "",
      content_type: "MOVIE",
      age_rating: "ALL",
      status: "DRAFT",
      category_ids: [],
    },
  });
  if (existing.data && !watch("title"))
    reset({ ...existing.data, category_ids: existing.data.category_ids || [] });
  const mutation = useMutation({
    mutationFn: (values) => {
      const body = values;
      return editing
        ? adminApi.updateVideo(id, body)
        : adminApi.createVideo(user.user_id, body);
    },
    onSuccess: () => {
      toast.success(editing ? "Video updated" : "Video created");
      nav("/admin/videos");
    },
    onError: (e) => toast.error(apiError(e)),
  });
  if (existing.isLoading) return <PageLoader />;
  return (
    <>
      <Header
        title={editing ? "Edit video" : "Create video"}
        eyebrow="Catalogue"
      />
      <form
        className="grid gap-6 xl:grid-cols-[1fr_380px]"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
      >
        <div className="panel space-y-5 p-6">
          <FormField label="Title" error={errors.title?.message}>
            <Input {...register("title")} />
          </FormField>
          <FormField label="Description">
            <textarea className="field" rows={5} {...register("description")} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Content type">
              <select className="field" {...register("content_type")}>
                <option>MOVIE</option>
                <option>WEB_SERIES</option>
                <option>DOCUMENTARY</option>
                <option>TRAILER</option>
              </select>
            </FormField>
            <FormField label="Status">
              <select className="field" {...register("status")}>
                <option>DRAFT</option>
                <option>PUBLISHED</option>
                <option>REMOVED</option>
              </select>
            </FormField>
            <FormField
              label="Release year"
              error={errors.release_year?.message}
            >
              <Input
                type="number"
                {...register("release_year", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Duration (minutes)"
              error={errors.duration_minutes?.message}
            >
              <Input
                type="number"
                {...register("duration_minutes", { valueAsNumber: true })}
              />
            </FormField>
            <FormField label="Language">
              <Input {...register("language")} />
            </FormField>
            <FormField label="Age rating">
              <select className="field" {...register("age_rating")}>
                <option>ALL</option>
                <option>KIDS</option>
                <option>TEEN</option>
                <option>ADULT</option>
              </select>
            </FormField>
          </div>
          <FormField label="Trailer URL" error={errors.trailer_url?.message}>
            <Input type="url" {...register("trailer_url")} />
          </FormField>
          <fieldset>
            <legend className="label">Categories</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.data?.map((c) => (
                <label
                  className="rounded-xl border border-white/10 p-3 text-sm"
                  key={c.category_id}
                >
                  <input
                    className="mr-2 accent-coral"
                    type="checkbox"
                    value={c.category_id}
                    {...register("category_ids", {
                      setValueAs: (v) => v.map(Number),
                    })}
                  />
                  {c.category_name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <aside className="space-y-5">
          <div className="panel space-y-5 p-5">
            <UploadDropzone
              kind="thumbnail"
              onUploaded={(f) => setValue("thumbnail_name", f)}
            />
            <UploadDropzone
              kind="banner"
              onUploaded={(f) => setValue("banner_name", f)}
            />
            <UploadDropzone
              kind="video"
              onUploaded={(f) => setValue("video_url", f)}
            />
          </div>
          <button className="btn-primary w-full" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Saving…"
              : editing
                ? "Save changes"
                : "Create video"}
          </button>
          <p className="text-xs leading-relaxed text-mist">
            Successful upload filenames remain in the form if metadata creation
            fails, so you can retry without uploading again.
          </p>
        </aside>
      </form>
    </>
  );
}
const categorySchema = z.object({
  category_name: z.string().trim().min(2, "Enter at least 2 characters"),
  description: z.string().optional(),
});
export function AdminCategories() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["categories"],
    queryFn: contentApi.categories,
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(categorySchema) });
  const mutation = useMutation({
    mutationFn: adminApi.createCategory,
    onSuccess: () => {
      toast.success("Category added");
      reset();
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error(apiError(e)),
  });
  return (
    <>
      <Header title="Categories" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-mist">
              <tr>
                <th className="p-4">Name</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {q.data?.map((c) => (
                <tr className="border-t border-white/10" key={c.category_id}>
                  <td className="p-4 font-medium">{c.category_name}</td>
                  <td className="text-mist">{c.description || "—"}</td>
                  <td>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          className="panel h-fit space-y-4 p-5"
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
        >
          <h2 className="text-lg font-semibold">Add category</h2>
          <FormField label="Name" error={errors.category_name?.message}>
            <Input {...register("category_name")} />
          </FormField>
          <FormField label="Description">
            <textarea className="field" rows={3} {...register("description")} />
          </FormField>
          <button className="btn-primary w-full" disabled={mutation.isPending}>
            Add category
          </button>
          <p className="text-xs text-mist">
            Update and delete are unavailable because the backend exposes no
            matching routes.
          </p>
        </form>
      </div>
    </>
  );
}
const planSchema = z.object({
  plan_name: z.string().min(2),
  description: z.string().min(2),
  price: z.number().positive(),
  duration_days: z.number().int().positive(),
  max_screens: z.number().int().positive(),
  video_quality: z.enum(["SD", "HD", "FULL_HD", "UHD"]),
});
export function AdminPlans() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["plans"], queryFn: subscriptionApi.plans });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: { video_quality: "HD", max_screens: 1 },
  });
  const mutation = useMutation({
    mutationFn: (v) => adminApi.createPlan(v),
    onSuccess: () => {
      toast.success("Plan created");
      reset();
      qc.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (e) => toast.error(apiError(e)),
  });
  return (
    <>
      <Header title="Subscription plans" />
      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {q.data?.map((p) => (
            <article className="panel p-5" key={p.plan_id}>
              <p className="eyebrow">{p.video_quality.replace("_", " ")}</p>
              <h2 className="mt-3 text-xl font-semibold">{p.plan_name}</h2>
              <p className="mt-1 text-sm text-mist">{p.description}</p>
              <p className="mt-5 text-2xl font-bold">{money(p.price)}</p>
              <p className="mt-1 text-xs text-mist">
                {p.duration_days} days · {p.max_screens} screens
              </p>
            </article>
          ))}
        </div>
        <form
          className="panel h-fit space-y-4 p-5"
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
        >
          <h2 className="text-lg font-semibold">Add plan</h2>
          <FormField label="Plan name" error={errors.plan_name?.message}>
            <Input {...register("plan_name")} />
          </FormField>
          <FormField label="Description" error={errors.description?.message}>
            <Input {...register("description")} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Price" error={errors.price?.message}>
              <Input
                type="number"
                step=".01"
                {...register("price", { valueAsNumber: true })}
              />
            </FormField>
            <FormField label="Days" error={errors.duration_days?.message}>
              <Input
                type="number"
                {...register("duration_days", { valueAsNumber: true })}
              />
            </FormField>
            <FormField label="Screens" error={errors.max_screens?.message}>
              <Input
                type="number"
                {...register("max_screens", { valueAsNumber: true })}
              />
            </FormField>
            <FormField label="Quality">
              <select className="field" {...register("video_quality")}>
                <option>SD</option>
                <option>HD</option>
                <option>FULL_HD</option>
                <option>UHD</option>
              </select>
            </FormField>
          </div>
          <button className="btn-primary w-full" disabled={mutation.isPending}>
            Create plan
          </button>
        </form>
      </div>
    </>
  );
}
const seasonSchema = z.object({
  video_id: z.number().int().positive(),
  season_number: z.number().int().positive(),
  title: z.string().min(2),
  description: z.string().optional(),
  release_year: z
    .number()
    .int()
    .min(1888)
    .max(new Date().getFullYear() + 2)
    .optional(),
});
export function AdminSeasons() {
  const videos = useVideoCollection();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(seasonSchema) });
  const mutation = useMutation({
    mutationFn: adminApi.createSeason,
    onSuccess: () => {
      toast.success("Season added");
      reset();
    },
    onError: (e) => toast.error(apiError(e)),
  });
  return (
    <>
      <Header title="Add a season" eyebrow="Series workflow" />
      <form
        className="panel max-w-2xl space-y-5 p-6"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
      >
        <FormField label="Series">
          <select
            className="field"
            {...register("video_id", { valueAsNumber: true })}
          >
            <option value="">Select a series</option>
            {videos.videos
              .filter((v) => v.content_type === "WEB_SERIES")
              .map((v) => (
                <option value={v.video_id} key={v.video_id}>
                  {v.title}
                </option>
              ))}
          </select>
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Season number"
            error={errors.season_number?.message}
          >
            <Input
              type="number"
              {...register("season_number", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Release year" error={errors.release_year?.message}>
            <Input
              type="number"
              {...register("release_year", { valueAsNumber: true })}
            />
          </FormField>
        </div>
        <FormField label="Title" error={errors.title?.message}>
          <Input {...register("title")} />
        </FormField>
        <FormField label="Description">
          <textarea className="field" rows={4} {...register("description")} />
        </FormField>
        <button className="btn-primary" disabled={mutation.isPending}>
          Add season
        </button>
      </form>
    </>
  );
}
const episodeSchema = z.object({
  season_id: z.number().int().positive(),
  episode_number: z.number().int().positive(),
  title: z.string().min(2),
  description: z.string().optional(),
  duration_minutes: z.number().int().positive().optional(),
  thumbnail_name: z.string().optional(),
  video_url: z.string().min(1, "Upload an episode video"),
  release_date: z.string().optional(),
});
export function AdminEpisodes() {
  const [series, setSeries] = useState();
  const [season, setSeason] = useState();
  const videos = useVideoCollection();
  const seasons = useQuery({
    queryKey: ["seasons", series],
    queryFn: () => contentApi.seasons(series),
    enabled: !!series,
  });
  const episodes = useQuery({
    queryKey: ["episodes", season],
    queryFn: () => contentApi.episodes(season),
    enabled: !!season,
  });
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(episodeSchema) });
  const mutation = useMutation({
    mutationFn: (v) => adminApi.createEpisode(v),
    onSuccess: () => {
      toast.success("Episode added");
      reset();
      episodes.refetch();
    },
    onError: (e) => toast.error(apiError(e)),
  });
  return (
    <>
      <Header title="Episodes" eyebrow="Series workflow" />
      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <div className="panel h-fit space-y-4 p-5">
          <FormField label="Series">
            <select
              className="field"
              value={series || ""}
              onChange={(e) => setSeries(Number(e.target.value))}
            >
              <option value="">Select series</option>
              {videos.videos
                .filter((v) => v.content_type === "WEB_SERIES")
                .map((v) => (
                  <option key={v.video_id} value={v.video_id}>
                    {v.title}
                  </option>
                ))}
            </select>
          </FormField>
          <FormField label="Season">
            <select
              className="field"
              value={season || ""}
              onChange={(e) => {
                const n = Number(e.target.value);
                setSeason(n);
                setValue("season_id", n);
              }}
            >
              <option value="">Select season</option>
              {seasons.data?.map((s) => (
                <option key={s.season_id} value={s.season_id}>
                  Season {s.season_number}: {s.title}
                </option>
              ))}
            </select>
          </FormField>
          {episodes.data?.map((e) => (
            <div
              className="rounded-xl bg-white/5 p-3 text-sm"
              key={e.episode_id}
            >
              E{e.episode_number} · {e.title}
            </div>
          ))}
        </div>
        <form
          className="panel space-y-5 p-6"
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
        >
          <input
            type="hidden"
            {...register("season_id", { valueAsNumber: true })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Episode number"
              error={errors.episode_number?.message}
            >
              <Input
                type="number"
                {...register("episode_number", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Release date"
              error={errors.release_date?.message}
            >
              <Input type="date" {...register("release_date")} />
            </FormField>
          </div>
          <FormField label="Title" error={errors.title?.message}>
            <Input {...register("title")} />
          </FormField>
          <FormField label="Description">
            <textarea className="field" rows={3} {...register("description")} />
          </FormField>
          <FormField
            label="Duration (minutes)"
            error={errors.duration_minutes?.message}
          >
            <Input
              type="number"
              {...register("duration_minutes", { valueAsNumber: true })}
            />
          </FormField>
          <UploadDropzone
            kind="thumbnail"
            label="Episode thumbnail"
            onUploaded={(f) => setValue("thumbnail_name", f)}
          />
          <UploadDropzone
            kind="video"
            label="Episode video"
            onUploaded={(f) =>
              setValue("video_url", f, { shouldValidate: true })
            }
          />
          {errors.video_url && (
            <p className="text-xs text-red-400">{errors.video_url.message}</p>
          )}
          <button
            className="btn-primary w-full"
            disabled={mutation.isPending || !season}
          >
            Add episode
          </button>
        </form>
      </div>
    </>
  );
}
export function AdminSeries() {
  const v = useVideoCollection();
  return (
    <>
      <Header
        title="Series"
        action={
          <Link className="btn-primary" to="/admin/videos/new">
            <Plus size={17} />
            Create series
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {v.videos
          .filter((x) => x.content_type === "WEB_SERIES")
          .map((x) => (
            <Link
              to={`/admin/videos/${x.video_id}/edit`}
              className="panel flex gap-4 p-4 hover:border-white/20"
              key={x.video_id}
            >
              <div className="h-24 w-16 overflow-hidden rounded-lg bg-white/5">
                {x.thumbnail_name && (
                  <img
                    className="h-full w-full object-cover"
                    src={mediaUrl(x.thumbnail_name)}
                    alt=""
                  />
                )}
              </div>
              <div>
                <p className="font-semibold">{x.title}</p>
                <p className="mt-1 text-sm text-mist">
                  {x.release_year || "Unscheduled"} · {x.status}
                </p>
              </div>
            </Link>
          ))}
      </div>
    </>
  );
}
export function AdminUploads() {
  return (
    <>
      <Header title="Media uploads" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <UploadDropzone
            kind="video"
            onUploaded={(f) => toast.success(`Saved as ${f}`)}
          />
        </div>
        <div className="panel p-5">
          <UploadDropzone
            kind="thumbnail"
            onUploaded={(f) => toast.success(`Saved as ${f}`)}
          />
        </div>
        <div className="panel p-5">
          <UploadDropzone
            kind="banner"
            onUploaded={(f) => toast.success(`Saved as ${f}`)}
          />
        </div>
        <div className="panel p-5">
          <UploadDropzone
            kind="profile"
            onUploaded={(f) => toast.success(`Saved as ${f}`)}
          />
        </div>
      </div>
    </>
  );
}
