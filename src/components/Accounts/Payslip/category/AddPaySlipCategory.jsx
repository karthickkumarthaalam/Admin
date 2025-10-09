import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../../utils/apiCall";

const AddPaySlipCategory = ({
  isOpen,
  onClose,
  editcategoryData,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    type: "",
    name: "",
    default_amount: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && editcategoryData) {
      setForm({
        type: editcategoryData.type || "",
        name: editcategoryData.name || "",
        default_amount: editcategoryData.default_amount || "",
        description: editcategoryData.description || "",
      });
    } else if (isOpen) {
      // reset form when opening new
      setForm({
        type: "",
        name: "",
        default_amount: "",
        description: "",
      });
      setErrors({});
    }
  }, [isOpen, editcategoryData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Category Name is required";
    if (!form.type) newErrors.type = "Category Type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validForm()) return;

    try {
      if (editcategoryData) {
        await apiCall(
          `/payslip-category/${editcategoryData.id}`,
          "PATCH",
          form
        );
        toast.success("Category updated successfully");
      } else {
        await apiCall(`/payslip-category`, "POST", form);
        toast.success("Category created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save category");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-xl p-6 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-red-600">
            {editcategoryData
              ? "Edit PaySlip Category"
              : "Add PaySlip Category"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-sm">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              placeholder="eg: Basic salary"
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Type */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-sm">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="">Select Type</option>
              <option value="earning">Earnings</option>
              <option value="deduction">Deduction</option>
            </select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Default Amount */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-sm">Default Amount</label>
            <input
              type="number"
              name="default_amount"
              placeholder="15000"
              value={form.default_amount}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-sm">Description</label>
            <textarea
              name="description"
              placeholder="This is optional"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-red-500 focus:outline-none"
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
            {editcategoryData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPaySlipCategory;
