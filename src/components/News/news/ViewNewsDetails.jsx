import {
  Newspaper,
  X,
  MessageSquare,
  Calendar,
  Tag,
  User,
  Globe,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";

const ViewNewsDetails = ({ isOpen, onClose, news }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [totalComments, setTotalComments] = useState(0);

  const commentsContainerRef = useRef(null);
  const comments_per_page = 20;

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    if (isOpen && news?.id) {
      setComments([]);
      setCommentsPage(1);
      setHasMoreComments(true);
      fetchInitial();
    }
  }, [isOpen, news?.id]);

  useEffect(() => {
    if (isOpen && news?.id && commentsPage > 1) {
      fetchComments();
    }
  }, [commentsPage]);

  // =========================
  // SCROLL LOAD
  // =========================
  useEffect(() => {
    const container = commentsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      if (
        scrollHeight - scrollTop <= clientHeight + 100 &&
        !commentsLoading &&
        hasMoreComments
      ) {
        setCommentsPage((prev) => prev + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [commentsLoading, hasMoreComments]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const commentRes = await apiCall(
        `/news-comments/news/${news?.id}?page=1&limit=${comments_per_page}`,
      );

      const data = commentRes?.result?.data || [];
      setComments(data);
      setTotalComments(commentRes?.result?.pagination?.totalRecords || 0);

      setHasMoreComments(
        commentRes?.result?.pagination?.currentPage <
          commentRes?.result?.pagination?.totalPages,
      );
    } catch (error) {
      toast.error("Failed to load news comments");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (commentsLoading || !hasMoreComments) return;

    setCommentsLoading(true);
    try {
      const commentRes = await apiCall(
        `/news-comments/news/${news?.id}?page=${commentsPage}&limit=${comments_per_page}`,
      );

      const newComments = commentRes?.result?.data || [];
      setComments((prev) => [...prev, ...newComments]);

      setHasMoreComments(
        commentRes?.result?.pagination?.currentPage <
          commentRes?.result?.pagination?.totalPages,
      );
    } catch (error) {
      toast.error("Failed loading more comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  // =========================
  // COMMENT STATUS
  // =========================
  const handleStatusChange = async (comment) => {
    if (!window.confirm("Change comment status?")) return;

    const newStatus = comment.status === "approved" ? "pending" : "approved";

    try {
      await apiCall(`/news-comments/${comment.id}/status`, "PUT", {
        status: newStatus,
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id ? { ...c, status: newStatus } : c,
        ),
      );

      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await apiCall(`/news-comments/${id}`, "DELETE");

      setComments((prev) => prev.filter((c) => c.id !== id));
      setTotalComments((prev) => prev - 1);
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 flex justify-center z-[200] p-4 backdrop-blur-md"
    >
      {" "}
      <div className="bg-white md:rounded-xl shadow-xl w-full h-full overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="sticky top-0 z-30 flex justify-between items-center border-b bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Newspaper className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-semibold">NEWS DETAILS</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT - NEWS */}
          <div className="w-full lg:w-2/5 border-r flex flex-col ">
            <div className="p-6 overflow-y-auto space-y-5 scrollbar-hide">
              {/* IMAGE */}
              {news?.cover_image && (
                <img
                  src={news.cover_image}
                  alt={news?.title || "News cover image"}
                  className="rounded-xl w-full object-cover shadow-lg"
                />
              )}

              {/* TITLE */}
              <div>
                <h1 className="text-2xl font-bold">{news?.title}</h1>
                <p className="text-gray-500 mt-1">{news?.subtitle}</p>
              </div>

              {/* META */}
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg text-blue-700 ">
                  <Calendar size={14} />
                  {news?.published_date}
                </div>

                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-lg text-purple-700">
                  <User size={14} />
                  {news?.published_by}
                </div>

                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg text-green-700">
                  <Tag size={14} />
                  {news?.category} / {news?.subcategory}
                </div>

                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg text-gray-700">
                  <Globe size={14} />
                  {news?.country}, {news?.state}
                </div>
              </div>

              {/* CONTENT */}
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: news?.content }}
              />
            </div>
          </div>

          {/* RIGHT - COMMENTS */}
          <div className="w-full lg:w-3/5 flex flex-col">
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Comments
                    </h3>
                    <p className="text-sm text-gray-600">
                      {totalComments} total comments
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Approved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={commentsContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
            >
              {loading ? (
                <div className="flex justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block p-6 bg-gray-100 rounded-2xl mb-4">
                    <MessageSquare size={48} className="text-gray-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">
                    No comments yet
                  </h4>
                  <p className="text-gray-500 max-w-md mx-auto">
                    This podcast hasn't received any comments yet.
                  </p>
                </div>
              ) : (
                <>
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white rounded-xl p-4 shadow hover:shadow-md"
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">
                            {c.Member?.name || c.guest_name || "Guest"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(c.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(c)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105 ${
                              c.status === "approved"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            }`}
                            title={`Click to ${
                              c.status === "approved"
                                ? "set pending"
                                : "approve"
                            }`}
                          >
                            {c.status === "approved" ? (
                              <CheckCircle size={12} />
                            ) : (
                              <XCircle size={12} />
                            )}
                            {c.status}
                          </button>

                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete comment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 text-gray-700">{c.comment}</p>
                    </div>
                  ))}

                  {commentsLoading && (
                    <div className="text-center py-3">
                      <Loader2 className="animate-spin inline" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewNewsDetails;
