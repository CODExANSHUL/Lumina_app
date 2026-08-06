import {
  Clapperboard,
  CreditCard,
  Folder,
  Home,
  Layers,
  Menu,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
const links = [
  ["Overview", "/admin", Home],
  ["Videos", "/admin/videos", Clapperboard],
  ["Categories", "/admin/categories", Folder],
  ["Series", "/admin/series", Layers],
  ["Seasons", "/admin/seasons", Layers],
  ["Episodes", "/admin/episodes", Video],
  ["Plans", "/admin/plans", CreditCard],
  ["Uploads", "/admin/uploads", Upload],
];
export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[250px] border-r border-white/10 bg-[#0c111a] p-4 transition lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-12 items-center justify-between px-2">
          <Link className="font-black" to="/admin">
            <span className="mr-2 inline-grid h-8 w-8 place-items-center rounded-lg bg-coral">
              L
            </span>
            LUMINA
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        <p className="mb-3 mt-7 px-3 text-[10px] font-bold tracking-[.2em] text-mist">
          ADMIN STUDIO
        </p>
        <nav className="space-y-1">
          {links.map(([name, path, Icon]) => (
            <NavLink
              end={path === "/admin"}
              onClick={() => setOpen(false)}
              to={path}
              key={path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${isActive ? "bg-coral text-white" : "text-mist hover:bg-white/5 hover:text-white"}`
              }
            >
              <Icon size={18} />
              {name}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/browse"
          className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-mist hover:text-white"
        >
          Back to streaming
        </Link>
      </aside>
      <main className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-4 sm:px-8">
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu />
          </button>
          <p className="ml-auto text-sm text-mist">Administrator workspace</p>
        </header>
        <div className="p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
