import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <nav className="container-page flex h-20 items-center justify-between">
        <div className="text-xl font-black">
          <span className="mr-2 inline-grid h-9 w-9 place-items-center rounded-lg bg-coral">
            L
          </span>
          LUMINA
        </div>
        <div className="flex gap-2">
          <Link className="btn-ghost" to="/login">
            Sign in
          </Link>
          <Link className="btn-primary" to="/register">
            Start watching
          </Link>
        </div>
      </nav>
      <section className="container-page grid min-h-[calc(100vh-80px)] items-center gap-12 pb-20 lg:grid-cols-[1fr_.85fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-coral/20 bg-coral/10 px-3 py-1.5 text-xs font-semibold text-coral">
            <Sparkles size={14} />
            CURATED FOR THE CURIOUS
          </span>
          <h1 className="mt-7 max-w-4xl font-display text-6xl leading-[.95] sm:text-7xl lg:text-[88px]">
            Every frame has a pulse.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-mist">
            Discover cinema beyond the algorithm. Handpicked stories, seamless
            playback, and a watchlist that travels with you.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link className="btn-primary" to="/register">
              <Play size={17} fill="currentColor" />
              Watch free
            </Link>
            <Link className="btn-secondary" to="/browse">
              Explore titles
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-lg">
          <div className="absolute inset-8 rotate-6 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-coral/60 via-purple-900/60 to-slate-950 shadow-2xl" />
          <div className="absolute inset-8 -rotate-3 rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-sky-900 via-slate-900 to-black" />
          <div className="absolute inset-x-0 bottom-0 rounded-[2.5rem] border border-white/10 bg-panel/80 p-8 backdrop-blur-xl">
            <p className="eyebrow">Tonight's selection</p>
            <p className="mt-3 font-display text-4xl">
              The quiet side of thunder
            </p>
            <p className="mt-3 text-sm text-mist">2h 08m · Drama · 2026</p>
          </div>
        </div>
      </section>
    </main>
  );
}
