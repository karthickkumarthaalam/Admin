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

function AppRoutes() {

  const { user } = useAuth();


  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/transactions" element={user ? <Transactions /> : <Navigate to="/" />} />
      <Route path="/subscribers" element={user ? <Subscribers /> : <Navigate to="/" />} />
      <Route path="/coupons" element={user ? <Coupons /> : <Navigate to="/" />} />
      <Route path="/packages" element={user ? <Packages /> : <Navigate to="/" />} />
      <Route path="/settings" element={user ? <ResetPassword /> : <Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
