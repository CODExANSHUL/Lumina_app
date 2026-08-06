import { Check, ChevronLeft, ChevronRight, Info, Play, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mediaUrl } from "../../utils/media";

const AUTOPLAY_MS = 7000;

/**
 * Netflix-style hero banner that automatically cycles through a set of
 * featured titles, with pause-on-hover, swipe/arrow navigation, and a
 * progress rail so the person always knows when the next title is coming.
 */
export function HeroBanner({ slides = [], onToggleWatchlist, watchlistIds = [] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(false);
  // Rotation pauses if EITHER condition is true. Keeping these as two
  // separate flags (instead of one shared `paused` boolean two different
  // handlers both write to) matters: without it, tabbing back into the
  // window fires visibilitychange -> resume, which force-restarts
  // rotation even while the mouse is still sitting on the banner.
  const paused = hovered || hidden;

  // Keep index valid if the slide list changes size (e.g. data refetch).
  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    // Depending on `index` here is intentional: it restarts the countdown
    // whenever the slide changes, whether that change came from this timer
    // or from a manual dot/arrow click, so a manual click never gets
    // immediately undone by the timer firing a moment later.
    return () => clearInterval(id);
  }, [paused, slides.length, index]);

  // Pause while the tab is backgrounded so we don't burn through slides
  // nobody is looking at — tracked separately from hover, see above.
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const goTo = (next) => setIndex(((next % slides.length) + slides.length) % slides.length);
  const ids = useMemo(() => new Set(watchlistIds), [watchlistIds]);

  if (import.meta.env.DEV && slides.length <= 1) {
    // Auto-rotation is disabled by design when there's nothing to rotate
    // to. This is the #1 cause of "the banner isn't changing" during
    // local testing with a thinly-seeded catalogue, so flag it clearly
    // instead of failing silently.
    // eslint-disable-next-line no-console
    console.warn(
      `[HeroBanner] Only ${slides.length} unique slide(s) resolved from featured/trending/latest — rotation stays off until there are at least 2 distinct titles.`,
    );
  }

  if (!slides.length) return null;
  const hero = slides[index];

  return (
    <section
      className="group relative min-h-[68vh] overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.video_id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          {slide.banner_name ? (
            <img
              className="h-full w-full object-cover"
              src={mediaUrl(slide.banner_name, "banner")}
              alt=""
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-[#372428] via-[#142433] to-ink" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
        </div>
      ))}

      <div className="container-page relative flex min-h-[68vh] items-end pb-16 sm:items-center">
        <div className="max-w-2xl">
          <p className="eyebrow">Featured presentation</p>
          <h1 className="mt-4 font-display text-5xl leading-none sm:text-7xl">
            {hero.title}
          </h1>
          <p className="mt-5 line-clamp-3 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            {hero.description || "A remarkable story, selected for your screen."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-primary" to={`/watch/${hero.video_id}`}>
              <Play size={17} fill="currentColor" />
              Watch now
            </Link>
            <Link className="btn-secondary" to={`/video/${hero.video_id}`}>
              <Info size={17} />
              Details
            </Link>
            {onToggleWatchlist && (
              <button
                className="btn-secondary"
                onClick={() => onToggleWatchlist(hero)}
              >
                {ids.has(hero.video_id) ? <Check size={17} /> : <Plus size={17} />}
                My list
              </button>
            )}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            aria-label="Previous title"
            onClick={() => goTo(index - 1)}
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 opacity-0 backdrop-blur transition group-hover:opacity-100 sm:block hover:bg-black/60"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            aria-label="Next title"
            onClick={() => goTo(index + 1)}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 opacity-0 backdrop-blur transition group-hover:opacity-100 sm:block hover:bg-black/60"
          >
            <ChevronRight size={22} />
          </button>

          <div className="container-page absolute inset-x-0 bottom-6 flex items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.video_id}
                aria-label={`Show ${slide.title}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className="h-1.5 flex-1 max-w-12 overflow-hidden rounded-full bg-white/20"
              >
                {i < index ? (
                  <span className="block h-full w-full rounded-full bg-coral" />
                ) : i > index ? (
                  <span className="block h-full w-0 rounded-full bg-coral" />
                ) : (
                  <span
                    key={index}
                    className="progress-fill block h-full rounded-full bg-coral"
                    style={{
                      animationDuration: `${AUTOPLAY_MS}ms`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
