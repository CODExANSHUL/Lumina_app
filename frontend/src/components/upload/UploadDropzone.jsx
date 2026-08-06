import { Image, RotateCcw, Upload, Video, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiError } from "../../api/client";
import { uploadApi } from "../../api/upload.api";
import { UPLOAD_LIMITS, UPLOAD_TYPES } from "../../config/uploads";
export function UploadDropzone({ kind, onUploaded, label }) {
  const [file, setFile] = useState();
  const [preview, setPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState("idle");
  const abort = useRef(undefined);
  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  const choose = (f) => {
    if (!f) return;
    const allowed = UPLOAD_TYPES[kind];
    if (!allowed.includes(f.type)) {
      toast.error("This file type is not supported.");
      return;
    }
    if (f.size > UPLOAD_LIMITS[kind]) {
      toast.error("This file is larger than the configured limit.");
      return;
    }
    setFile(f);
    setState("idle");
    setProgress(0);
  };
  const run = async () => {
    if (!file || state === "uploading") return;
    abort.current = new AbortController();
    setState("uploading");
    try {
      const r = await uploadApi.upload(
        kind,
        file,
        abort.current.signal,
        setProgress,
      );
      setState("success");
      onUploaded(r.filename);
      toast.success("Upload complete");
    } catch (e) {
      if (e.code !== "ERR_CANCELED") {
        setState("error");
        toast.error(apiError(e));
      } else setState("idle");
    }
  };
  return (
    <div>
      <p className="label">{label || `Upload ${kind}`}</p>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          choose(e.dataTransfer.files[0]);
        }}
        className="rounded-2xl border border-dashed border-white/20 bg-white/[.03] p-4"
      >
        <input
          id={`upload-${kind}`}
          className="sr-only"
          type="file"
          accept={UPLOAD_TYPES[kind].join(",")}
          onChange={(e) => choose(e.target.files?.[0])}
        />
        {!file ? (
          <label
            htmlFor={`upload-${kind}`}
            className="grid cursor-pointer place-items-center py-8 text-center"
          >
            <Upload className="text-coral" />
            <span className="mt-3 text-sm font-semibold">
              Drop a file or browse
            </span>
            <span className="mt-1 text-xs text-mist">
              Frontend validates format and size; backend rules remain
              authoritative.
            </span>
          </label>
        ) : (
          <div className="flex gap-4">
            <div className="grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-lg bg-black">
              {preview && file.type.startsWith("image/") ? (
                <img
                  className="h-full w-full object-cover"
                  src={preview}
                  alt="Preview"
                />
              ) : preview && file.type.startsWith("video/") ? (
                <video className="h-full w-full object-cover" src={preview} />
              ) : kind === "video" ? (
                <Video />
              ) : (
                <Image />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="mt-1 text-xs text-mist">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {state === "uploading" && (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-coral"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              <div className="mt-3 flex gap-2">
                {state !== "success" && (
                  <button
                    type="button"
                    className="btn-secondary !min-h-9 !px-3"
                    onClick={
                      state === "uploading" ? () => abort.current?.abort() : run
                    }
                  >
                    {state === "uploading" ? (
                      "Cancel"
                    ) : state === "error" ? (
                      <>
                        <RotateCcw size={14} />
                        Retry
                      </>
                    ) : (
                      "Upload"
                    )}
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-full p-2 text-mist hover:bg-white/10"
                  onClick={() => {
                    if (state === "uploading") abort.current?.abort();
                    setFile(undefined);
                    setPreview("");
                    setState("idle");
                  }}
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
