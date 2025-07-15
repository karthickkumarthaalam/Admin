import React, { useState, useEffect } from "react";
import BreadCrumb from "../BreadCrum";
import { Loader2, Trash2 } from "lucide-react";
import { apiCall } from "../../utils/apiCall";
import { toast } from "react-toastify";
import { usePermission } from "../../context/PermissionContext";

const PodcastComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 20;

  const { hasPermission } = usePermission();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/podcasts/comments?page=${currentPage}`,
        "GET"
      );
      setComments(response.data.data);
      setTotalRecords(response.data.pagination.totalRecords);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [currentPage]);

  const handleStatusChange = async (comment) => {
    if (
      !window.confirm(
        "Are you sure you want to change the status of this comment?"
      )
    )
      return;
    const newStatus = comment.status === "pending" ? "approved" : "pending";
    try {
      await apiCall(`/podcasts/comments/${comment.id}/status`, "PATCH", {
        status: newStatus,
      });
      toast.success(`Comment status changed successfully`);
      fetchComments();
    } catch (error) {
      toast.error("Failed to update comment status");
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment ?")) {
      return;
    }
    setLoading(true);
    try {
      await apiCall(`/podcasts/${commentId}/comments`, "DELETE");
      fetchComments();
      toast.success("Comment Deleted Successfully");
    } catch (error) {
      toast.error("Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"Podcast Comment Management"}
          paths={["Podcasts", "Comment Moderation"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <p className="text-sm sm:text-lg font-semibold text-gray-800 mb-3 border-b border-dashed border-gray-300 pb-2">
            Podcast Comments
          </p>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-red-500" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="py-2 px-4 border">SI</th>
                    <th className="py-2 px-4 border">Podcast</th>
                    <th className="py-2 px-4 border">Member</th>
                    <th className="py-2 px-4 border w-[600px]">Comment</th>
                    <th className="py-2 px-4 border">Posted On</th>
                    <th className="py-2 px-4 border">Status</th>
                    <th className="py-2 px-4 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-6 px-4 border text-center text-gray-500 text-sm"
                      >
                        No comments found.
                      </td>
                    </tr>
                  ) : (
                    comments.map((item, index) => (
                      <tr key={item.id}>
                        <td className="py-2 px-4 border">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-2 px-4 border">
                          {item.Podcast?.title}
                        </td>
                        <td className="py-2 px-4 border">
                          {item.Member?.name}
                        </td>
                        <td className="py-2 px-4 border  w-[600px]">
                          {item.comment}
                        </td>
                        <td className="py-2 px-4 border">
                          {new Date(item.created_at).toLocaleString()}
                        </td>
                        <td className="py-2 px-4 border">
                          {hasPermission("Podcast Comment", "update") ? (
                            <span
                              onClick={() => handleStatusChange(item)}
                              className={`cursor-pointer px-2 py-1 text-xs rounded font-semibold ${
                                item.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.status}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded font-semibold bg-gray-200 text-gray-600">
                              {item.status}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-4 border">
                          <div className="flex items-center">
                            {hasPermission("Podcast Comment", "delete") && (
                              <button
                                className="text-red-600 hover:text-red-700 cursor-pointer"
                                onClick={() => handleDelete(item.id)}
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-sm px-3 py-1.5 rounded border hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="text-sm px-3 py-1.5 rounded border hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PodcastComments;
