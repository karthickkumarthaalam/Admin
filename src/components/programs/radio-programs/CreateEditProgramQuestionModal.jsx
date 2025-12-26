import React, { useEffect, useState } from "react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";
import {
  X,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
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
    status: "in-active",
    options: [
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ],
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setForm({
        question: editData.question || "",
        question_type: editData.question_type || "poll",
        start_date: editData.start_date || "",
        end_date: editData.end_date || "",
        status: editData.status || "in-active",
        options:
          editData.options?.length >= 2
            ? editData.options.map((opt) => ({
                id: opt.id,
                option_text: opt.option_text || "",
                is_correct: opt.is_correct || false,
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
      newErrors.question = "Question text is required";
    }

    if (!form.start_date) {
      newErrors.start_date = "Start time is required";
    }

    if (!form.end_date) {
      newErrors.end_date = "End time is required";
    }

    const validOptions = form.options.filter((opt) => opt.option_text.trim());
    if (validOptions.length < 2) {
      newErrors.options = "At least 2 options with text are required";
    }

    if (form.question_type === "quiz") {
      const hasCorrect = form.options.some((opt) => opt.is_correct);
      if (!hasCorrect) {
        newErrors.correct = "Quiz must have at least one correct answer";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...form.options];

    if (field === "is_correct" && form.question_type === "poll") {
      toast.error("Polls cannot have correct answers");
      return;
    }

    if (
      field === "is_correct" &&
      value === true &&
      form.question_type === "quiz"
    ) {
      updatedOptions.forEach((opt, i) => {
        if (i !== index) opt.is_correct = false;
      });
    }

    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: field === "is_correct" ? value : value,
    };

    setForm((prev) => ({ ...prev, options: updatedOptions }));
    if (errors.options || errors.correct) {
      setErrors((prev) => ({ ...prev, options: "", correct: "" }));
    }
  };

  const addOption = () => {
    if (form.options.length >= 6) {
      toast.error("Maximum 6 options allowed");
      return;
    }
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { option_text: "", is_correct: false }],
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
        ...form,
        radio_program_id: radioProgramId,
        options: form.options.filter((opt) => opt.option_text.trim()),
      };

      if (isEdit) {
        await apiCall(`/program-question/${editData.id}`, "PUT", payload);
        toast.success("Question updated successfully");
      } else {
        await apiCall("/program-question", "POST", payload);
        toast.success("Question created successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save question");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {isEdit ? "Edit Question" : "Create New Question"}
                </h3>
                <p className="text-gray-600 mt-1">
                  {isEdit
                    ? "Update question details"
                    : "Add a new interactive question"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Question Text *
                </label>
                <textarea
                  name="question"
                  value={form.question}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.question ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter your question here..."
                />
                {errors.question && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.question}
                  </p>
                )}
              </div>

              {/* Type & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Question Type *
                  </label>
                  <select
                    name="question_type"
                    value={form.question_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="poll">Poll (No correct answer)</option>
                    <option value="quiz">Quiz (Has correct answer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="in-active">Inactive</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              {/* Time Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    Time Range *
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.start_date ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.start_date && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.start_date}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="date"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.end_date ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.end_date && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.end_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Options Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    Options *
                  </label>
                  <span className="text-sm text-gray-500">
                    {form.options.length} of 6 max
                  </span>
                </div>

                {errors.options && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.options}</p>
                  </div>
                )}

                {errors.correct && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.correct}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {form.options.map((opt, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={opt.option_text}
                          onChange={(e) =>
                            handleOptionChange(
                              index,
                              "option_text",
                              e.target.value
                            )
                          }
                          placeholder={`Option ${index + 1}`}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {form.question_type === "quiz" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleOptionChange(
                              index,
                              "is_correct",
                              !opt.is_correct
                            )
                          }
                          className={`px-4 py-3 border rounded-xl transition-all ${
                            opt.is_correct
                              ? "bg-green-50 border-green-300 text-green-700"
                              : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
                          }`}
                          title={
                            opt.is_correct
                              ? "Marked as correct"
                              : "Mark as correct"
                          }
                        >
                          <CheckCircle size={20} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-4 py-3 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-300 hover:border-red-200 rounded-xl transition-colors"
                        disabled={form.options.length <= 2}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>

                {form.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 rounded-xl transition-all hover:bg-blue-50"
                  >
                    <Plus className="inline mr-2" size={18} />
                    Add Another Option
                  </button>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      {isEdit ? "Updating..." : "Creating..."}
                    </span>
                  ) : (
                    <span>
                      {isEdit ? "Update Question" : "Create Question"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditProgramQuestionModal;
