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
  MessageSquare,
  Phone,
} from "lucide-react";

const CreateEditProgramQuestionModal = ({
  isOpen,
  onClose,
  radioProgramId,
  onSuccess,
  editData,
}) => {
  const isEdit = Boolean(editData);
  const [loading, setLoading] = useState(false);

  const initialForm = {
    question: "",
    question_type: "poll",
    start_date: "",
    end_date: "",
    enable_feedback: false,
    enable_whatsapp: false,
    whatsapp_number: "",
    status: "in-active",
    options: [{ option_text: "" }, { option_text: "" }],
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setForm({
        question: editData.question || "",
        question_type: "poll",
        start_date: editData.start_date
          ? editData.start_date.split("T")[0]
          : "",
        end_date: editData.end_date ? editData.end_date.split("T")[0] : "",
        status: editData.status || "in-active",
        enable_feedback: editData.enable_feedback || false,
        enable_whatsapp: editData.enable_whatsapp || false,
        whatsapp_number: editData.whatsapp_number || "",
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

    if (!form.question.trim()) newErrors.question = "Poll question is required";
    if (!form.start_date) newErrors.start_date = "Start date is required";
    if (!form.end_date) newErrors.end_date = "End date is required";

    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);

      if (end < start)
        newErrors.end_date = "End date cannot be before start date";

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today && !isEdit)
        newErrors.start_date = "Start date cannot be in the past";
    }

    // WhatsApp validation
    if (form.enable_whatsapp && !form.whatsapp_number.trim()) {
      newErrors.whatsapp_number = "WhatsApp number is required";
    }

    const validOptions = form.options.filter((opt) => opt.option_text.trim());
    if (validOptions.length < 2)
      newErrors.options = "At least 2 options are required";

    const optionTexts = validOptions.map((opt) =>
      opt.option_text.toLowerCase().trim()
    );

    if (new Set(optionTexts).size !== optionTexts.length)
      newErrors.options = "Options must be unique";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleOptionChange = (index, value) => {
    const updated = [...form.options];
    updated[index] = { ...updated[index], option_text: value };
    setForm((prev) => ({ ...prev, options: updated }));
    if (errors.options) setErrors((prev) => ({ ...prev, options: "" }));
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
    if (form.options.length <= 2)
      return toast.error("At least 2 options are required");
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
        question_type: "poll",
        start_date: `${form.start_date}T00:00:00.000Z`,
        end_date: `${form.end_date}T23:59:59.999Z`,
        status: form.status,
        enable_feedback: form.enable_feedback,
        enable_whatsapp: form.enable_whatsapp,
        whatsapp_number: form.enable_whatsapp
          ? form.whatsapp_number.trim()
          : "",
        radio_program_id: radioProgramId,
        options: form.options
          .filter((opt) => opt.option_text.trim())
          .map((opt) => ({
            option_text: opt.option_text.trim(),
            ...(opt.id && { id: opt.id }),
          })),
      };

      if (isEdit) {
        await apiCall(`/program-question/${editData.id}`, "PUT", payload);
        toast.success("Poll updated successfully");
      } else {
        await apiCall("/program-question", "POST", payload);
        toast.success("Poll created successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to save poll"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-6 sm:p-10 overflow-auto max-h-[95vh]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Poll" : "Create New Poll"}
            </h2>
            <p className="text-gray-600">
              {isEdit
                ? "Update poll details and options"
                : "Create an interactive poll"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question */}
          <div>
            <label className="block font-semibold mb-2">Poll Question *</label>
            <textarea
              name="question"
              value={form.question}
              onChange={handleChange}
              rows="3"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 ${
                errors.question
                  ? "border-red-300 ring-red-300"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="What would you like to ask your audience?"
            />
            {errors.question && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.question}
              </p>
            )}
          </div>

          {/* Status & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status */}
            <div>
              <label className="block font-semibold mb-2">Poll Status *</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="in-active">Inactive</option>
                <option value="active">Active</option>
              </select>
            </div>

            {/* Date Pickers */}
            <div className="lg:col-span-2 space-y-2">
              <label className="font-semibold mb-2 flex items-center gap-2">
                <Clock size={16} /> Poll Dates *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start */}
                <div>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 ${
                      errors.start_date
                        ? "border-red-300 ring-red-300"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors.start_date && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.start_date}
                    </p>
                  )}
                </div>

                {/* End */}
                <div>
                  <input
                    type="date"
                    name="end_date"
                    min={form.start_date}
                    value={form.end_date}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 ${
                      errors.end_date
                        ? "border-red-300 ring-red-300"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors.end_date && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.end_date}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Poll auto-deactivates when it reaches the end date
              </p>
            </div>
          </div>

          {/* Feedback & WhatsApp Settings */}
          <div className="space-y-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Additional Settings
            </h3>

            {/* Feedback */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <label className="font-medium text-gray-900">
                    Enable Feedback
                  </label>
                  <p className="text-sm text-gray-500">
                    Allow audience to submit feedback
                  </p>
                </div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="enable_feedback"
                  checked={form.enable_feedback}
                  onChange={handleChange}
                  className="sr-only"
                  id="feedback-toggle"
                />
                <label
                  htmlFor="feedback-toggle"
                  className={`block h-6 w-12 rounded-full cursor-pointer transition-colors ${
                    form.enable_feedback ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${
                      form.enable_feedback ? "transform translate-x-6" : ""
                    }`}
                  />
                </label>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <label className="font-medium text-gray-900">
                      Enable WhatsApp
                    </label>
                    <p className="text-sm text-gray-500">
                      Allow responses via WhatsApp
                    </p>
                  </div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="enable_whatsapp"
                    checked={form.enable_whatsapp}
                    onChange={handleChange}
                    className="sr-only"
                    id="whatsapp-toggle"
                  />
                  <label
                    htmlFor="whatsapp-toggle"
                    className={`block h-6 w-12 rounded-full cursor-pointer transition-colors ${
                      form.enable_whatsapp ? "bg-green-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${
                        form.enable_whatsapp ? "transform translate-x-6" : ""
                      }`}
                    />
                  </label>
                </div>
              </div>

              {/* WhatsApp Number (conditionally shown) */}
              {form.enable_whatsapp && (
                <div className="ml-13 pl-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="whatsapp_number"
                      value={form.whatsapp_number}
                      onChange={handleChange}
                      placeholder="+1234567890"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${
                        errors.whatsapp_number
                          ? "border-red-300 ring-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.whatsapp_number && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.whatsapp_number}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Enter number in international format (e.g., +1234567890)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block font-semibold">Poll Options *</label>
                <p className="text-sm text-gray-500">Add up to 6 options</p>
              </div>
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                {form.options.length} / 6
              </span>
            </div>

            {errors.options && (
              <p className="mb-2 p-2 bg-red-50 text-red-700 border border-red-300 rounded-lg text-sm flex items-center gap-1">
                <AlertCircle size={14} /> {errors.options}
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
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                <Plus size={18} /> Add Another Option
              </button>
            )}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">
                💡 <span className="font-medium">Tip:</span> Keep options short
                and unique
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
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
  );
};

export default CreateEditProgramQuestionModal;
