import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";

const AddAgreementCategoryModal = ({
  isOpen,
  onClose,
  editCategoryData,
  onSuccess,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editCategoryData) {
        setCategoryName(editCategoryData.category_name || "");
      } else {
        setCategoryName("");
        setError("");
      }
    }
  }, [isOpen, editCategoryData]);

  const validateForm = () => {
    if (!categoryName.trim()) {
      setError("Category name is required.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editCategoryData) {
        await apiCall(`/agreement-category/${editCategoryData.id}`, "PUT", {
          category_name: categoryName.trim(),
        });
        toast.success("Category updated successfully!");
      } else {
        await apiCall("/agreement-category", "POST", {
          category_name: categoryName.trim(),
        });
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
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {editCategoryData
            ? "Edit Agreement Category"
            : "Add Agreement Category"}
        </h2>

        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-sm">Category Name</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
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

export default AddAgreementCategoryModal;
