import React, { useEffect, useState } from "react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";
import {
  X,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  Loader2,
  BarChart3,
  Calendar,
  Vote,
  FileText,
  Hash,
} from "lucide-react";

const CreateEditNewsPollModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const isEdit = Boolean(editData);

  const [loading, setLoading] = useState(false);

  const initialForm = {
    question: "",
    description: "",
    start_date: "",
    end_date: "",
    allow_multiple: false,
    is_active: false,
    options: [{ option_text: "" }, { option_text: "" }],
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setForm({
        question: editData.question || "",
        description: editData.description || "",
        start_date: editData.start_date
          ? editData.start_date.split("T")[0]
          : "",
        end_date: editData.end_date ? editData.end_date.split("T")[0] : "",
        allow_multiple: editData.allow_multiple || false,
        is_active: editData.is_active || false,

        options:
          editData.options?.length >= 2
            ? editData.options.map((opt) => ({
                id: opt.id,
                option_text: opt.option_text || "",
              }))
            : initialForm.options,
      });
    } else {
      setForm(initialForm);
    }

    setErrors({});
  }, [editData, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.question.trim()) {
      newErrors.question = "Poll question is required";
    }

    if (!form.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!form.end_date) {
      newErrors.end_date = "End date is required";
    }

    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);

      if (end < start) {
        newErrors.end_date = "End date cannot be before start date";
      }
    }

    const validOptions = form.options.filter((opt) => opt.option_text.trim());

    if (validOptions.length < 2) {
      newErrors.options = "At least 2 options are required";
    }

    const optionTexts = validOptions.map((opt) =>
      opt.option_text.toLowerCase().trim(),
    );

    if (new Set(optionTexts).size !== optionTexts.length) {
      newErrors.options = "Options must be unique";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...form.options];

    updated[index] = {
      ...updated[index],
      option_text: value,
    };

    setForm((prev) => ({
      ...prev,
      options: updated,
    }));
  };

  const addOption = () => {
    if (form.options.length >= 6) {
      toast.error("Maximum 6 options allowed");
      return;
    }

    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { option_text: "" }],
    }));
  };

  const removeOption = (index) => {
    if (form.options.length <= 2) {
      toast.error("At least 2 options are required");
      return;
    }

    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        question: form.question.trim(),
        description: form.description.trim(),

        start_date: form.start_date,
        end_date: form.end_date,

        allow_multiple: form.allow_multiple,
        is_active: form.is_active,
        options: form.options
          .filter((opt) => opt.option_text.trim())
          .map((opt) => ({
            option_text: opt.option_text.trim(),
            ...(opt.id && { id: opt.id }),
          })),
      };

      if (isEdit) {
        await apiCall(`/news-poll/${editData.id}`, "PUT", payload);

        toast.success("News Poll updated successfully");
      } else {
        await apiCall("/news-poll", "POST", payload);

        toast.success("News Poll created successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to save poll",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-auto ">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white px-6 pt-6 pb-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-6 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEdit ? "Edit News Poll" : "Create News Poll"}
              </h2>

              <p className="text-gray-600">Create interactive news polls</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 py-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Question */}
            <div>
              <label className="block font-semibold mb-2">
                Poll Question *
              </label>

              <textarea
                name="question"
                value={form.question}
                onChange={handleChange}
                rows="3"
                placeholder="Enter poll question"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none ${
                  errors.question
                    ? "border-red-300 ring-red-300"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />

              {errors.question && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.question}
                </p>
              )}
            </div>

            {/* Description */}
            {/* <div>
              <label className="font-semibold mb-2 flex items-center gap-2">
                <FileText size={16} />
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Enter poll description"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div> */}

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Start */}
              <div>
                <label className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Start Date & Time *
                </label>

                <input
                  type="datetime-local"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none ${
                    errors.start_date
                      ? "border-red-300 ring-red-300"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />

                {errors.start_date && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.start_date}
                  </p>
                )}
              </div>

              {/* End */}
              <div>
                <label className="font-semibold mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  End Date & Time *
                </label>

                <input
                  type="datetime-local"
                  name="end_date"
                  min={form.start_date}
                  value={form.end_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none ${
                    errors.end_date
                      ? "border-red-300 ring-red-300"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />

                {errors.end_date && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.end_date}
                  </p>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6  rounded-xl">
              {/* Active */}
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-gray-900">Active Poll</h3>

                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
              </div>
            </div>

            {/* Options */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="font-semibold">Poll Options *</label>

                  <p className="text-sm text-gray-500">Add up to 6 options</p>
                </div>

                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                  {form.options.length} / 6
                </span>
              </div>

              {errors.options && (
                <p className="mb-2 p-2 bg-red-50 text-red-700 border border-red-300 rounded-lg text-sm flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.options}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {form.options.map((opt, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-700">
                      {String.fromCharCode(65 + index)}
                    </div>

                    <input
                      type="text"
                      value={opt.option_text}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />

                    <button
                      type="button"
                      disabled={form.options.length <= 2}
                      onClick={() => removeOption(index)}
                      className={`p-2 rounded-lg transition ${
                        form.options.length <= 2
                          ? "cursor-not-allowed text-gray-300"
                          : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {form.options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Another Option
                </button>
              )}
            </div>

            {/* Actions */}
            <div className=" flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </span>
                ) : isEdit ? (
                  "Update Poll"
                ) : (
                  "Create Poll"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEditNewsPollModal;
