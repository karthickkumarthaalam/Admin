import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import { X, Plus, Trash2 } from "lucide-react";

const AddBlogsCategory = ({ isOpen, onClose, onSuccess, editCategoryData }) => {
  const initialData = {
    category_name: "",
    sub_categories: [""],
  };
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editCategoryData) {
      setFormData({
        category_name: editCategoryData.category_name || "",
        sub_categories: editCategoryData.sub_categories || [""],
      });
    } else {
      setFormData({ category_name: "", sub_categories: [""] });
    }
  }, [editCategoryData]);

  const handleChange = (index, value) => {
    const updated = [...formData.sub_categories];
    updated[index] = value;
    setFormData({ ...formData, sub_categories: updated });
  };

  const handleAddSub = () => {
    setFormData({
      ...formData,
      sub_categories: [...formData.sub_categories, ""],
    });
  };

  const handleRemoveSub = (index) => {
    const updated = formData.sub_categories.filter((_, i) => i !== index);
    setFormData({ ...formData, sub_categories: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editCategoryData) {
        await apiCall(
          `/blogs-category/${editCategoryData.id}`,
          "PATCH",
          formData
        );
        toast.success("Category updated successfully");
      } else {
        await apiCall("/blogs-category", "POST", formData);
        toast.success("Category added successfully");
      }
      onSuccess();
      setFormData(initialData);
    } catch (error) {
      toast.error("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {editCategoryData ? "Edit Category" : "Add New Category"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.category_name}
              onChange={(e) =>
                setFormData({ ...formData, category_name: e.target.value })
              }
              required
              placeholder="Enter category name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
            />
          </div>

          {/* Sub Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Sub Categories
              </label>
              <span className="text-xs text-gray-500">
                {formData.sub_categories.length} added
              </span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto p-2">
              {formData.sub_categories.map((sub, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={sub}
                    onChange={(e) => handleChange(index, e.target.value)}
                    placeholder={`Subcategory ${index + 1}`}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
                  />
                  {formData.sub_categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSub(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSub}
              className="flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
            >
              <Plus size={16} />
              Add Subcategory
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                "Save Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlogsCategory;
