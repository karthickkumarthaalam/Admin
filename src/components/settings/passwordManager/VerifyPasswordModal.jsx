import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";

const VerifyPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleVerify = async () => {
    if (!password) return toast.error("Enter password");
    setLoading(true);
    try {
      const res = await apiCall("/passwords/verify-access-manager", "POST", {
        password,
      });

      if (res.message === "Access granted") {
        sessionStorage.setItem("passwordManagerAccessGranted", "true");
        toast.success("Access granted");

        // Clear password field
        setPassword("");
        setShowPassword(false);

        // Run callback
        onSuccess();
      } else {
        toast.error("Invalid password");
      }
    } catch (error) {
      toast.error("Failed to verify password");
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
          Password Verification
        </h2>

        {/* Password Field with Eye toggle */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="border w-full rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
};

export default VerifyPasswordModal;
