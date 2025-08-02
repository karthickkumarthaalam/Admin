import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../../utils/apiCall";
import { X } from "lucide-react";

const AddExpenseMerchant = ({
  isOpen,
  onClose,
  editMerchantData,
  onSuccess,
}) => {
  const [form, setForm] = useState({ merchant_name: "" });

  useEffect(() => {
    if (isOpen) {
      if (editMerchantData) {
        setForm({
          merchant_name: editMerchantData.merchant_name || "",
        });
      } else {
        setForm({
          merchant_name: "",
        });
      }
    }
  }, [isOpen, editMerchantData]);

  const handleSubmit = async () => {
    try {
      if (editMerchantData) {
        await apiCall(`/merchant/${editMerchantData.id}`, "PUT", form);
        toast.success("Merchant updated successfully");
      } else {
        await apiCall(`/merchant`, "POST", form);
        toast.success("Merchant created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save Merchant");
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
          {editMerchantData ? "Edit Expense Merchant" : "Add Expense Merchant"}
        </h2>

        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-sm">Merchant Name</label>
          <input
            type="text"
            name="merchant_name"
            value={form.merchant_name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                merchant_name: e.target.value,
              }))
            }
            className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
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
            {editMerchantData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseMerchant;
