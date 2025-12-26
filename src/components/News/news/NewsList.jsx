import React, { useEffect, useState, useCallback, useMemo } from "react";
import { usePermission } from "../../../context/PermissionContext";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";
import BreadCrumb from "../../BreadCrum";
import AddNewsModal from "./AddNewsModal";
import {
  BadgePlus,
  Search,
  Calendar,
  MapPin,
  User,
  FileText,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editNewsData, setEditNewsData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const { hasPermission } = usePermission();

  const { user } = useAuth();

  const pageSize = 20;

  // Memoized API call to prevent unnecessary recreations
  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/news/admin-list?page=${currentPage}&limit=${pageSize}&search=${debouncedSearchQuery}&status=${
          statusFilter !== "all" ? statusFilter : ""
        }&category=${categoryFilter !== "all" ? categoryFilter : ""}`
      );
      setNews(response.data || []);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch News List");
      setNews([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    debouncedSearchQuery,
    statusFilter,
    categoryFilter,
    pageSize,
  ]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiCall("/news-category/list", "GET");
      setCategories(res.data || []);
    } catch {
      toast.error("Failed to fetch categories");
      setCategories([]);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  // Fetch news when dependencies change
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Fetch categories only once on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter, categoryFilter]);

  // Memoized computed values
  const totalPages = useMemo(
    () => Math.ceil(totalRecords / pageSize),
    [totalRecords, pageSize]
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

  const handleDelete = useCallback(
    async (id) => {
      if (window.confirm("Are you sure you want to delete this news?")) {
        setDeletingId(id);
        try {
          await apiCall(`/news/${id}`, "DELETE");
          toast.success("News deleted successfully");
          fetchNews();
        } catch (error) {
          toast.error("Failed to delete news");
        } finally {
          setDeletingId(null);
        }
      }
    },
    [fetchNews]
  );

  const updateNewsStatus = useCallback(
    async (id, status) => {
      if (
        window.confirm("Are you sure you want to update status of this news ?")
      ) {
        try {
          await apiCall(`/news/status/${id}`, "PATCH", { status });
          toast.success("News Status updated successfully");
          fetchNews();
        } catch (error) {
          toast.error("Failed to update status");
        }
      }
    },
    [fetchNews]
  );

  const handleEdit = useCallback((item) => {
    setEditNewsData(item);
    setShowModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditNewsData(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    fetchNews();
    handleModalClose();
  }, [fetchNews, handleModalClose]);

  const handleFilterChange = useCallback((filterType, value) => {
    if (filterType === "status") setStatusFilter(value);
    if (filterType === "category") setCategoryFilter(value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Memoized table headers to prevent re-renders
  const tableHeaders = useMemo(() => {
    const hasActions =
      hasPermission("News", "update") || hasPermission("News", "delete");

    return (
      <thead className="bg-gray-700 text-gray-100 border-b border-gray-200">
        <tr>
          <th className="px-6 py-3 text-left font-semibold">SI</th>
          <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">
            News Details
          </th>
          <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">
            Category & Location
          </th>
          <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">
            Publishing Info
          </th>
          <th className="px-6 py-3 text-left font-semibold">Status</th>
          {hasActions && (
            <th className="px-6 py-3 text-left font-semibold">Actions</th>
          )}
        </tr>
      </thead>
    );
  }, [hasPermission]);

  // Memoized news rows to prevent re-renders
  const newsRows = useMemo(() => {
    return news.map((item, index) => (
      <tr
        key={item.id}
        className="group hover:bg-slate-50 transition-all duration-200 transform"
      >
        {/* Serial Number */}
        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
          {(currentPage - 1) * pageSize + index + 1}
        </td>
        {/* News Details */}
        <td className="px-6 py-4">
          <div className="flex items-start space-x-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                {item.title?.length > 50
                  ? `${item.title.substring(0, 50)}...`
                  : item.title || "No Title"}
              </h3>

              {item.subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {item.subtitle.length > 50
                    ? `${item.subtitle.substring(0, 50)}...`
                    : item.subtitle}
                </p>
              )}
            </div>
          </div>
        </td>
        {/* Category & Location */}
        <td className="px-6 py-4">
          <div className="space-y-2">
            <div className="flex flex-col items-start gap-2">
              <span className="text-sm font-semibold text-gray-900 bg-purple-100 px-2 py-1 rounded-lg">
                {item.category || "Uncategorized"}
                {item.subcategory && (
                  <span className="text-blue-700"> - {item.subcategory}</span>
                )}
              </span>
            </div>

            {(item.city || item.state || item.country) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={14} />
                <span>
                  {[item.city, item.state, item.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>
        </td>
        {/* Publishing Info */}
        <td className="px-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-gray-400" />
              <span className="text-gray-700 whitespace-nowrap">
                {item.published_by || "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-gray-700 whitespace-nowrap">
                {formatDate(item.published_date)}
              </span>
            </div>
            {item.content_creator && (
              <div className="text-xs text-gray-500">
                By: {item.content_creator}
              </div>
            )}
          </div>
        </td>
        {/* Status */}
        <td className="px-6 py-4 border-b">
          <div className="flex flex-col gap-2">
            {user.role === "admin" && (
              <select
                value={item.status}
                onChange={(e) => updateNewsStatus(item.id, e.target.value)}
                className={`font-semibold px-2 py-0.5 rounded-full text-xs border transition-all focus:ring-2 ${
                  item.status === "published"
                    ? "bg-green-100 text-green-800 border-green-200 focus:ring-green-300"
                    : item.status === "archived"
                    ? "bg-red-100 text-red-800 border-red-200 focus:ring-red-300"
                    : "bg-blue-100 text-blue-800 border-blue-200 focus:ring-blue-300"
                }`}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            )}

            {item.status === "draft" && (
              <div className="px-2 py-1.5 rounded-lg bg-blue-50/50 border border-blue-200">
                <p className="text-xs font-semibold text-blue-500">
                  Status Update <span className="text-blue-900 ">Pending</span>
                </p>
              </div>
            )}

            {item.status === "published" && (
              <div className="px-2 py-1.5 rounded-lg bg-green-50/50 border border-green-200">
                <p className="text-xs font-semibold text-green-700">
                  Approved by{" "}
                  <span className="text-green-900">
                    {item.status_updated_by || "Admin"}
                  </span>
                </p>
                {item.status_updated_at && (
                  <p className="text-[10px] text-green-900 font-medium mt-0.5">
                    {new Date(item.status_updated_at).toLocaleString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                )}{" "}
              </div>
            )}

            {item.status === "archived" && (
              <div className="px-2 py-1.5 rounded-lg bg-red-50/50 border border-red-200">
                <p className="text-xs font-semibold text-red-700">
                  Archived by{" "}
                  <span className="text-green-900">
                    {item.status_updated_by || "Admin"}
                  </span>
                </p>
                {item.status_updated_at && (
                  <p className="text-[10px] text-red-900 font-medium mt-0.5">
                    {new Date(item.status_updated_at).toLocaleString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                )}{" "}
              </div>
            )}
          </div>
        </td>
        {/* Actions */}
        {(hasPermission("News", "update") ||
          hasPermission("News", "delete")) && (
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              {hasPermission("News", "update") && (
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-300 text-blue-600 transition-all duration-200"
                  title="Edit News"
                >
                  <Edit size={16} />
                </button>
              )}
              {hasPermission("News", "delete") && (
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className={`p-2 px-3 border rounded-lg shadow-sm text-red-600 border-gray-200 transition-all duration-200 flex items-center gap-2 justify-center hover:bg-red-50 hover:border-red-300`}
                  title="Delete News"
                >
                  {deletingId === item.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </td>
        )}
      </tr>
    ));
  }, [
    news,
    currentPage,
    pageSize,
    formatDate,
    hasPermission,
    handleEdit,
    handleDelete,
    deletingId,
  ]);

  // Memoized loading state
  const loadingState = useMemo(
    () => (
      <tr>
        <td
          colSpan={
            hasPermission("News", "update") || hasPermission("News", "delete")
              ? 6
              : 5
          }
          className="px-6 py-12 text-center"
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="text-gray-600 font-medium">Loading news...</p>
          </div>
        </td>
      </tr>
    ),
    [hasPermission]
  );

  // Memoized empty state
  const emptyState = useMemo(
    () => (
      <tr>
        <td
          colSpan={
            hasPermission("News", "update") || hasPermission("News", "delete")
              ? 6
              : 5
          }
          className="px-6 py-16 text-center"
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <FileText size={48} className="text-gray-300" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No news found
              </h3>
              <p className="text-gray-500 text-sm">
                {searchQuery ||
                statusFilter !== "all" ||
                categoryFilter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Get started by creating your first news article"}
              </p>
            </div>
            {hasPermission("News", "create") && !searchQuery && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Create First News
              </button>
            )}
          </div>
        </td>
      </tr>
    ),
    [hasPermission, searchQuery, statusFilter, categoryFilter]
  );

  return (
    <div className="flex flex-col flex-1 ">
      <BreadCrumb
        title={"News Management"}
        paths={["News", "News Management"]}
      />

      <div className="mt-4 rounded-xl shadow-sm px-4 py-4 md:px-6 md:py-6 md:mx-4 bg-white flex-1">
        {/* Header Section */}
        <div className="flex flex-row justify-between items-start gap-4 border-b border-gray-200 pb-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              News Management
            </h1>
          </div>
          {hasPermission("News", "create") && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
            >
              <BadgePlus size={18} />
              <span>Add New News</span>
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
                placeholder="Search news by title or subtitle..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Categories</option>
              {categories.map((category, index) => (
                <option
                  key={`${category}-${index}`}
                  value={category}
                  className="capitalize"
                >
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* News Table */}
        <div className="overflow-auto rounded-lg bg-white border border-gray-200">
          <table className="min-w-full">
            {tableHeaders}
            <tbody className="divide-y divide-gray-200">
              {loading
                ? loadingState
                : news.length === 0
                ? emptyState
                : newsRows}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-4 gap-4">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords}{" "}
              results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      <AddNewsModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editNewsData={editNewsData}
      />
    </div>
  );
};

export default NewsList;
