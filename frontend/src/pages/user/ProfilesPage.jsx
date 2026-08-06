import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Edit3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { apiError } from "../../api/client";
import { userApi } from "../../api/user.api";
import {
  ConfirmDialog,
  EmptyState,
  Modal,
  PageLoader,
} from "../../components/common/States";
import { FormField, Input } from "../../components/common/FormField";
import { UploadDropzone } from "../../components/upload/UploadDropzone";
import { useAuthStore } from "../../store/auth";
import { mediaUrl } from "../../utils/media";
const schema = z.object({
  display_name: z.string().trim().min(2, "Use at least 2 characters"),
  avatar_name: z.string().optional(),
  language_preference: z.string().optional(),
  age_rating_preference: z.string().optional(),
  default_profile: z.boolean(),
});
export default function ProfilesPage() {
  const user = useAuthStore((s) => s.user);
  const setActive = useAuthStore((s) => s.setActiveProfile);
  const nav = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState();
  const query = useQuery({
    queryKey: ["profiles", user.user_id],
    queryFn: () => userApi.profiles(user.user_id),
  });
  const remove = useMutation({
    mutationFn: (id) => userApi.deleteProfile(id),
    onSuccess: () => {
      toast.success("Profile removed");
      setDeleting(undefined);
      qc.invalidateQueries({ queryKey: ["profiles", user.user_id] });
    },
    onError: (e) => toast.error(apiError(e)),
  });
  if (query.isLoading) return <PageLoader />;
  return (
    <div className="container-page min-h-[75vh] py-16 text-center">
      <p className="eyebrow">Make it yours</p>
      <h1 className="mt-3 font-display text-5xl">Who's watching?</h1>
      {query.data?.length === 0 && (
        <EmptyState title="Create your first profile" />
      )}
      <div className="mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-8">
        {query.data?.map((p) => (
          <div key={p.profile_id} className="group relative">
            <button
              onClick={() => {
                setActive(p);
                nav("/browse");
              }}
              className="block"
            >
              <span className="relative grid h-32 w-32 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-coral to-purple-600 text-4xl font-bold ring-white transition group-hover:ring-4">
                {p.avatar_name ? (
                  <img
                    className="h-full w-full object-cover"
                    src={mediaUrl(p.avatar_name, "profile")}
                    alt=""
                  />
                ) : (
                  p.display_name.slice(0, 1)
                )}
                {p.default_profile && (
                  <Check className="absolute bottom-2 right-2 rounded-full bg-ink p-1" />
                )}
              </span>
              <span className="mt-3 block font-medium">{p.display_name}</span>
            </button>
            <div className="mt-2 flex justify-center gap-1">
              <button
                className="rounded-full p-2 text-mist hover:bg-white/10"
                onClick={() => setEditing(p)}
                aria-label="Edit profile"
              >
                <Edit3 size={15} />
              </button>
              <button
                className="rounded-full p-2 text-mist hover:bg-white/10 hover:text-coral"
                onClick={() => setDeleting(p)}
                aria-label="Delete profile"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        <button onClick={() => setEditing(null)} className="group">
          <span className="grid h-32 w-32 place-items-center rounded-3xl border-2 border-dashed border-white/20 text-mist transition group-hover:border-coral group-hover:text-coral">
            <Plus size={36} />
          </span>
          <span className="mt-3 block text-mist">Add profile</span>
        </button>
      </div>
      <ProfileModal profile={editing} onClose={() => setEditing(undefined)} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(undefined)}
        title="Delete profile?"
        body="Watchlist and viewing progress for this profile may be lost permanently."
        busy={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.profile_id)}
      />
    </div>
  );
}
function ProfileModal({ profile, onClose }) {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    values: profile
      ? {
          display_name: profile.display_name,
          avatar_name: profile.avatar_name || "",
          language_preference: profile.language_preference || "English",
          age_rating_preference: profile.age_rating_preference || "ALL",
          default_profile: profile.default_profile,
        }
      : {
          display_name: "",
          avatar_name: "",
          language_preference: "English",
          age_rating_preference: "ALL",
          default_profile: false,
        },
  });
  const mutation = useMutation({
    mutationFn: (v) =>
      profile
        ? userApi.updateProfile(profile.profile_id, v)
        : userApi.createProfile(user.user_id, v),
    onSuccess: () => {
      toast.success(profile ? "Profile updated" : "Profile created");
      qc.invalidateQueries({ queryKey: ["profiles", user.user_id] });
      onClose();
    },
    onError: (e) => toast.error(apiError(e)),
  });
  return (
    <Modal
      open={profile !== undefined}
      onClose={onClose}
      title={profile ? "Edit profile" : "Create profile"}
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
      >
        <FormField label="Profile name" error={errors.display_name?.message}>
          <Input {...register("display_name")} />
        </FormField>
        <UploadDropzone
          kind="profile"
          onUploaded={(f) => setValue("avatar_name", f)}
          label="Avatar (optional)"
        />
        <FormField label="Preferred language">
          <Input {...register("language_preference")} />
        </FormField>
        <FormField label="Age rating">
          <select className="field" {...register("age_rating_preference")}>
            <option>ALL</option>
            <option>KIDS</option>
            <option>TEEN</option>
            <option>ADULT</option>
          </select>
        </FormField>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="accent-coral"
            {...register("default_profile")}
          />
          Make this the default profile
        </label>
        <button className="btn-primary w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save profile"}
        </button>
      </form>
    </Modal>
  );
}
