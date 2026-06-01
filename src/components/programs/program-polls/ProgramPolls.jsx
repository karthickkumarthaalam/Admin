import React, { useEffect, useState, useCallback, useMemo } from "react";
import { usePermission } from "../../../context/PermissionContext";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import BreadCrumb from "../../BreadCrum";
import CreateEditProgramQuestionModal from "../radio-programs/CreateEditProgramQuestionModal";
import {
  BadgePlus,
  Search,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import Pagination from "../../Pagination";
import QuestionResults from "./QuestionResults";

const ProgramPolls = () => {
  const [programQuestions, setProgramQuestion] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const { hasPermission } = usePermission();

  const pageSize = 20;

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/program-question?page=${currentPage}&limit=${pageSize}&search=${debouncedSearchQuery}`,
        "GET",
      );

      setProgramQuestion(response.data || []);
      setTotalRecords(response?.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch program questions");
      setProgramQuestion([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, pageSize]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const totalPages = useMemo(
    () => Math.ceil(totalRecords / pageSize),
    [totalRecords, pageSize],
  );

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (
      window.confirm("Are you sure you want to delete this program question?")
    ) {
      setDeletingId(id);
      try {
        await apiCall(`/program-question/${id}`, "DELETE");
        toast.success("Program question deleted successfully");
        setProgramQuestion((prev) => prev.filter((q) => q.id !== id));
      } catch (error) {
        toast.error("Failed to delete program question");
      } finally {
        setDeletingId(null);
      }
    }
  }, []);

  const updateQuestionStatus = useCallback(async (id, status, end_date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(end_date);
    endDate.setHours(0, 0, 0, 0);

    if (status === "active" && endDate < today) {
      toast.error("Cannot activate. This question has already expired.");
      return;
    }
    if (window.confirm("Are you sure you want to update the status?")) {
      try {
        await apiCall(`/program-question/${id}/status`, "PATCH", {
          status,
        });
        toast.success("Question status updated successfully");
        setProgramQuestion((prev) =>
          prev.map((q) =>
            q.id === id
              ? {
                  ...q,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : q,
          ),
        );
      } catch (error) {
        toast.error("Failed to update status");
      }
    }
  }, []);

  const handleEdit = useCallback((item) => {
    setSelectedQuestion(item);
    setShowModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setSelectedQuestion(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    fetchQuestions();
    handleModalClose();
  }, [fetchQuestions, handleModalClose]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const tableHeaders = useMemo(() => {
    const hasActions =
      hasPermission("Programs", "update") ||
      hasPermission("Programs", "delete");

    return (
      <thead className="bg-gray-700 text-gray-100 border-b border-gray-200">
        <tr>
          <th className="px-6 py-3 text-left font-semibold">SI</th>
          <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">
            Question
          </th>
          <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">
            Options
          </th>
          <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">
            Settings
          </th>
          <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">
            Date Range
          </th>
          <th className="px-6 py-3 text-left font-semibold">Status</th>
          {hasActions && (
            <th className="px-6 py-3 text-left font-semibold">Actions</th>
          )}
        </tr>
      </thead>
    );
  }, [hasPermission]);

  // Memoized question rows
  const questionRows = useMemo(() => {
    return programQuestions.map((item, index) => (
      <tr
        key={item.id}
        onClick={() => {
          setShowResult(true);
          setSelectedQuestion(item);
        }}
        className="group hover:bg-slate-50 transition-all duration-200 transform"
      >
        {/* Serial Number */}
        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
          {(currentPage - 1) * pageSize + index + 1}
        </td>

        {/* Question */}
        <td className="px-6 py-4">
          <div className="flex items-start space-x-3">
            <HelpCircle
              size={18}
              className="text-blue-500 mt-1 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                {item.question?.length > 60
                  ? `${item.question.substring(0, 60)}...`
                  : item.question || "No Question"}
              </h3>
            </div>
          </div>
        </td>
        {/* Options */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="font-semibold text-gray-900">
              {item.options?.length || 0} options
            </span>
          </div>
        </td>

        {/* Settings */}
        <td className="px-6 py-4">
          <div className="flex flex-col gap-1">
            {item.enable_feedback && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 w-fit">
                <MessageSquare size={12} />
                Feedback
              </span>
            )}
            {item.enable_whatsapp && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 w-fit">
                <MessageSquare size={12} />
                WhatsApp
              </span>
            )}
            {!item.enable_feedback && !item.enable_whatsapp && (
              <span className="text-xs text-gray-500">No settings</span>
            )}
          </div>
        </td>

        {/* Date Range */}
        <td className="px-6 py-4">
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-gray-700 whitespace-nowrap">
                {formatDate(item.start_date)}
              </span>
            </div>
            <div className="text-xs text-gray-500 whitespace-nowrap">
              to {formatDate(item.end_date)}
            </div>
          </div>
        </td>

        <td className="px-6 py-4">
          {hasPermission("Programs", "update") ? (
            <div className="relative inline-block">
              <select
                value={item.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  updateQuestionStatus(item.id, e.target.value, item.end_date);
                }}
                className={`appearance-none font-medium px-3 py-1.5 pr-8 rounded-full text-xs border shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer
        ${
          item.status === "active"
            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 focus:ring-green-300"
            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 focus:ring-red-300"
        }`}
              >
                <option value="active"> Active</option>
                <option value="in-active"> Inactive</option>
              </select>

              {/* Custom dropdown arrow */}
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
                ▼
              </span>
            </div>
          ) : (
            <span
              className={`font-medium px-3 py-1.5 rounded-full text-xs inline-flex items-center gap-1 shadow-sm
      ${
        item.status === "active"
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
      }`}
            >
              {item.status === "active" ? "Active" : "Inactive"}
            </span>
          )}
        </td>

        {/* Actions */}
        {(hasPermission("Programs", "update") ||
          hasPermission("Programs", "delete")) && (
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              {hasPermission("Programs", "update") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                  className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-300 text-blue-600 transition-all duration-200"
                  title="Edit Question"
                >
                  <Edit size={16} />
                </button>
              )}
              {hasPermission("Programs", "delete") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  disabled={deletingId === item.id}
                  className="p-2 px-3 border rounded-lg shadow-sm text-red-600 border-gray-200 transition-all duration-200 flex items-center gap-2 justify-center hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Question"
                >
                  {deletingId === item.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              )}
            </div>
          </td>
        )}
      </tr>
    ));
  }, [
    programQuestions,
    currentPage,
    pageSize,
    formatDate,
    hasPermission,
    handleEdit,
    handleDelete,
    deletingId,
    updateQuestionStatus,
  ]);

  // Memoized loading state
  const loadingState = useMemo(
    () => (
      <tr>
        <td
          colSpan={
            hasPermission("Programs", "update") ||
            hasPermission("Programs", "delete")
              ? 8
              : 7
          }
          className="px-6 py-12 text-center"
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="text-gray-600 font-medium">Loading questions...</p>
          </div>
        </td>
      </tr>
    ),
    [hasPermission],
  );

  // Memoized empty state
  const emptyState = useMemo(
    () => (
      <tr>
        <td
          colSpan={
            hasPermission("Programs", "update") ||
            hasPermission("Programs", "delete")
              ? 8
              : 7
          }
          className="px-6 py-16 text-center"
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <HelpCircle size={48} className="text-gray-300" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No questions found
              </h3>
              <p className="text-gray-500 text-sm">
                {searchQuery
                  ? "Try adjusting your filters or search terms"
                  : "Get started by creating your first program question"}
              </p>
            </div>
            {hasPermission("Programs", "create") && !searchQuery && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Create First Question
              </button>
            )}
          </div>
        </td>
      </tr>
    ),
    [hasPermission, searchQuery],
  );

  return (
    <div className="flex flex-col flex-1">
      <BreadCrumb
        title={"Program Polls Management"}
        paths={["Programs", "Program Polls"]}
      />
      <div className="mt-4 rounded-xl shadow-sm px-4 py-4 md:px-6 md:py-6 md:mx-4 bg-white flex-1">
        {/* Header Section */}
        <div className="flex flex-row justify-between items-start gap-4 border-b border-gray-200 pb-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Program Polls Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Showing {totalRecords} total questions
            </p>
          </div>
          {hasPermission("Programs", "create") && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
            >
              <BadgePlus size={18} />
              <span>Add New Question</span>
            </button>
          )}
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-4 my-6">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search questions by text..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <div className="overflow-auto rounded-lg bg-white border border-gray-200">
          <table className="min-w-full">
            {tableHeaders}
            <tbody className="divide-y divide-gray-200">
              {loading
                ? loadingState
                : programQuestions.length === 0
                  ? emptyState
                  : questionRows}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
        />
      </div>
      {/* Create/Edit Program Question Modal */}
      <CreateEditProgramQuestionModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editData={selectedQuestion}
      />
      {selectedQuestion && (
        <QuestionResults
          isOpen={showResult}
          question_id={selectedQuestion.id}
          onClose={() => {
            setShowResult(false);
            setSelectedQuestion(null);
          }}
        />
      )}{" "}
    </div>
  );
};

export default ProgramPolls;
