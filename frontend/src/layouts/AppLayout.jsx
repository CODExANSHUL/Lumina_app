import { Outlet } from "react-router-dom";
import { Footer, Navbar } from "../components/layout/Navbar";
export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
