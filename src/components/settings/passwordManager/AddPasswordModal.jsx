import React, { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const AddPasswordModal = ({
  isOpen,
  onClose,
  editPasswordId,
  editPasswordData,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    service_name: "",
    username: "",
    password: "",
    url: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      if (editPasswordData) populateForm(editPasswordData);
    }
  }, [isOpen, editPasswordData]);

  const resetForm = () => {
    setForm({
      service_name: "",
      username: "",
      password: "",
      url: "",
    });
    setErrors({});
  };

  const populateForm = (data) => {
    setForm({
      service_name: data.service_name || "",
      username: data.username || "",
      password: data.password || "",
      url: data.url || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username) newErrors.username = "Username / Email is required.";
    if (!form.password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        service_name: form.service_name,
        username: form.username,
        password: form.password,
        url: form.url,
      };

      if (editPasswordId) {
        await apiCall(`/passwords/${editPasswordId}`, "PUT", payload);
        toast.success("Password entry updated successfully!");
      } else {
        await apiCall("/passwords", "POST", payload);
        toast.success("Password entry created successfully!");
      }

      onSuccess();
    } catch (error) {
      toast.error("Failed to save password entry.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-xl p-6 relative overflow-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {editPasswordId ? "Edit Password Entry" : "Add Password Entry"}
        </h2>

        <div className="space-y-4">
          {/* Service Name */}
          <div className="flex flex-col">
            <label
              htmlFor="service_name"
              className="font-semibold mb-1 text-sm"
            >
              Service Name
            </label>
            <input
              type="text"
              name="service_name"
              id="service_name"
              placeholder="e.g. Thaalam Admin"
              value={form.service_name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Username / Email */}
          <div className="flex flex-col">
            <label htmlFor="username" className="font-semibold mb-1 text-sm">
              Username / Email <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Enter username or email"
              value={form.username}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label htmlFor="password" className="font-semibold mb-1 text-sm">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* URL */}
          <div className="flex flex-col">
            <label htmlFor="url" className="font-semibold mb-1 text-sm">
              Login URL
            </label>
            <input
              type="text"
              name="url"
              id="url"
              placeholder="https://login.example.com"
              value={form.url}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
          >
            {editPasswordId ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPasswordModal;
