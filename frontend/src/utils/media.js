import { API_BASE_URL } from "../api/client";
export function mediaUrl(value, kind = "thumbnail") {
  if (!value) return "";
  if (
    /^https?:\/\//i.test(value) ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  )
    return value;
  const clean = value.replace(/^\/+/, "");
  if (clean.startsWith("uploads/") || clean.startsWith("stream/"))
    return `${API_BASE_URL}/${clean}`;
  const name = clean.split(/[\\/]/).pop();
  return kind === "video"
    ? `${API_BASE_URL}/stream/${encodeURIComponent(name || "")}`
    : `${API_BASE_URL}/uploads/${kind === "profile" ? "profiles" : kind + "s"}/${encodeURIComponent(name || "")}`;
}
export const money = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
export const duration = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
