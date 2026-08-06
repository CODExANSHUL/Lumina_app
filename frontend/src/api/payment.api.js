import { api } from "./client";
export const paymentApi = {
  createOrder: async (subscription_id) =>
    (
      await api.post("/payment/create-order", {
        subscription_id,
      })
    ).data,
  verify: async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }) =>
    (
      await api.post("/payment/verify", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      })
    ).data,
  history: async () => (await api.get("/payment/history")).data.payments,
};
let scriptPromise = null;
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const source = "https://checkout.razorpay.com/v1/checkout.js";
    const existing = document.querySelector(`script[src="${source}"]`);
    const script = existing || document.createElement("script");
    const timeout = window.setTimeout(() => {
      scriptPromise = null;
      reject(new Error("Razorpay Checkout timed out while loading."));
    }, 15000);
    script.addEventListener(
      "load",
      () => {
        window.clearTimeout(timeout);
        if (window.Razorpay) resolve();
        else {
          scriptPromise = null;
          reject(new Error("Razorpay Checkout loaded incorrectly."));
        }
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => {
        window.clearTimeout(timeout);
        scriptPromise = null;
        reject(new Error("Razorpay Checkout could not be loaded."));
      },
      { once: true },
    );
    if (!existing) {
      script.src = source;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  });
  return scriptPromise;
}