import React, { useState, useCallback } from "react";
import { apiCall } from "../utils/apiCall";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const startTimer = useCallback(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
        }
        return prevTimer - 1;
      });
    }, 1000);
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }

    try {
      await apiCall("/auth/forgot-password", "POST", { email });
      setIsOtpSent(true);
      startTimer();
      toast.success("OTP sent successfully!");
    } catch (error) {
      toast.error("Failed to send OTP!");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    let validationErrors = {};
    if (!otp) {
      validationErrors.otp = "Please enter a valid OTP";
    }

    if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword =
        "Password and confirm password must match";
    }

    if (!newPassword) {
      validationErrors.newPassword = "New password is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await apiCall("/auth/reset-password", "POST", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      toast.success("Password reset successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to reset password!");
    }
  };

  return (
    <div
      className="flex h-screen justify-center items-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/A8J3K9Z5QW/background_image.jpg')",
      }}
    >
      <form
        onSubmit={isOtpSent ? handlePasswordReset : handleEmailSubmit}
        className="bg-white p-12 rounded-lg shadow-lg w-[450px] space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Reset Password
        </h2>

        {!isOtpSent && (
          <div className="relative">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: "" });
              }}
              placeholder=" "
              className={`peer w-full border rounded-lg ${
                errors.email ? "border-red-500" : "border-gray-300"
              } p-3 pt-5 rounded focus:outline-none focus:ring-1 ${
                errors.email ? "focus:ring-red-800" : "focus:ring-red-500"
              }`}
            />
            <label
              htmlFor="email"
              className={`absolute left-3 top-4 text-md transition-all ${
                errors.email ? "text-red-500" : "text-gray-500"
              } peer-focus:top-1 peer-focus:text-xs peer-focus:${
                errors.email ? "text-red-500" : "text-gray-500"
              } peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-xs`}
            >
              Email
            </label>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
        )}

        {isOtpSent && (
          <div className="relative">
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setErrors({ ...errors, otp: "" });
              }}
              placeholder=" "
              className={`peer w-full border rounded-lg ${
                errors.otp ? "border-red-500" : "border-gray-300"
              } p-3 pt-5 rounded focus:outline-none focus:ring-1 ${
                errors.otp ? "focus:ring-red-800" : "focus:ring-red-500"
              }`}
            />
            <label
              htmlFor="otp"
              className={`absolute left-3 top-4 text-md transition-all ${
                errors.otp ? "text-red-500" : "text-gray-500"
              } peer-focus:top-1 peer-focus:text-xs peer-focus:${
                errors.otp ? "text-red-500" : "text-gray-500"
              } peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-xs`}
            >
              OTP
            </label>
            {errors.otp && (
              <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
            )}
          </div>
        )}
        {isOtpSent && (
          <>
            <div className="relative">
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors({ ...errors, newPassword: "" });
                }}
                placeholder=" "
                className={`peer w-full border p-3 pt-5  rounded-lg focus:outline-none focus:ring-1 ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                } ${
                  errors.newPassword
                    ? "focus:ring-red-800"
                    : "focus:ring-red-500"
                }`}
              />
              <label
                htmlFor="newPassword"
                className={`absolute left-3 top-4 text-md transition-all ${
                  errors.newPassword ? "text-red-500" : "text-gray-500"
                } peer-focus:top-1 peer-focus:text-xs peer-focus:${
                  errors.newPassword ? "text-red-500" : "text-gray-500"
                } peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-xs`}
              >
                New Password
              </label>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({ ...errors, confirmPassword: "" });
                }}
                placeholder=" "
                className={`peer w-full border p-3 pt-5 rounded-lg focus:outline-none focus:ring-1 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } ${
                  errors.confirmPassword
                    ? "focus:ring-red-800"
                    : "focus:ring-red-500"
                }`}
              />
              <label
                htmlFor="confirmPassword"
                className={`absolute left-3 top-4 text-md transition-all ${
                  errors.confirmPassword ? "text-red-500" : "text-gray-500"
                } peer-focus:top-1 peer-focus:text-xs peer-focus:${
                  errors.confirmPassword ? "text-red-500" : "text-gray-500"
                } peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-xs`}
              >
                Confirm Password
              </label>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </>
        )}

        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors duration-200
           bg-gradient-to-r from-gray-700 to-gray-900 cursor-not-allowed text-white`}
        >
          {isOtpSent ? "Reset Password" : "Send OTP"}
        </button>

        {/* Timer for OTP */}
        {isOtpSent && timer > 1 && (
          <p className="text-center text-sm">OTP expires in {timer}s</p>
        )}

        {isOtpSent && timer < 1 && (
          <button
            type="button"
            onClick={handleEmailSubmit}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors duration-200
           bg-gradient-to-l from-blue-700 to-blue-900 cursor-not-allowed text-white`}
          >
            Resend OTP
          </button>
        )}
      </form>

      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
