export const UPLOAD_LIMITS = {
  video: 2 * 1024 * 1024 * 1024,
  thumbnail: 10 * 1024 * 1024,
  banner: 15 * 1024 * 1024,
  profile: 5 * 1024 * 1024,
};
export const UPLOAD_TYPES = {
  video: ["video/mp4", "video/webm"],
  thumbnail: ["image/jpeg", "image/png", "image/webp"],
  banner: ["image/jpeg", "image/png", "image/webp"],
  profile: ["image/jpeg", "image/png", "image/webp"],
};
