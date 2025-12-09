import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePermission } from "../../../context/PermissionContext";
import { useAuth } from "../../../context/AuthContext";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";
import {
  BadgePlus,
  Calendar,
  Edit,
  FileText,
  Loader2,
  Search,
  Trash2,
  User,
} from "lucide-react";
import AddBlogsModal from "./AddBlogsModal";
import BreadCrumb from "../../BreadCrum";

const BlogsList = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editBlogsData, setEditBlogsData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);

  const { hasPermission } = usePermission();

  const { user } = useAuth();

  const pageSize = 20;

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/blogs?page=${currentPage}&limit=${pageSize}&search=${debouncedSearchQuery}&status=${
          statusFilter !== "all" ? statusFilter : ""
        }&category=${categoryFilter !== "all" ? categoryFilter : ""}`
      );
      setBlogs(response.data);
      setTotalRecords(response.pagination.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch Blogs List");
      setBlogs([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    statusFilter,
    categoryFilter,
    debouncedSearchQuery,
    pageSize,
  ]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiCall("/blogs-category/list", "GET");
      setCategories(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch category");
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter, categoryFilter]);

  const totalPages = useMemo(
    () => Math.ceil(totalRecords / pageSize),
    [totalRecords, pageSize]
  );

  const formatDate = useCallback((dateString) => {
    if (!dateString) return;

    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (window.confirm("Are you sure you want to delete this blog ?")) {
        setDeleteId(id);
        try {
          await apiCall(`/blogs/${id}`, "DELETE");
          toast.success("Blog Deleted successfully");
          fetchBlogs();
        } catch (error) {
          toast.error("Failed to delete blog");
        } finally {
          setDeleteId(null);
        }
      }
    },
    [fetchBlogs]
  );

  const updateBlogsStatus = useCallback(
    async (id, status) => {
      if (
        window.confirm("Are you sure you want to update status of this blog ?")
      ) {
        try {
          await apiCall(`/blogs/status/${id}`, "PATCH", { status });
          toast.success("Status updated successfully");
          fetchBlogs();
        } catch (error) {
          toast.error("Failed to update status");
        }
      }
    },
    [fetchBlogs]
  );

  const handleEdit = useCallback((item) => {
    setShowModal(true);
    setEditBlogsData(item);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditBlogsData(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    fetchBlogs();
    handleModalClose();
  }, [fetchBlogs, handleModalClose]);

  const handleFilterChange = useCallback((filterType, value) => {
    if (filterType === "status") setStatusFilter(value);
    if (filterType === "category") setCategoryFilter(value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const tableHeaders = useMemo(() => {
    const hasActions =
      hasPermission("Blogs", "update") || hasPermission("Blogs", "delete");

    return (
      <thead className="bg-gray-700 text-gray-100 border-b border-gray-200">
        <tr>
          <th className="px-6 py-3 text-left font-semibold">SI</th>
          <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">
            Blogs Details
          </th>
          <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">
            category
          </th>
          <th className="px-6 py-3 text-left font-semibold whitespace-nowrap">
            Publishing Info
          </th>
          {user.role === "admin" && (
            <th className="px-6 py-3 text-left font-semibold">Status</th>
          )}
          {hasActions && (
            <th className="px-6 py-3 text-left font-semibold">Actions</th>
          )}
        </tr>
      </thead>
    );
  }, [hasPermission]);

  const loadingState = useMemo(
    () => (
      <tr>
        <td
          colSpan={
            hasPermission("Blogs", "update") || hasPermission("Blogs", "delete")
              ? 6
              : 5
          }
          className="px-6 py-12 text-center"
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="text-gray-600 font-medium">Loading Blogs...</p>
          </div>
        </td>
      </tr>
    ),
    [hasPermission]
  );

  const emptyState = useMemo(
    () => (
      <tr>
        <td
          colSpan={
            hasPermission("Blogs", "update") || hasPermission("Blogs", "delete")
              ? 6
              : 5
          }
          className="px-6 py-16 text-center"
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <FileText size={48} className="text-gray-300" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No blogs found
              </h3>
              <p className="text-gray-500 text-sm">
                {searchQuery ||
                statusFilter !== "all" ||
                categoryFilter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Get started by creating your first Blog article"}
              </p>
            </div>
            {hasPermission("Blogs", "create") && !searchQuery && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Create First Blog
              </button>
            )}
          </div>
        </td>
      </tr>
    ),
    [hasPermission, searchQuery, statusFilter, categoryFilter]
  );

  const blogRows = useMemo(() => {
    return blogs.map((item, index) => (
      <tr
        key={item.id}
        className="group hover:bg-slate-50 transition-all duration-200 transform"
      >
        <td className="px-6 py-4 text-sm text-gray-600 font-bold">
          {(currentPage - 1) * pageSize + index + 1}
        </td>

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

        <td className="px-6 py-4">
          <div className="space-y-2">
            <div className="flex flex-col items-start gap-2">
              <span className="text-sm font-semibold text-gray-900 bg-violet-100 px-2 py-1 rounded-lg">
                {item.category || "Uncategorized"}
                {item.subcategory && (
                  <span className="text-blue-700"> - {item.subcategory}</span>
                )}
              </span>
            </div>
          </div>
        </td>

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
          </div>
        </td>

        {user.role === "admin" && (
          <td className="px-6 py-4 border-b">
            <div className="flex flex-col gap-2">
              <select
                value={item.status}
                onChange={(e) => updateBlogsStatus(item.id, e.target.value)}
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
                      {new Date(item.status_updated_at).toLocaleString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "short",
                        }
                      )}
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
                      {new Date(item.status_updated_at).toLocaleString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "short",
                        }
                      )}
                    </p>
                  )}{" "}
                </div>
              )}
            </div>
          </td>
        )}

        {(hasPermission("Blogs", "update") ||
          hasPermission("Blogs", "delete")) && (
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              {hasPermission("Blogs", "update") && (
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-300 text-blue-600 transition-all duration-200"
                  title="Edit Blogs"
                >
                  <Edit size={16} />
                </button>
              )}
              {hasPermission("Blogs", "delete") && (
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteId === item.id}
                  className={`p-2 px-3 border rounded-lg shadow-sm text-red-600 border-gray-200 transition-all duration-200 flex items-center gap-2 justify-center hover:bg-red-50 hover:border-red-300`}
                  title="Delete Blogs"
                >
                  {deleteId === item.id ? (
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
    blogs,
    currentPage,
    pageSize,
    formatDate,
    hasPermission,
    handleEdit,
    handleDelete,
    deleteId,
  ]);

  return (
    <div className="flex flex-col flex-1 ">
      <BreadCrumb
        title={"Blogs Management"}
        paths={["Blogs", "Blogs Management"]}
      />

      <div className="mt-4 rounded-xl shadow-sm px-4 py-4 md:px-6 md:py-6 md:mx-4 bg-white flex-1">
        {/* Header Section */}
        <div className="flex flex-row justify-between items-start gap-4 border-b border-gray-200 pb-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Blogs Management
            </h1>
          </div>
          {hasPermission("Blogs", "create") && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
            >
              <BadgePlus size={18} />
              <span>Add New Blogs</span>
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
                placeholder="Search blogs by title or subtitle..."
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

        {/* Blogs Table */}
        <div className="overflow-auto rounded-lg bg-white border border-gray-200">
          <table className="min-w-full">
            {tableHeaders}
            <tbody className="divide-y divide-gray-200">
              {loading
                ? loadingState
                : blogs.length === 0
                ? emptyState
                : blogRows}
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
      <AddBlogsModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editBlogsData={editBlogsData}
      />
    </div>
  );
};

export default BlogsList;
