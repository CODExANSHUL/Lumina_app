import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Crown } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { apiError } from "../../api/client";
import { subscriptionApi } from "../../api/subscription.api";
import {
  ConfirmDialog,
  ErrorState,
  PageLoader,
} from "../../components/common/States";
import { useAuthStore } from "../../store/auth";
import { money } from "../../utils/media";
import { useState } from "react";
export default function PlansPage() {
  const user = useAuthStore((s) => s.user);
  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: subscriptionApi.plans,
  });
  const active = useQuery({
    queryKey: ["activeSubscription", user?.user_id],
    queryFn: () => subscriptionApi.active(user.user_id),
    enabled: !!user,
  });
  if (plans.isLoading) return <PageLoader />;
  if (plans.isError) return <ErrorState retry={() => plans.refetch()} />;
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Membership</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">
          One screen or every screen.
        </h1>
        <p className="mt-5 text-mist">
          Choose the plan that fits the way you watch. Prices are supplied by
          the backend and confirmed by Razorpay.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
        {plans.data?.map((p, i) => {
          const current = active.data?.plan_id === p.plan_id;
          return (
            <article
              key={p.plan_id}
              className={`panel relative p-7 ${i === 1 ? "border-coral/60 shadow-glow" : ""}`}
            >
              {i === 1 && (
                <span className="absolute right-5 top-5 rounded-full bg-coral/15 px-3 py-1 text-xs font-bold text-coral">
                  MOST POPULAR
                </span>
              )}
              <Crown className="text-coral" />
              <h2 className="mt-5 text-2xl font-semibold">{p.plan_name}</h2>
              <p className="mt-2 min-h-12 text-sm text-mist">{p.description}</p>
              <p className="mt-7 text-4xl font-bold">
                {money(p.price)}
                <span className="text-sm font-normal text-mist">
                  {" "}
                  / {p.duration_days} days
                </span>
              </p>
              <ul className="mt-7 space-y-3 text-sm">
                {[
                  `${p.video_quality.replace("_", " ")} quality`,
                  `${p.max_screens} screen${p.max_screens === 1 ? "" : "s"}`,
                  "Cancel anytime",
                ].map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check size={17} className="text-coral" />
                    {x}
                  </li>
                ))}
              </ul>
              {current ? (
                <div className="mt-8 rounded-full bg-green-400/10 py-3 text-center text-sm font-semibold text-green-400">
                  Current plan
                </div>
              ) : (
                <Link
                  className="btn-primary mt-8 w-full"
                  to={user ? `/checkout/${p.plan_id}` : "/login"}
                >
                  {user ? "Choose plan" : "Sign in to subscribe"}
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
export function SubscriptionPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const active = useQuery({
    queryKey: ["activeSubscription", user.user_id],
    queryFn: () => subscriptionApi.active(user.user_id),
  });
  const history = useQuery({
    queryKey: ["subscriptionHistory", user.user_id],
    queryFn: () => subscriptionApi.history(user.user_id),
  });
  const action = useMutation({
    mutationFn: (kind) =>
      kind === "renew"
        ? subscriptionApi.renew(active.data.subscription_id)
        : subscriptionApi.cancel(active.data.subscription_id),
    onSuccess: () => {
      toast.success("Subscription updated");
      setConfirm(false);
      qc.invalidateQueries({ queryKey: ["activeSubscription", user.user_id] });
      qc.invalidateQueries({ queryKey: ["subscriptionHistory", user.user_id] });
    },
    onError: (e) => toast.error(apiError(e)),
  });
  return (
    <AccountShell title="Subscription">
      <div className="panel p-6">
        {active.isLoading ? (
          "Loading…"
        ) : active.data ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Active plan</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Plan #{active.data.plan_id}
                </h2>
                <p className="mt-2 text-sm text-mist">
                  Renews or expires{" "}
                  {active.data.end_date
                    ? new Date(active.data.end_date).toLocaleDateString()
                    : "as scheduled"}
                </p>
              </div>
              <span className="rounded-full bg-green-400/10 px-3 py-1 text-xs font-semibold text-green-400">
                {active.data.subscription_status}
              </span>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                className="btn-primary"
                onClick={() => action.mutate("renew")}
              >
                Renew
              </button>
              <button
                className="btn-secondary"
                onClick={() => setConfirm(true)}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div>
            <p className="text-mist">No active subscription.</p>
            <Link className="btn-primary mt-5" to="/plans">
              View plans
            </Link>
          </div>
        )}
      </div>
      <h2 className="mb-4 mt-10 text-xl font-semibold">History</h2>
      <div className="space-y-3">
        {history.data?.map((s) => (
          <div
            key={s.subscription_id}
            className="panel flex justify-between p-4 text-sm"
          >
            <span>Subscription #{s.subscription_id}</span>
            <span className="text-mist">{s.subscription_status}</span>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => action.mutate("cancel")}
        title="Cancel subscription?"
        body="Your access may end according to the backend subscription policy."
        busy={action.isPending}
      />
    </AccountShell>
  );
}
export function AccountShell({ title, children }) {
  return (
    <div className="container-page min-h-[70vh] py-12">
      <p className="eyebrow">Account</p>
      <h1 className="mt-3 font-display text-5xl">{title}</h1>
      <div className="mt-8 max-w-4xl">{children}</div>
    </div>
  );
}
