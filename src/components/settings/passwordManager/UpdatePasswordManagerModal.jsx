import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";

const UpdatePasswordManagerModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleUpdate = async () => {
    if (!currentPassword || !newPassword) {
      return toast.error("Both fields are required.");
    }

    setLoading(true);
    try {
      await apiCall("/passwords/update-access-manager", "POST", {
        currentPassword,
        newPassword,
      });

      toast.success("Password Manager Access Updated Successfully");

      setCurrentPassword("");
      setNewPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);

      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl p-6 relative w-full max-w-sm">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-red-600">
          Change Access Password
        </h2>

        {/* Current Password */}
        <div className="relative mb-3">
          <input
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current Password"
            className="border w-full rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword((prev) => !prev)}
            className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
          >
            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* New Password */}
        <div className="relative mb-4">
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="border w-full rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((prev) => !prev)}
            className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
          >
            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
};

export default UpdatePasswordManagerModal;
