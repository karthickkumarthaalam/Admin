import React, { useEffect, useState } from "react";
import {
  X,
  Zap,
  FileText,
  Calendar,
  Tag,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const AddFlashNews = ({ isOpen, onClose, flashNews, onSuccess }) => {
  const isEdit = !!flashNews;

  const [formData, setFormData] = useState({
    title: "",
    items: [{ content: "", status: "in-active" }],
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
        items:
          flashNews.items?.length > 0
            ? flashNews.items
            : [{ content: "", status: "in-active" }],
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
        items: [{ content: "", status: "in-active" }],
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

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { content: "", status: "in-active" }],
    }));
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async () => {
    if (!formData.title || formData.items.length === 0) {
      toast.error("Title and atleast one content required");
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
      <div className="bg-white w-full h-full rounded-xl shadow-xl flex flex-col ">
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
              <Field label="News Contents" required>
                <div className="space-y-4">
                  {(formData.items || []).map((item, index) => {
                    const charCount = item.content.length;
                    const maxChars = 250;

                    return (
                      <div
                        key={index}
                        className="flex flex-col gap-2 border rounded-xl p-4 bg-gray-50 shadow-sm"
                      >
                        {/* Header Row */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-gray-500">
                            Content #{index + 1}
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Status */}
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "status",
                                  e.target.value,
                                )
                              }
                              className="text-xs border rounded-lg px-2 py-1 bg-white"
                            >
                              <option value="active">🟢 Active</option>
                              <option value="in-active">⚪ Inactive</option>
                            </select>

                            {/* Remove */}
                            <button
                              type="button"
                              disabled={formData.items.length === 1}
                              onClick={() => removeItem(index)}
                              className={`p-1 rounded-md transition ${
                                formData.items.length === 1
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-red-500 hover:bg-red-100"
                              }`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Textarea */}
                        <textarea
                          placeholder={`Enter news content ${index + 1}...`}
                          value={item.content}
                          onChange={(e) => {
                            if (e.target.value.length <= maxChars) {
                              handleItemChange(
                                index,
                                "content",
                                e.target.value,
                              );
                            }
                          }}
                          rows={2}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                        />

                        {/* Footer Row */}
                        <div className="flex justify-between items-center text-xs">
                          <span
                            className={`${
                              charCount > maxChars - 20
                                ? "text-red-500"
                                : "text-gray-400"
                            }`}
                          >
                            {charCount}/{maxChars} characters
                          </span>

                          {charCount >= maxChars && (
                            <span className="text-red-500 font-medium">
                              Max limit reached
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={addItem}
                    className="w-full border border-dashed border-blue-300 text-blue-600 py-2 rounded-xl text-sm font-medium hover:bg-blue-50 transition"
                  >
                    + Add Another Content
                  </button>
                </div>
              </Field>
            </div>
          </SectionCard>

          {/* Categories */}
          <SectionCard
            icon={<Tag size={18} className="text-indigo-600" />}
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
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                Select All
              </label>
            }
          >
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400">No categories available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const selected = formData.category_ids.includes(cat.id);

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition ${
                        selected
                          ? "bg-indigo-50 text-indigo-700 border-indigo-500"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      <span className="truncate">{cat.category}</span>

                      {/* ✅ Tick mark */}
                      {selected && (
                        <span className="text-indigo-600 text-xs font-bold">
                          ✓
                        </span>
                      )}
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
