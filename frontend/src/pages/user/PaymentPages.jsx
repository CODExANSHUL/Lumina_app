import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, CreditCard, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiError } from "../../api/client";
import { loadRazorpay, paymentApi } from "../../api/payment.api";
import { subscriptionApi } from "../../api/subscription.api";
import { userApi } from "../../api/user.api";
import { ErrorState, PageLoader } from "../../components/common/States";
import { useAuthStore } from "../../store/auth";
import { money } from "../../utils/media";
import { AccountShell } from "./PlansPage";
export function CheckoutPage() {
  const planId = Number(useParams().subscriptionId);
  const user = useAuthStore((s) => s.user);
  const nav = useNavigate();
  const qc = useQueryClient();
  const mounted = useRef(true);
  const checkoutSession = useRef({ subscriptionId: null, order: null });
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );
  const [warning, setWarning] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: subscriptionApi.plans,
  });
  const mutation = useMutation({
    mutationFn: async () => {
      setWarning("");
      setCheckoutError("");
      await loadRazorpay();
      if (!checkoutSession.current.subscriptionId) {
        const subscription = await subscriptionApi.subscribe(
          user.user_id,
          planId,
          "UPI",
          false,
        );
        checkoutSession.current.subscriptionId = subscription.subscription_id;
      }
      if (!checkoutSession.current.order) {
        checkoutSession.current.order = await paymentApi.createOrder(
          checkoutSession.current.subscriptionId,
        );
      }
      const order = checkoutSession.current.order;
      if (
        !order?.key ||
        !order?.order_id ||
        !Number.isFinite(order?.amount) ||
        order.amount <= 0
      ) {
        checkoutSession.current.order = null;
        throw new Error("The payment server returned an invalid order.");
      }
      return await new Promise((resolve, reject) => {
        let settled = false;
        let verificationStarted = false;
        const finish = (callback, value) => {
          if (settled) return;
          settled = true;
          callback(value);
        };
        const checkout = new window.Razorpay({
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          order_id: order.order_id,
          name: import.meta.env.VITE_APP_NAME || "Lumina",
          description: plans.data?.find((p) => p.plan_id === planId)?.plan_name,
          prefill: {
            name: user.full_name,
            email: user.email,
            contact: user.mobile,
          },
          theme: { color: "#ff5a47" },
          handler: async (response) => {
            verificationStarted = true;
            try {
              const verified = await paymentApi.verify(response);
              if (!verified.success)
                throw new Error(verified.message || "Verification failed");
              finish(resolve);
            } catch (e) {
              if (mounted.current) {
                setWarning(
                  "Your payment may have completed, but verification failed. Do not pay again until you check payment history.",
                );
              }
              finish(reject, e);
            }
          },
          modal: {
            ondismiss: () => {
              if (!verificationStarted) {
                finish(
                  reject,
                  new Error("Checkout was closed before payment completed."),
                );
              }
            },
          },
        });
        checkout.on("payment.failed", (response) => {
          finish(
            reject,
            new Error(response.error?.description || "Payment failed."),
          );
        });
        checkout.open();
      });
    },
    onSuccess: () => {
      if (!mounted.current) return;
      toast.success("Payment verified");
      checkoutSession.current = { subscriptionId: null, order: null };
      qc.invalidateQueries({ queryKey: ["paymentHistory"] });
      qc.invalidateQueries({ queryKey: ["activeSubscription", user.user_id] });
      nav("/payment/success", { replace: true });
    },
    onError: (e) => {
      if (!mounted.current) return;
      const message = apiError(e);
      setCheckoutError(message);
      toast.error(message);
    },
  });
  const plan = plans.data?.find((p) => p.plan_id === planId);
  if (plans.isLoading) return <PageLoader />;
  if (!plan)
    return <ErrorState message="That subscription plan is unavailable." />;
  return (
    <div className="container-page py-14">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_.75fr]">
        <div>
          <p className="eyebrow">Secure checkout</p>
          <h1 className="mt-3 font-display text-5xl">Finish with Razorpay</h1>
          <p className="mt-4 max-w-xl text-mist">
            Your amount comes directly from the server. Lumina never receives or
            verifies your payment signature in the browser.
          </p>
          {warning && (
            <div className="mt-6 flex gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
              <AlertTriangle className="shrink-0" />
              {warning}
            </div>
          )}
          {checkoutError && !warning && (
            <div className="mt-6 flex gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
              <XCircle className="shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}
          {warning && (
            <Link
              to="/account/payments"
              className="btn-secondary mt-4 inline-flex"
            >
              Check payment history
            </Link>
          )}
        </div>
        <aside className="panel p-7">
          <p className="text-sm text-mist">Selected plan</p>
          <h2 className="mt-1 text-2xl font-semibold">{plan.plan_name}</h2>
          <div className="my-6 h-px bg-white/10" />
          <p className="text-4xl font-bold">{money(plan.price)}</p>
          <p className="mt-2 text-sm text-mist">
            {plan.duration_days} days · {plan.video_quality.replace("_", " ")} ·{" "}
            {plan.max_screens} screens
          </p>
          <button
            className="btn-primary mt-8 w-full"
            disabled={mutation.isPending || Boolean(warning)}
            onClick={() => mutation.mutate()}
          >
            <CreditCard size={17} />
            {mutation.isPending
              ? "Preparing secure checkout…"
              : checkoutError
                ? "Retry secure checkout"
                : "Pay with Razorpay"}
          </button>
          <p className="mt-4 text-center text-xs text-mist">
            You’ll complete payment in Razorpay’s secure checkout.
          </p>
        </aside>
      </div>
    </div>
  );
}
export function PaymentResultPage({ success }) {
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-16">
      <div className="panel max-w-lg p-9 text-center">
        {success ? (
          <CheckCircle2 className="mx-auto text-green-400" size={52} />
        ) : (
          <XCircle className="mx-auto text-coral" size={52} />
        )}
        <h1 className="mt-5 font-display text-4xl">
          {success ? "Payment verified" : "Payment incomplete"}
        </h1>
        <p className="mt-3 text-mist">
          {success
            ? "Your membership is active. The next story is waiting."
            : "No verified payment was recorded. You can safely retry from the plans page."}
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link className="btn-primary" to={success ? "/browse" : "/plans"}>
            {success ? "Start watching" : "Try again"}
          </Link>
          <Link className="btn-secondary" to="/account/payments">
            Payment history
          </Link>
        </div>
      </div>
    </div>
  );
}
export function PaymentsPage() {
  const q = useQuery({
    queryKey: ["paymentHistory"],
    queryFn: paymentApi.history,
  });
  return (
    <AccountShell title="Payments">
      {q.isLoading ? (
        <PageLoader />
      ) : q.isError ? (
        <ErrorState retry={() => q.refetch()} />
      ) : q.data?.length ? (
        <div className="space-y-3">
          {q.data.map((p) => (
            <article key={p.payment_id} className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{money(p.amount, p.currency)}</p>
                  <p className="mt-1 text-xs text-mist">
                    Payment #{p.payment_id} · Subscription #{p.subscription_id}
                  </p>
                </div>
                <StatusBadge status={p.payment_status} />
              </div>
              <dl className="mt-5 grid gap-3 border-t border-white/10 pt-4 text-xs text-mist sm:grid-cols-3">
                <div>
                  <dt>Method</dt>
                  <dd className="mt-1 text-white">{p.payment_method || "—"}</dd>
                </div>
                <div>
                  <dt>Transaction</dt>
                  <dd className="mt-1 truncate text-white">
                    {p.transaction_id || p.razorpay_payment_id || "—"}
                  </dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd className="mt-1 text-white">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleString()
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>Receipt</dt>
                  <dd className="mt-1 text-white">{p.receipt}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-mist">No payments yet.</p>
      )}
    </AccountShell>
  );
}
function StatusBadge({ status }) {
  const good = status === "SUCCESS";
  const bad = ["FAILED", "CANCELLED"].includes(status);
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${good ? "bg-green-400/10 text-green-400" : bad ? "bg-red-400/10 text-red-400" : "bg-amber-400/10 text-amber-300"}`}
    >
      {status}
    </span>
  );
}
export function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const notes = useQuery({
    queryKey: ["notifications", user.user_id],
    queryFn: () => userApi.notifications(user.user_id),
  });
  return (
    <AccountShell title="Your account">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="panel p-6">
          <p className="eyebrow">Member</p>
          <h2 className="mt-3 text-xl font-semibold">{user.full_name}</h2>
          <p className="mt-1 text-sm text-mist">{user.email}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link className="btn-secondary" to="/account/subscription">
              Subscription
            </Link>
            <Link className="btn-secondary" to="/account/payments">
              Payments
            </Link>
          </div>
        </div>
        <div className="panel p-6">
          <p className="eyebrow">Notifications</p>
          {notes.isLoading ? (
            <p className="mt-4 text-sm text-mist">Loading…</p>
          ) : notes.data?.length ? (
            notes.data.slice(0, 4).map((n) => (
              <div
                key={n.notification_id}
                className="mt-4 border-b border-white/10 pb-3"
              >
                <p className="text-sm">{n.message}</p>
                <p className="mt-1 text-xs text-mist">{n.status}</p>
              </div>
            ))
          ) : (
            <p className="mt-4 text-sm text-mist">You're all caught up.</p>
          )}
        </div>
      </div>
    </AccountShell>
  );
}
