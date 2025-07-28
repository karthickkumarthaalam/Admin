import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../../utils/apiCall";

const AddBudgetCategoryModal = ({
  isOpen,
  onClose,
  editCategoryData,
  onSuccess,
}) => {
  const [form, setForm] = useState({ category_name: "", subCategories: [""] });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editCategoryData) {
        setForm({
          category_name: editCategoryData.category_name || "",
          subCategories: editCategoryData.subCategories || [""],
        });
      } else {
        setForm({ category_name: "", subCategories: [""] });
        setErrors({});
      }
    }
  }, [isOpen, editCategoryData]);

  const handleCategoryChange = (e) => {
    setForm((prev) => ({ ...prev, category_name: e.target.value }));
    setErrors((prev) => ({ ...prev, category_name: "" }));
  };

  const handleSubCategoryChange = (index, value) => {
    const updated = [...form.subCategories];
    updated[index] = value;
    setForm((prev) => ({ ...prev, subCategories: updated }));
  };

  const addSubCategory = () => {
    setForm((prev) => ({
      ...prev,
      subCategories: [...prev.subCategories, ""],
    }));
  };

  const removeSubCategory = (index) => {
    const updated = [...form.subCategories];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, subCategories: updated }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.category_name.trim()) {
      newErrors.category_name = "Category name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      category_name: form.category_name.trim(),
      subCategories: form.subCategories
        .map((s) => s.trim())
        .filter((s) => s !== ""),
    };

    try {
      if (editCategoryData) {
        await apiCall(
          `/budget-category/${editCategoryData.id}`,
          "PATCH",
          payload
        );
        toast.success("Category updated successfully!");
      } else {
        await apiCall("/budget-category", "POST", payload);
        toast.success("Category created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save category.");
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
          {editCategoryData ? "Edit Budget Category" : "Add Budget Category"}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-sm">Category Name</label>
            <input
              type="text"
              name="category_name"
              value={form.category_name}
              onChange={handleCategoryChange}
              className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            {errors.category_name && (
              <p className="text-sm text-red-500">{errors.category_name}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold mb-1 text-sm">Subcategories</label>
            {form.subCategories.map((sub, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={sub}
                  onChange={(e) => handleSubCategoryChange(idx, e.target.value)}
                  className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                {form.subCategories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubCategory(idx)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSubCategory}
              className="text-sm text-blue-600 hover:underline mt-1 flex items-center gap-1"
            >
              <Plus size={16} />
              Add Subcategory
            </button>
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
            {editCategoryData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBudgetCategoryModal;
