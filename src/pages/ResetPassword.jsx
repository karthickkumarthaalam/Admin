import React, { useState } from "react";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import BreadCrumb from "../components/BreadCrum";
import CopyrightFooter from "../components/CopyRightsComponent";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { apiCall } from "../utils/apiCall";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [newUserForm, setNewUserForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const [newUserErrors, setNewUserErrors] = useState({});

  const { user } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewUserChange = (e) => {
    setNewUserForm({ ...newUserForm, [e.target.name]: e.target.value });
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

  const validateNewUserForm = () => {
    const newErrors = {};
    if (!newUserForm.email) newErrors.email = "Email is required.";
    if (!newUserForm.password) newErrors.password = "Password is required.";
    if (!newUserForm.confirmPassword)
      newErrors.confirmPassword = "Please confirm the password.";
    if (newUserForm.password !== newUserForm.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    setNewUserErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let payload = {
      email: user.email,
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateNewUserForm()) return;

    try {
      await apiCall("/auth/signup", "POST", newUserForm);
      toast.success("User created successfully!");
      setNewUserForm({
        email: "",
        password: "",
        confirmPassword: "",
      });
      setNewUserErrors({});
    } catch (error) {
      toast.error("Failed to create user");
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <BreadCrumb title={"Settings"} paths={["Reset Password"]} />

        <div className="flex flex-col flex-1 px-6 py-8 overflow-y-auto">
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
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.currentPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition`}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
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
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full border ${
                      errors.newPassword ? "border-red-500" : "border-gray-300"
                    } p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition`}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
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
                  <input
                    type="password"
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

            {user?.user?.email === "admin" && (
              <>
                <h2 className="text-lg font-semibold text-gray-800 pb-3 border-b border-gray-200 mt-10 mb-6">
                  Create User
                </h2>

                <form onSubmit={handleCreateUser} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm font-medium">
                        Email
                      </label>
                      <input
                        type="text"
                        name="email"
                        value={newUserForm.email}
                        onChange={handleNewUserChange}
                        className={`w-full border ${
                          newUserErrors.email
                            ? "border-red-500"
                            : "border-gray-300"
                        } p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition`}
                        placeholder="Enter email"
                      />
                      {newUserErrors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {newUserErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 text-sm font-medium">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={newUserForm.password}
                        onChange={handleNewUserChange}
                        className={`w-full border ${
                          newUserErrors.password
                            ? "border-red-500"
                            : "border-gray-300"
                        } p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition`}
                        placeholder="Enter password"
                      />
                      {newUserErrors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {newUserErrors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 text-sm font-medium">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={newUserForm.confirmPassword}
                        onChange={handleNewUserChange}
                        className={`w-full border ${
                          newUserErrors.confirmPassword
                            ? "border-red-500"
                            : "border-gray-300"
                        } p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition`}
                        placeholder="Confirm password"
                      />
                      {newUserErrors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {newUserErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="submit"
                      className="bg-red-500 text-white px-6 py-3 rounded-lg shadow hover:bg-red-600 transition"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <CopyrightFooter />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
