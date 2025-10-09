import React, { useState } from "react";
import BreadCrumb from "../components/BreadCrum";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../utils/apiCall";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState({});

  const { user } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.currentPassword)
      newErrors.currentPassword = "Current password is required.";
    if (!formData.newPassword)
      newErrors.newPassword = "New password is required.";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your new password.";
    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let payload = {
      email: user?.email,
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    };

    try {
      await apiCall("/auth/reset-password2", "POST", payload);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error("Failed to update password");
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb title={"Settings"} paths={["Reset Password"]} />

      <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 pb-3 border-b border-gray-200 mb-6">
            Reset Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.currentPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition`}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        currentPassword: !prev.currentPassword,
                      }))
                    }
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  >
                    {showPassword.currentPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.newPassword ? "border-red-500" : "border-gray-300"
                    } p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition`}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword((prev) => ({
                        ...prev,
                        newPassword: !prev.newPassword,
                      }));
                    }}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  >
                    {showPassword.newPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition`}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword((prev) => ({
                        ...prev,
                        confirmPassword: !prev.confirmPassword,
                      }));
                    }}
                    className="absolute inset-y-0 right-3 text-gray-500 flex items-center"
                  >
                    {showPassword.confirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <button
                type="submit"
                className="bg-red-500 text-white px-6 py-3 rounded-lg shadow hover:bg-red-600 transition"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
