import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../../utils/apiCall";
import { X } from "lucide-react";

const AddFinancialYear = ({ isOpen, onClose, editData, onSuccess }) => {
  const [form, setForm] = useState({ start_year: "", end_year: "" });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setForm({
          start_year: editData.start_year || "",
          end_year: editData.end_year || "",
        });
      } else {
        setForm({ start_year: "", end_year: "" });
      }
    }
  }, [isOpen, editData]);

  const handleSubmit = async () => {
    if (!form.start_year || !form.end_year) {
      toast.error("Start year and End year are required");
      return;
    }

    try {
      if (editData) {
        await apiCall(`/financial-year/${editData.id}`, "PUT", form);
        toast.success("Financial Year updated successfully");
      } else {
        await apiCall(`/financial-year`, "POST", form);
        toast.success("Financial Year created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save Financial Year");
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
          {editData ? "Edit Financial Year" : "Add Financial Year"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-sm">Start Year</label>
            <input
              type="text"
              name="start_year"
              value={form.start_year}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, start_year: e.target.value }))
              }
              className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. 2024"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-sm">End Year</label>
            <input
              type="text"
              name="end_year"
              value={form.end_year}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, end_year: e.target.value }))
              }
              className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. 2025"
            />
          </div>
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
            {editData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFinancialYear;
