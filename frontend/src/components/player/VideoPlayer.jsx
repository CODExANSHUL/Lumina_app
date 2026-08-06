import {
  AlertCircle,
  LoaderCircle,
  Maximize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { duration } from "../../utils/media";
export function VideoPlayer({ src, title, resumeAt = 0, onSave }) {
  const video = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [volume, setVolume] = useState(1);
  const lastSave = useRef(0);
  const save = useCallback(() => {
    const el = video.current;
    if (el && Number.isFinite(el.duration) && el.currentTime > 0)
      onSave?.(el.currentTime, el.duration);
  }, [onSave]);
  useEffect(() => {
    const onBefore = () => save();
    window.addEventListener("pagehide", onBefore);
    return () => {
      window.removeEventListener("pagehide", onBefore);
      save();
    };
  }, [save]);
  const loaded = () => {
    const el = video.current;
    if (!el) return;
    setTotal(el.duration || 0);
    if (resumeAt > 0 && resumeAt < el.duration - 10) el.currentTime = resumeAt;
    setLoading(false);
  };
  const update = () => {
    const el = video.current;
    if (!el) return;
    setCurrent(el.currentTime);
    if (el.currentTime - lastSave.current >= 30) {
      lastSave.current = el.currentTime;
      save();
    }
  };
  if (error)
    return (
      <div className="grid aspect-video place-items-center bg-black text-center">
        <div>
          <AlertCircle className="mx-auto text-coral" />
          <p className="mt-3 font-semibold">Playback unavailable</p>
          <p className="mt-1 text-sm text-mist">
            The video file could not be loaded.
          </p>
        </div>
      </div>
    );
  return (
    <div className="group relative aspect-video overflow-hidden bg-black">
      <video
        ref={video}
        src={src}
        className="h-full w-full"
        onLoadedMetadata={loaded}
        onTimeUpdate={update}
        onWaiting={() => setLoading(true)}
        onPlaying={() => {
          setLoading(false);
          setPlaying(true);
        }}
        onPause={() => {
          setPlaying(false);
          save();
        }}
        onError={() => setError(true)}
        onClick={() =>
          video.current?.paused ? video.current.play() : video.current?.pause()
        }
        playsInline
        aria-label={title}
      />
      {loading && (
        <LoaderCircle className="absolute left-1/2 top-1/2 animate-spin text-white" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-16 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
        <input
          type="range"
          min={0}
          max={total || 0}
          step="0.1"
          value={current}
          onChange={(e) => {
            if (video.current)
              video.current.currentTime = Number(e.target.value);
          }}
          className="w-full accent-coral"
          aria-label="Seek"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() =>
              video.current?.paused
                ? video.current.play()
                : video.current?.pause()
            }
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause fill="currentColor" />
            ) : (
              <Play fill="currentColor" />
            )}
          </button>
          <button
            onClick={() => {
              if (video.current) {
                video.current.muted = !video.current.muted;
                setVolume(video.current.muted ? 0 : video.current.volume);
              }
            }}
            aria-label={volume ? "Mute" : "Unmute"}
          >
            {volume ? <Volume2 /> : <VolumeX />}
          </button>
          <input
            aria-label="Volume"
            className="hidden w-24 accent-coral sm:block"
            type="range"
            min="0"
            max="1"
            step=".05"
            value={volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              if (video.current) {
                video.current.volume = v;
                video.current.muted = v === 0;
              }
            }}
          />
          <span className="text-xs tabular-nums text-white/80">
            {duration(current)} / {duration(total)}
          </span>
          <span className="ml-auto truncate text-sm">{title}</span>
          <button
            onClick={() => video.current?.requestFullscreen()}
            aria-label="Fullscreen"
          >
            <Maximize />
          </button>
        </div>
      </div>
    </div>
  );
}
