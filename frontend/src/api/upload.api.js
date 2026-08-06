import { api } from "./client";
export const uploadApi = {
  upload: async (kind, file, signal, onProgress) => {
    const form = new FormData();
    form.append("file", file);
    return (
      await api.post(`/upload/${kind}`, form, {
        signal,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) =>
          onProgress?.(e.total ? Math.round((e.loaded / e.total) * 100) : 0),
      })
    ).data;
  },
};
