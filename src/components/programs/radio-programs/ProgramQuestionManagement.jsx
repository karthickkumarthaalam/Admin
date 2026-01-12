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
  BarChart3,
  Vote,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  AlertCircle,
  Globe,
  MapPin,
  Flag,
  X,
  PieChart,
} from "lucide-react";
import CreateEditProgramQuestionModal from "./CreateEditProgramQuestionModal";

const ProgramQuestionManagement = ({ radioProgramId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [countryModalData, setCountryModalData] = useState(null); // Changed from hoveredOption
  const [countryModalPosition, setCountryModalPosition] = useState({
    x: 0,
    y: 0,
  });

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
      setExpandedQuestion(null);
    } catch (error) {
      toast.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    if (!window.confirm("Are you sure you want to update status?")) return;
    setUpdatingStatus(id);
    try {
      const newStatus = currentStatus === "active" ? "in-active" : "active";
      await apiCall(`/program-question/${id}/status`, "PATCH", {
        status: newStatus,
      });
      toast.success(
        `Poll ${newStatus === "active" ? "activated" : "deactivated"}`
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
    if (!window.confirm("Are you sure you want to delete this poll?")) return;
    try {
      await apiCall(`/program-question/${id}`, "DELETE");
      toast.success("Poll deleted successfully");
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (expandedQuestion === id) setExpandedQuestion(null);
    } catch (error) {
      toast.error("Failed to delete poll");
    }
  };

  const toggleExpandQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const handleOptionClick = (option, questionId, event) => {
    if (option.country_breakdown && option.country_breakdown.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      setCountryModalData({
        ...option,
        questionId,
        totalVotes: option.vote_count || 0,
      });
      setCountryModalPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
  };

  const closeCountryModal = () => {
    setCountryModalData(null);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    const date = new Date(dateTime);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return "";
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status, start_date, end_date) => {
    const now = new Date().toISOString().split("T")[0];
    const start = new Date(start_date).toISOString().split("T")[0];
    const end = new Date(end_date).toISOString().split("T")[0];

    if (start > now) {
      return {
        className: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: <Clock size={14} />,
        text: "Upcoming",
      };
    }

    if (end < now) {
      return {
        className: "bg-gray-100 text-gray-800 border border-gray-200",
        icon: <XCircle size={14} />,
        text: "Ended",
      };
    }

    if (start <= now && end >= now) {
      return {
        className: "bg-green-100 text-green-800 border border-green-200",
        icon: <CheckCircle size={14} />,
        text: "Live",
      };
    }

    return {
      className: "bg-gray-100 text-gray-800 border border-gray-200",
      icon: <AlertCircle size={14} />,
      text: status || "Unknown",
    };
  };

  const getPercentageColor = (percentage) => {
    const perc = parseFloat(percentage);
    if (perc >= 70) return "bg-blue-600";
    if (perc >= 40) return "bg-blue-500";
    if (perc >= 20) return "bg-blue-400";
    return "bg-blue-300";
  };

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index);
  };

  // Get country flag emoji
  const getCountryFlag = (countryCode) => {
    if (!countryCode) return "🌐";
    return String.fromCodePoint(
      ...Array.from(countryCode.toUpperCase()).map(
        (c) => 0x1f1a5 + c.charCodeAt(0)
      )
    );
  };

  // Get all unique countries for a question
  const getAllCountries = (question) => {
    const countries = [];
    const countryMap = new Map();

    question.options?.forEach((option) => {
      option.country_breakdown?.forEach((country) => {
        if (country.country && !countryMap.has(country.country)) {
          countryMap.set(country.country, country);
          countries.push(country);
        }
      });
    });

    return countries.sort((a, b) => b.count - a.count);
  };

  // Get sorted countries for an option
  const getSortedCountries = (option) => {
    if (!option.country_breakdown || option.country_breakdown.length === 0) {
      return [];
    }
    return option.country_breakdown.sort((a, b) => b.count - a.count);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryModalData && !event.target.closest(".country-modal")) {
        closeCountryModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [countryModalData]);

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
          Please save program details first to manage polls.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
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

      {/* Country Modal (Click to open) */}
      {countryModalData && (
        <div
          className="fixed z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 country-modal"
          style={{
            left: `${countryModalPosition.x}px`,
            top: `${countryModalPosition.y + 20}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="p-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Country Breakdown
                  </h3>
                  <p className="text-xs text-gray-500">
                    {countryModalData.country_breakdown.length} countries
                  </p>
                </div>
              </div>
              <button
                onClick={closeCountryModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Stats Summary */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Total Votes
                  </div>
                  <div className="text-xs text-gray-600">For this option</div>
                </div>
                <div className="text-lg font-bold text-blue-700">
                  {countryModalData.totalVotes}
                </div>
              </div>
            </div>

            {/* Countries List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {getSortedCountries(countryModalData).map((country, idx) => {
                const percentage =
                  countryModalData.totalVotes > 0
                    ? (
                        (country.count / countryModalData.totalVotes) *
                        100
                      ).toFixed(1)
                    : 0;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <span className="text-lg">
                          {getCountryFlag(country.country)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {country.country_name || country.country}
                        </div>
                        <div className="text-xs text-gray-500">
                          {country.country}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 text-sm">
                          {country.count} votes
                        </div>
                        <div className="text-xs text-gray-500">
                          {percentage}%
                        </div>
                      </div>
                      <div className="w-16">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <PieChart size={12} />
                  <span>Geographic distribution</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-700">
                    Click outside to close
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Poll Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage audience polls with real-time analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
            <span className="font-semibold">{questions.length}</span> poll
            {questions.length !== 1 ? "s" : ""}
          </div>
          <button
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Create Poll
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-gray-600">Loading polls...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && questions.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Polls Yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create interactive polls to engage with your audience and gather
            insights from around the world.
          </p>
          <button
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Create Your First Poll
          </button>
        </div>
      )}

      {/* Polls List */}
      {!loading && questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((question, index) => {
            const statusBadge = getStatusBadge(
              question.status,
              question.start_date,
              question.end_date
            );
            const isExpanded = expandedQuestion === question.id;
            const allCountries = getAllCountries(question);

            return (
              <div
                key={question.id}
                className="bg-white/90 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Poll Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-gray-700">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusBadge.className}`}
                            >
                              {statusBadge.icon}
                              {statusBadge.text}
                            </span>
                            {question.total_votes > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                <TrendingUp size={12} />
                                {question.total_votes}{" "}
                                {question.total_votes > 1 ? "votes" : "vote"}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {question.question}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDateTime(question.start_date)} -{" "}
                              {formatDateTime(question.end_date)}
                            </span>
                            {question.feedback_count > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare size={12} />
                                {question.feedback_count} feedback
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          toggleStatus(question.id, question.status)
                        }
                        disabled={updatingStatus === question.id}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          question.status === "active"
                            ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {updatingStatus === question.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <span className="flex items-center gap-1">
                            {question.status === "active" ? (
                              <>
                                <CheckCircle size={14} />
                                End Poll
                              </>
                            ) : (
                              <>
                                <Vote size={14} />
                                Start Poll
                              </>
                            )}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setEditData(question);
                          setModalOpen(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Poll"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Poll"
                      >
                        <Trash2 size={18} />
                      </button>

                      {(question.feedbacks && question.feedbacks.length > 0) ||
                      allCountries.length > 0 ? (
                        <button
                          onClick={() => toggleExpandQuestion(question.id)}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Poll Options with Vote Counts */}
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {question.options?.map((option, optIndex) => {
                      const percentage = parseFloat(option.percentage || 0);
                      const voteCount = option.vote_count || 0;
                      const hasCountries =
                        option.country_breakdown &&
                        option.country_breakdown.length > 0;

                      return (
                        <div
                          key={option.id}
                          className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors relative cursor-pointer"
                          onClick={(e) => {
                            if (hasCountries) {
                              handleOptionClick(option, question.id, e);
                            }
                          }}
                        >
                          {/* Country Indicator */}
                          {hasCountries && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center group">
                                <Globe size={12} className="text-blue-600" />
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Click to view country data
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col h-full">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <span className="font-bold text-purple-700 text-sm">
                                  {getOptionLetter(optIndex)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm line-clamp-2">
                                  {option.option_text}
                                </div>
                              </div>
                            </div>

                            <div className="mt-auto">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-gray-700">
                                  {voteCount} vote{voteCount !== 1 ? "s" : ""}
                                  {hasCountries && (
                                    <span className="ml-1 text-blue-600">
                                      • {option.country_breakdown.length}{" "}
                                      countries
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                  {percentage.toFixed(1)}%
                                </div>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${getPercentageColor(
                                    percentage
                                  )}`}
                                  style={{
                                    width: `${Math.max(percentage, 5)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded Details - Country Statistics & Feedback */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {/* Feedback Section */}
                    {question.feedbacks && question.feedbacks.length > 0 && (
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Audience Feedback ({question.feedbacks.length})
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              Comments from your audience around the world
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {question.feedbacks.slice(0, 5).map((feedback) => (
                            <div
                              key={feedback.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                            >
                              <p className="text-sm text-gray-900 mb-2">
                                {feedback.answer_text}
                              </p>
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <div className="flex items-center gap-3">
                                  {feedback.country && (
                                    <div className="flex items-center gap-1">
                                      <Flag size={10} />
                                      <span className="font-medium">
                                        {feedback.country}
                                        {feedback.country_name &&
                                          ` (${feedback.country_name})`}
                                      </span>
                                    </div>
                                  )}
                                  <span>
                                    {formatTime(feedback.createdAt)} -{" "}
                                    {formatDateTime(feedback.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {question.feedbacks.length > 5 && (
                            <div className="text-center pt-3">
                              <button className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                                View all {question.feedbacks.length} feedback
                                entries
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Expand/Collapse Footer */}
                {question.feedbacks && question.feedbacks.length > 0 ? (
                  <div className="border-t border-gray-200 px-5 py-3 bg-gray-50">
                    <button
                      onClick={() => toggleExpandQuestion(question.id)}
                      className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 py-2 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={16} className="mr-2" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} className="mr-2" />
                          Show Details
                          {question.feedbacks.length > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {question.feedbacks.length} feedback
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgramQuestionManagement;
