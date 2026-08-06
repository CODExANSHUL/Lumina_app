import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";
import LandingPage from "./pages/public/LandingPage";
import { LoginPage, RegisterPage } from "./pages/public/AuthPages";
import BrowsePage from "./pages/user/BrowsePage";
import SearchPage from "./pages/user/SearchPage";
import ProfilesPage from "./pages/user/ProfilesPage";
import PlansPage, { SubscriptionPage } from "./pages/user/PlansPage";
import {
  AccountPage,
  CheckoutPage,
  PaymentResultPage,
  PaymentsPage,
} from "./pages/user/PaymentPages";
import { VideoDetailsPage, WatchPage } from "./pages/user/VideoPages";
import { ContinuePage, WatchlistPage } from "./pages/user/LibraryPages";
import {
  AdminCategories,
  AdminDashboard,
  AdminEpisodes,
  AdminPlans,
  AdminSeasons,
  AdminSeries,
  AdminUploads,
  AdminVideos,
  VideoFormPage,
} from "./pages/admin/AdminPages";
import { AdminRoute, ProtectedRoute } from "./routes/guards";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<AppLayout />}>
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/video/:videoId" element={<VideoDetailsPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/watch/:videoId" element={<WatchPage />} />
            <Route
              path="/checkout/:subscriptionId"
              element={<CheckoutPage />}
            />
            <Route
              path="/payment/success"
              element={<PaymentResultPage success />}
            />
            <Route
              path="/payment/failed"
              element={<PaymentResultPage success={false} />}
            />
            <Route path="/profiles" element={<ProfilesPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/continue-watching" element={<ContinuePage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route
              path="/account/subscription"
              element={<SubscriptionPage />}
            />
            <Route path="/account/payments" element={<PaymentsPage />} />
          </Route>
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="videos/new" element={<VideoFormPage />} />
            <Route path="videos/:videoId/edit" element={<VideoFormPage />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="series" element={<AdminSeries />} />
            <Route path="seasons" element={<AdminSeasons />} />
            <Route path="episodes" element={<AdminEpisodes />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="uploads" element={<AdminUploads />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
