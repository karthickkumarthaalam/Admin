import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";

import { apiCall } from "../../../utils/apiCall";

const AddBreakingNewsModal = ({ isOpen, onClose, onSuccess, editNewsData }) => {
  const [formData, setFormData] = useState({
    content: "",
    url: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editNewsData) {
      setFormData({
        content: editNewsData.content || "",
        url: editNewsData.url || "",
        start_date: editNewsData.start_date
          ? formatDate(editNewsData.start_date)
          : "",
        end_date: editNewsData.end_date
          ? formatDate(editNewsData.end_date)
          : "",
        is_active: editNewsData.is_active ?? true,
      });
    } else {
      setFormData({
        content: "",
        url: "",
        start_date: "",
        end_date: "",
        is_active: true,
      });
    }
  }, [editNewsData]);

  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      return toast.error("End date should be greater than start date");
    }

    setLoading(true);

    try {
      if (editNewsData) {
        await apiCall(`/breaking-news/${editNewsData.id}`, "PUT", formData);

        toast.success("Breaking news updated successfully");
      } else {
        await apiCall("/breaking-news", "POST", formData);

        toast.success("Breaking news created successfully");
      }

      onSuccess();
    } catch (error) {
      toast.error("Failed to save breaking news");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {editNewsData ? "Edit Breaking News" : "Add Breaking News"}
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
          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Breaking Content
              <span className="text-red-500"> *</span>
            </label>

            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="Enter breaking news content..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none resize-none"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Redirect URL
            </label>

            <input
              type="url"
              value={formData.url}
              onChange={(e) => handleChange("url", e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date & Time
                <span className="text-red-500"> *</span>
              </label>

              <input
                type="datetime-local"
                required
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date & Time
                <span className="text-red-500"> *</span>
              </label>

              <input
                type="datetime-local"
                required
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              className="w-5 h-5 accent-red-600"
            />

            <label className="text-sm font-medium text-gray-700">
              Active Breaking News
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors duration-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4  py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : editNewsData ? (
                "Update News"
              ) : (
                "Create News"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBreakingNewsModal;
