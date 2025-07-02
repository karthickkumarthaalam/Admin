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
import ResetPassword from "./pages/ResetPassword";
import LoadingComponent from "./components/LoadingComponent";
import Members from "./pages/Members";
import Banner from "./pages/Banner";
import PodcastPage from "./pages/PodcastPage";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/transactions" element={user && user?.acl.includes("transactions") ? <Transactions /> : <Navigate to="/" />} />
      <Route path="/subscribers" element={user && user?.acl.includes("subscribers") ? <Subscribers /> : <Navigate to="/" />} />
      <Route path="/members" element={user && user?.acl.includes("members") ? <Members /> : <Navigate to="/" />} />
      <Route path="/coupons" element={user && user?.acl.includes("coupons") ? <Coupons /> : <Navigate to="/" />} />
      <Route path="/packages" element={user && user?.acl.includes("packages") ? <Packages /> : <Navigate to="/" />} />
      <Route path="/banner" element={user && user?.acl.includes("banners") ? <Banner /> : <Navigate to="/" />} />
      <Route path="/podcasts" element={user && user?.acl.includes("podcasts") ? <PodcastPage /> : <Navigate to="/" />} />
      <Route path="/settings" element={user ? <ResetPassword /> : <Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/A8J3K9Z5QW">
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
