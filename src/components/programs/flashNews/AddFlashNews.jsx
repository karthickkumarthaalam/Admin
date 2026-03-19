import React, { useEffect, useState } from "react";
import { X, Zap, FileText, Calendar, Tag, AlertCircle } from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const AddFlashNews = ({ isOpen, onClose, flashNews, onSuccess }) => {
  const isEdit = !!flashNews;

  const [formData, setFormData] = useState({
    title: "",
    news_content: "",
    start_date: "",
    end_date: "",
    priority: 1,
    status: "active",
    category_ids: [],
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiCall("/program-category", "GET")
        .then((res) => setCategories(res.data || []))
        .catch(() => toast.error("Failed to load categories"));
    }
  }, [isOpen]);

  useEffect(() => {
    if (flashNews) {
      setFormData({
        title: flashNews.title || "",
        news_content: flashNews.news_content || "",
        start_date: flashNews.start_date
          ? flashNews.start_date.split("T")[0]
          : "",
        end_date: flashNews.end_date ? flashNews.end_date.split("T")[0] : "",
        priority: flashNews.priority || 1,
        status: flashNews.status || "active",
        category_ids: flashNews.categories?.map((c) => c.id) || [],
      });
    } else {
      setFormData({
        title: "",
        news_content: "",
        start_date: "",
        end_date: "",
        priority: 1,
        status: "active",
        category_ids: [],
      });
    }
  }, [flashNews, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (id) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((c) => c !== id)
        : [...prev.category_ids, id],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.news_content) {
      toast.error("Title and content are required");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await apiCall(`/flash-news/${flashNews.id}`, "PUT", formData);
        toast.success("Flash news updated");
      } else {
        await apiCall("/flash-news", "POST", formData);
        toast.success("Flash news created");
      }
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white w-full h-full rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Zap size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEdit ? "Edit Flash News" : "Add Flash News"}
              </h2>
              <p className="text-xs text-gray-500">
                {isEdit
                  ? "Update the flash news details"
                  : "Create a new flash news entry"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
          >
            <X
              size={20}
              className="text-gray-500 group-hover:text-red-500 transition-colors"
            />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5 bg-slate-100">
          {/* Content Section */}
          <SectionCard
            icon={<FileText size={18} className="text-blue-600" />}
            title="News Content"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Title" required>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter news title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </Field>
                <Field label="Start Date">
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </Field>
                <Field label="End Date">
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </Field>
              </div>
              <Field label="News Content" required>
                <textarea
                  name="news_content"
                  placeholder="Enter news content..."
                  value={formData.news_content}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </Field>
            </div>
          </SectionCard>

          {/* Categories */}
          <SectionCard
            icon={<Tag size={18} className="text-purple-600" />}
            title="Programs"
            action={
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={
                    categories.length > 0 &&
                    formData.category_ids.length === categories.length
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category_ids: e.target.checked
                        ? categories.map((c) => c.id)
                        : [],
                    }))
                  }
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
                Select All
              </label>
            }
          >
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400">No categories available</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const selected = formData.category_ids.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.id)}
                      className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                        selected
                          ? "bg-blue-300 text-blue-800 border-blue-600"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-blue-100 hover:text-blue-600"
                      }`}
                    >
                      {cat.category}
                    </button>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Update"
            ) : (
              "Create"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ icon, title, action, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-xl">{icon}</div>
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      {action && <div>{action}</div>}
    </div>
    {children}
  </div>
);

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default AddFlashNews;
