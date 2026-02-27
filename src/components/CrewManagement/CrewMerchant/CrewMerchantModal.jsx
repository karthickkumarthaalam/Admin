import React, { useEffect, useState } from "react";
import { X, Loader2, Plane, Building2 } from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const CrewMerchantModal = ({ isOpen, onClose, editData, onSuccess }) => {
  const [merchantName, setMerchantName] = useState("");
  const [merchantType, setMerchantType] = useState("flight");
  const [loading, setLoading] = useState(false);

  const isEdit = !!editData;

  // Autofill edit data
  useEffect(() => {
    if (editData) {
      setMerchantName(editData.merchant_name || "");
      setMerchantType(editData.merchant_type || "flight");
    } else {
      setMerchantName("");
      setMerchantType("flight");
    }
  }, [editData]);

  // ESC close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleSubmit = async () => {
    if (!merchantName.trim()) {
      toast.error("Merchant name required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        merchant_name: merchantName.trim(),
        merchant_type: merchantType,
      };

      if (isEdit) {
        await apiCall(`/crew-merchant/${editData.id}`, "PUT", payload);
        toast.success("Merchant updated successfully");
      } else {
        await apiCall("/crew-merchant", "POST", payload);
        toast.success("Merchant created successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Enter key submit
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] sm:w-[420px] p-6 relative animate-scaleIn">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-blue-600" size={30} />
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {isEdit ? "Edit Merchant" : "Add New Merchant"}
            </h2>
            <p className="text-xs text-gray-400">
              Manage flight & hotel vendors
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="mt-5 space-y-5">
          {/* Merchant Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Merchant Name
            </label>

            <input
              autoFocus
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Eg: Indigo Airlines / Marriott Hotel"
              className="w-full mt-1 border px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Merchant Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Merchant Type
            </label>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {/* Flight */}
              <div
                onClick={() => setMerchantType("flight")}
                className={`cursor-pointer border rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition
                ${
                  merchantType === "flight"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "hover:bg-gray-50"
                }`}
              >
                <Plane size={16} />
                <span className="text-xs font-semibold">Flight</span>
              </div>

              {/* Hotel */}
              <div
                onClick={() => setMerchantType("room")}
                className={`cursor-pointer border rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition
                ${
                  merchantType === "room"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                    : "hover:bg-gray-50"
                }`}
              >
                <Building2 size={16} />
                <span className="text-xs font-semibold">Room</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-7">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
          >
            {isEdit ? "Update Merchant" : "Create Merchant"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrewMerchantModal;
