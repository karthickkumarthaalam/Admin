import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../../utils/apiCall";
import { X } from "lucide-react";

const AddExpenseCategory = ({
  isOpen,
  onClose,
  editCategoryData,
  onSuccess,
}) => {
  const [form, setForm] = useState({ category_name: "" });

  useEffect(() => {
    if (isOpen) {
      if (editCategoryData) {
        setForm({
          category_name: editCategoryData.category_name || "",
        });
      } else {
        setForm({
          category_name: "",
        });
      }
    }
  }, [isOpen, editCategoryData]);

  const handleSubmit = async () => {
    try {
      if (editCategoryData) {
        await apiCall(`/category/${editCategoryData.id}`, "PUT", form);
        toast.success("Category updated successfully");
      } else {
        await apiCall(`/category`, "POST", form);
        toast.success("Category created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save Category");
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
          {editCategoryData ? "Edit Expense Category" : "Add Expense Category"}
        </h2>

        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-sm">Category Name</label>
          <input
            type="text"
            name="category_name"
            value={form.category_name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                category_name: e.target.value,
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
            {editCategoryData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseCategory;
