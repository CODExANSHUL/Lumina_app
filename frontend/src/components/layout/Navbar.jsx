import { Bell, ChevronDown, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { mediaUrl } from "../../utils/media";
const links = [
  ["Browse", "/browse"],
  ["My List", "/watchlist"],
  ["Continue", "/continue-watching"],
  ["Plans", "/plans"],
];
export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, activeProfile, logout } = useAuthStore();
  const loc = useLocation();
  return (
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-ink/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          to="/browse"
          className="flex items-center gap-2 text-xl font-black tracking-tight"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-coral text-sm text-white">
            L
          </span>
          LUMINA
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([n, p]) => (
            <NavLink
              key={p}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm transition ${isActive ? "bg-white/10 text-white" : "text-mist hover:text-white"}`
              }
              to={p}
            >
              {n}
            </NavLink>
          ))}
          {user?.role === "ADMIN" && (
            <NavLink
              className="rounded-full px-4 py-2 text-sm text-coral"
              to="/admin"
            >
              Admin
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-1">
          <Link
            to="/search"
            className="rounded-full p-2.5 text-mist hover:bg-white/10 hover:text-white"
            aria-label="Search"
          >
            <Search size={19} />
          </Link>
          {user && (
            <Link
              to="/account"
              className="rounded-full p-2.5 text-mist hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell size={19} />
            </Link>
          )}
          {user ? (
            <div className="group relative hidden sm:block">
              <button className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-white/10">
                <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-coral to-purple-500 text-xs font-bold">
                  {activeProfile?.avatar_name ? (
                    <img
                      className="h-full w-full object-cover"
                      src={mediaUrl(activeProfile.avatar_name, "profile")}
                      alt=""
                    />
                  ) : (
                    (activeProfile?.display_name || user.full_name).slice(0, 1)
                  )}
                </span>
                <ChevronDown size={14} />
              </button>
              <div className="invisible absolute right-0 top-full w-52 translate-y-1 rounded-xl border border-white/10 bg-panel p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
                <p className="px-3 py-2 text-xs text-mist">
                  {activeProfile?.display_name || user.full_name}
                </p>
                <Link
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5"
                  to="/profiles"
                >
                  Switch profile
                </Link>
                <Link
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5"
                  to="/account"
                >
                  Account
                </Link>
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-coral hover:bg-white/5"
                  onClick={() => {
                    logout();
                    location.assign("/login");
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              state={{ from: loc }}
              className="btn-secondary hidden sm:inline-flex"
            >
              Sign in
            </Link>
          )}
          <button
            className="rounded-full p-2.5 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="container-page border-t border-white/10 py-3 md:hidden">
          {links.map(([n, p]) => (
            <Link
              key={p}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-mist hover:bg-white/5"
              to={p}
            >
              {n}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link to="/admin" className="block px-3 py-3 text-coral">
              Admin
            </Link>
          )}
          {user && (
            <button
              className="block w-full px-3 py-3 text-left text-coral"
              onClick={() => {
                logout();
                location.assign("/login");
              }}
            >
              Sign out
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
export const Footer = () => (
  <footer className="mt-24 border-t border-white/10">
    <div className="container-page flex flex-col gap-4 py-10 text-sm text-mist sm:flex-row sm:items-center sm:justify-between">
      <span>© 2026 Lumina Streaming</span>
      <span>Stories move us forward.</span>
    </div>
  </footer>
);
