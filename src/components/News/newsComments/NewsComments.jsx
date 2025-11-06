import React, { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import BreadCrumb from "../../BreadCrum";
import { usePermission } from "../../../context/PermissionContext";

const NewsComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const { hasPermission } = usePermission();

  const pageSize = 20;

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await apiCall(
        `/news-comments?page=${currentPage}&limit=${pageSize}&status=${filterStatus}`
      );

      if (res?.status === "success") {
        setComments(res.data || []);
        setTotalRecords(res.pagination?.totalRecords || 0);
      } else {
        toast.error("Failed to load comments");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [currentPage, filterStatus]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    try {
      await apiCall(`/news-comments/${id}`, "DELETE");
      toast.success("Comment deleted successfully");
      fetchComments();
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiCall(`/news-comments/${id}/status`, "PUT", {
        status: newStatus,
      });
      toast.success(`Status updated to ${newStatus}`);
      fetchComments();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Helper for colored status text
  const renderStatusText = (status) => {
    const base = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case "approved":
        return (
          <span className={`${base} text-green-700 bg-green-100`}>
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className={`${base} text-red-700 bg-red-100`}>Rejected</span>
        );
      default:
        return (
          <span className={`${base} text-yellow-700 bg-yellow-100`}>
            Pending
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb title="News Comments" paths={["News", "Comments"]} />

      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-semibold text-lg">Comment List</h2>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-6 border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white">
              <tr>
                <th className="px-3 py-3 text-left">SI</th>
                <th className="px-3 py-3 text-left">News Title</th>
                <th className="px-3 py-3 text-left">Comment</th>
                <th className="px-3 py-3 text-left">Posted By</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    <Loader2
                      className="animate-spin mx-auto text-blue-600"
                      size={32}
                    />
                    <p className="text-gray-500 mt-2">Loading comments...</p>
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-500 italic"
                  >
                    No comments found
                  </td>
                </tr>
              ) : (
                comments.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } border-b border-gray-200 transition hover:bg-gray-100`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 ">
                      {(currentPage - 1) * pageSize + i + 1}
                    </td>

                    {/* News title */}
                    <td className="px-4 py-3 font-semibold text-gray-900 max-w-[300px] truncate">
                      {c.News?.title?.length > 50
                        ? c.News.title.substring(0, 50) + "..."
                        : c.News?.title || "Untitled News"}
                    </td>

                    {/* Comment text */}
                    <td className="px-4 py-3 text-gray-700 max-w-[300px]">
                      {c.comment}
                    </td>

                    {/* Posted by */}
                    <td className="px-4 py-3 text-gray-800">
                      {c.Member?.name || c.guest_name || "Guest"}
                    </td>

                    {/* Status (static view only) */}
                    <td className="px-4 py-3">{renderStatusText(c.status)}</td>

                    {/* Action column */}
                    <td className="px-4 py-3  gap-2">
                      {/* Status update dropdown */}
                      {hasPermission("News", "update") && (
                        <select
                          value={c.status}
                          onChange={(e) =>
                            handleStatusChange(c.id, e.target.value)
                          }
                          className="border border-gray-300 rounded-md px-2 py-1 text-xs font-medium bg-white hover:border-gray-400 focus:ring-1 focus:ring-blue-400 transition"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      )}

                      {/* Delete button */}
                      {hasPermission("News", "delete") && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-md transition"
                          title="Delete Comment"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsComments;
