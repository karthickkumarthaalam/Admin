import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { apiCall } from "../../../../utils/apiCall";

const AddBudgetMerchantModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [merchantName, setMerchantName] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setMerchantName(editData.merchant_name || "");
      } else {
        setMerchantName("");
      }
      setErrors({});
    }
  }, [isOpen, editData]);

  const validateForm = () => {
    const newErrors = {};
    if (!merchantName.trim()) {
      newErrors.merchant_name = "Merchant name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      merchant_name: merchantName.trim(),
    };

    try {
      if (editData) {
        await apiCall(`/budget-merchant/${editData.id}`, "PATCH", payload);
        toast.success("Merchant updated successfully!");
      } else {
        await apiCall("/budget-merchant", "POST", payload);
        toast.success("Merchant created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save merchant.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {editData ? "Edit Budget Merchant" : "Add Budget Merchant"}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Merchant Name
          </label>
          <input
            type="text"
            value={merchantName}
            onChange={(e) => {
              setMerchantName(e.target.value);
              setErrors({});
            }}
            className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {errors.merchant_name && (
            <p className="text-sm text-red-500 mt-1">{errors.merchant_name}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            {editData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBudgetMerchantModal;
