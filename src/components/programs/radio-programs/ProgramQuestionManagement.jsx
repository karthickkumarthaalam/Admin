import React, { useEffect, useState } from "react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";
import {
  Clock,
  Loader2,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Type,
  BarChart3,
} from "lucide-react";
import CreateEditProgramQuestionModal from "./CreateEditProgramQuestionModal";

const ProgramQuestionManagement = ({ radioProgramId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (radioProgramId) fetchQuestions();
  }, [radioProgramId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await apiCall(
        `/program-question/program/${radioProgramId}`,
        "GET"
      );
      setQuestions(res.data);
    } catch (error) {
      toast.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    if (!window.confirm("Are you sure you want to update status")) return;
    setUpdatingStatus(id);
    try {
      const newStatus = currentStatus === "active" ? "in-active" : "active";
      await apiCall(`/program-question/${id}/status`, "PATCH", {
        status: newStatus,
      });
      toast.success(
        `Question ${newStatus === "active" ? "activated" : "deactivated"}`
      );
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
      );
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;
    try {
      await apiCall(`/program-question/${id}`, "DELETE");
      toast.success("Question deleted successfully");
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return new Date(dateTime).toLocaleString("en-GB", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return {
          className: "bg-green-100 text-green-800 border border-green-200",
          icon: <CheckCircle size={14} />,
          text: "Active",
        };
      case "in-active":
        return {
          className: "bg-gray-100 text-gray-800 border border-gray-200",
          icon: <XCircle size={14} />,
          text: "Inactive",
        };
      default:
        return {
          className: "bg-gray-100 text-gray-800",
          icon: null,
          text: status,
        };
    }
  };

  const getQuestionTypeBadge = (type) => {
    switch (type) {
      case "poll":
        return {
          className: "bg-blue-100 text-blue-800",
          icon: <BarChart3 size={14} />,
          text: "Poll",
        };
      case "quiz":
        return {
          className: "bg-purple-100 text-purple-800",
          icon: <Type size={14} />,
          text: "Quiz",
        };
      default:
        return {
          className: "bg-gray-100 text-gray-800",
          text: type,
        };
    }
  };

  if (!radioProgramId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Program Selected
        </h3>
        <p className="text-gray-600 max-w-md">
          Please save program details first to manage questions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreateEditProgramQuestionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        radioProgramId={radioProgramId}
        editData={editData}
        onSuccess={fetchQuestions}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Program Questions
          </h2>
          <p className="text-gray-600 mt-1">
            Manage interactive questions for your radio program
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
            <span className="font-semibold">{questions.length}</span> question
            {questions.length !== 1 ? "s" : ""}
          </div>
          <button
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow"
          >
            <Plus size={18} />
            Add Question
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-gray-600">Loading questions...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && questions.length === 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Questions Yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create interactive polls or quizzes to engage with your audience
            during the program.
          </p>
          <button
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow"
          >
            <Plus size={18} />
            Create Your First Question
          </button>
        </div>
      )}

      {/* Questions List */}
      {!loading && questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((q, index) => {
            const statusBadge = getStatusBadge(q.status);
            const typeBadge = getQuestionTypeBadge(q.question_type);

            return (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow"
              >
                {/* Question Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-lg text-blue-700">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {q.question}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge.className}`}
                            >
                              {typeBadge.icon}
                              {typeBadge.text}
                            </span>
                            {q.start_date && q.end_date && (
                              <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                                <Calendar size={14} />
                                {formatDateTime(q.start_date)} -{" "}
                                {formatDateTime(q.end_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(q.id, q.status)}
                        disabled={updatingStatus === q.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          q.status === "active"
                            ? "hover:bg-green-50 text-green-700"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {updatingStatus === q.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          statusBadge.icon
                        )}
                        {statusBadge.text}
                      </button>

                      <button
                        onClick={() => {
                          setEditData(q);
                          setModalOpen(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit question"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete question"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Options
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {q.options?.map((opt, optIndex) => (
                      <div
                        key={opt.id}
                        className={`relative p-3 rounded-lg border transition-all duration-200 ${
                          opt.is_correct
                            ? "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {opt.option_text}
                          </span>
                          {opt.is_correct && (
                            <CheckCircle
                              size={16}
                              className="text-green-600 flex-shrink-0"
                            />
                          )}
                        </div>
                        {opt.is_correct && (
                          <div className="absolute -top-2 -right-2">
                            <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              Correct
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgramQuestionManagement;
