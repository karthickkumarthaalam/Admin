import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../../utils/apiCall";

const AddBudgetUnitsModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [form, setForm] = useState({ units_name: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setForm({ units_name: editData.units_name || "" });
      } else {
        setForm({ units_name: "" });
        setErrors({});
      }
    }
  }, [isOpen, editData]);

  const handleChange = (e) => {
    setForm({ ...form, units_name: e.target.value });
    setErrors({ ...errors, units_name: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.units_name.trim()) {
      newErrors.units_name = "Unit name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      units_name: form.units_name.trim(),
    };

    try {
      if (editData) {
        await apiCall(`/budget-units/${editData.id}`, "PATCH", payload);
        toast.success("Unit updated successfully!");
      } else {
        await apiCall("/budget-units", "POST", payload);
        toast.success("Unit created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save unit.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {editData ? "Edit Unit" : "Add Unit"}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Unit Name</label>
            <input
              type="text"
              value={form.units_name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.units_name && (
              <p className="text-sm text-red-500 mt-1">{errors.units_name}</p>
            )}
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

export default AddBudgetUnitsModal;
