import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePermission } from "../../../context/PermissionContext";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import {
  BadgePlus,
  Search,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Vote,
} from "lucide-react";
import Pagination from "../../Pagination";
import BreadCrumb from "../../BreadCrum";
import CreateEditNewsQuestionModal from "./CreateEditNewsQuestionModal";
import NewsPollResult from "./NewsPollResult";

const NewsPoll = () => {
  const [newsPolls, setNewsPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const { hasPermission } = usePermission();
  const pageSize = 20;

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/news-poll?page=${currentPage}&limit=${pageSize}&search=${debouncedSearchQuery}`,
        "GET",
      );

      setNewsPolls(response.data || []);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch News Questions");
      setNewsPolls([]);
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
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const totalPage = useMemo(
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this News Poll ?"))
      return;
    setDeletingId(id);
    try {
      await apiCall(`/news-poll/${id}`, "DELETE");
      toast.success("News Poll deleted successfully");
      setNewsPolls((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      toast.error("Failed to delete News Poll");
    } finally {
      setDeletingId(null);
    }
  };

  const updateQuestionStatus = useCallback(async (id, status, end_date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(end_date);
    endDate.setHours(0, 0, 0, 0);

    if (status === true && endDate < today) {
      toast.error("Cannot Activate. This Poll has already expired");
      return;
    }

    if (!window.confirm("Are you sure you want to update this status ?"))
      return;

    try {
      await apiCall(`/news-poll/${id}/status`, "PATCH", {
        is_active: status,
      });

      toast.success("Status updated successfully");
      setNewsPolls((prev) =>
        prev.map((q) => (q.id === id ? { ...q, is_active: status } : q)),
      );
    } catch (error) {
      toast.error("Failed to update status");
    }
  });

  const handleEdit = (item) => {
    setSelectedQuestion(item);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedQuestion(null);
  };

  const handleModalSuccess = () => {
    fetchQuestions();
    handleModalClose();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const tableHeaders = useMemo(() => {
    const hasActions =
      hasPermission("News Poll", "update") ||
      hasPermission("News Poll", "delete");

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

  const pollRows = useMemo(() => {
    return newsPolls.map((item, index) => (
      <tr
        key={item.id}
        onClick={() => {
          setSelectedQuestion(item);
          setShowResult(true);
        }}
        className="group hover:bg-slate-50 transition-all duration-200"
      >
        {/* Serial */}
        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
          {(currentPage - 1) * pageSize + index + 1}
        </td>

        {/* Question */}
        <td className="px-4 sm:px-6 py-4 min-w-[260px] max-w-[420px]">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2 leading-5 sm:leading-6 min-h-[2.5rem] sm:min-h-[3rem] break-words">
            {item.question}
          </h3>
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

        {/* Date */}
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

        {/* Status */}
        <td className="px-6 py-4">
          {hasPermission("News Poll", "update") ? (
            <div className="relative inline-block">
              <select
                value={item.is_active ? "active" : "inactive"}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  updateQuestionStatus(
                    item.id,
                    e.target.value === "active",
                    item.end_date,
                  );
                }}
                className={`appearance-none font-medium px-3 py-1.5 pr-8 rounded-full text-xs border shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer ${
                  item.is_active
                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 focus:ring-green-300"
                    : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 focus:ring-red-300"
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
                ▼
              </span>
            </div>
          ) : (
            <span
              className={`font-medium px-3 py-1.5 rounded-full text-xs inline-flex items-center gap-1 shadow-sm ${
                item.is_active
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {item.is_active ? "Active" : "Inactive"}
            </span>
          )}
        </td>

        {/* Actions */}
        {(hasPermission("News Poll", "update") ||
          hasPermission("News Poll", "delete")) && (
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              {/* Results */}

              {/* Edit */}
              {hasPermission("News Poll", "update") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                  className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-300 text-blue-600 transition-all duration-200"
                  title="Edit Poll"
                >
                  <Edit size={16} />
                </button>
              )}

              {/* Delete */}
              {hasPermission("News Poll", "delete") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  disabled={deletingId === item.id}
                  className="p-2 px-3 border rounded-lg shadow-sm text-red-600 border-gray-200 transition-all duration-200 flex items-center gap-2 justify-center hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Poll"
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
    newsPolls,
    currentPage,
    pageSize,
    formatDate,
    hasPermission,
    handleEdit,
    handleDelete,
    deletingId,
    updateQuestionStatus,
  ]);

  const loadingState = useMemo(
    () => (
      <tr>
        <td
          colSpan={
            hasPermission("News Poll", "update") ||
            hasPermission("News Poll", "delete")
              ? 8
              : 7
          }
          className="px-6 py-12 text-center"
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 size={32} className="animate-spin text-blue-600" />

            <p className="text-gray-600 font-medium">Loading polls...</p>
          </div>
        </td>
      </tr>
    ),
    [hasPermission],
  );

  const emptyState = useMemo(
    () => (
      <tr>
        <td
          colSpan={
            hasPermission("News Poll", "update") ||
            hasPermission("News Poll", "delete")
              ? 8
              : 7
          }
          className="px-6 py-16 text-center"
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <HelpCircle size={48} className="text-gray-300" />

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No polls found
              </h3>

              <p className="text-gray-500 text-sm">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Create your first news poll"}
              </p>
            </div>

            {hasPermission("News Poll", "create") && !searchQuery && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Create First Poll
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
        title={"News Polls Management"}
        paths={["News", "News Polls"]}
      />
      <div className="mt-4 rounded-xl shadow-sm px-4 py-4 md:px-6 md:py-6 md:mx-4 bg-white flex-1">
        {/* Header Section */}
        <div className="flex flex-row justify-between items-start gap-4 border-b border-gray-200 pb-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              News Polls Management
            </h1>
          </div>
          {hasPermission("News Poll", "create") && (
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

        <div className="overflow-auto rounded-lg bg-white border border-gray-200">
          <table className="min-w-full">
            {tableHeaders}

            <tbody className="divide-y divide-gray-200">
              {loading
                ? loadingState
                : newsPolls.length === 0
                  ? emptyState
                  : pollRows}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPage}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
        />
      </div>
      {/* Create/Edit Program Question Modal */}
      <CreateEditNewsQuestionModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editData={selectedQuestion}
      />
      {selectedQuestion && (
        <NewsPollResult
          isOpen={showResult}
          poll_id={selectedQuestion.id}
          onClose={() => {
            setShowResult(false);
            setSelectedQuestion(null);
          }}
        />
      )}{" "}
    </div>
  );
};

export default NewsPoll;
