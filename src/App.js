import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Subscribers from "./pages/Subscribers";
import Coupons from "./pages/Coupons";
import Packages from "./pages/Packages";
import ForgotPassword from "./pages/ForgotPassword";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoadingComponent from "./components/LoadingComponent";
import Members from "./pages/Members";
import PodcastPage from "./pages/PodcastPage";
import BannerPage from "./pages/BannerPage";
import ProgramsPage from "./pages/ProgramsPage";
import AgreementPage from "./pages/AgreementPage";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";
import { PermissionProvider, usePermission } from "./context/PermissionContext";

function AppRoutes() {
  const { user, loading } = useAuth();
  const { hasPermission, permissionsLoaded } = usePermission();

  if (loading || (user && !permissionsLoaded)) {
    return <LoadingComponent />;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />

      <Route path="/users" element={hasPermission("User", "read") ? <UsersPage /> : <Navigate to="/" />} />
      <Route path="/transactions" element={hasPermission("Transaction", "read") ? <Transactions /> : <Navigate to="/" />} />
      <Route path="/subscribers" element={hasPermission("Subscriber", "read") ? <Subscribers /> : <Navigate to="/" />} />
      <Route path="/members" element={hasPermission("Members", "read") ? <Members /> : <Navigate to="/" />} />
      <Route path="/coupons" element={hasPermission("Coupon", "read") ? <Coupons /> : <Navigate to="/" />} />
      <Route path="/packages" element={hasPermission("Package", "read") ? <Packages /> : <Navigate to="/" />} />
      <Route path="/banner" element={hasPermission("Banner", "read") ? <BannerPage /> : <Navigate to="/" />} />
      <Route path="/podcasts" element={hasPermission("Podcast", "read") ? <PodcastPage /> : <Navigate to="/" />} />
      <Route path="/agreements" element={hasPermission("Agreements", "read") ? <AgreementPage /> : <Navigate to="/" />} />
      <Route path="/programs" element={hasPermission("Radio Station", "read") ? <ProgramsPage /> : <Navigate to="/" />} />
      <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <BrowserRouter basename="/A8J3K9Z5QW">
          <ToastContainer position="top-right" autoClose={3000} />
          <AppRoutes />
        </BrowserRouter>
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;
