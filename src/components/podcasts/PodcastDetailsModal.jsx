import React, { useCallback, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../utils/apiCall";
import {
  Podcast,
  X,
  MessageSquare,
  Eye,
  ThumbsUp,
  Share2,
  Calendar,
  Tag,
  Globe,
  User,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const PodcastDetailsModal = ({ isOpen, onClose, podcast }) => {
  const [stats, setStats] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [totalComments, setTotalComments] = useState(0);
  const detailsContainerRef = useRef(null);
  const commentsContainerRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    tags: true,
    languages: true,
  });

  const comments_per_page = 20;

  useEffect(() => {
    if (isOpen && podcast?.id) {
      setComments([]);
      setCommentsPage(1);
      setHasMoreComments(true);
      fetchDetails();
    }
  }, [isOpen, podcast?.id]);

  useEffect(() => {
    if (isOpen && podcast?.id && commentsPage > 1) {
      fetchComments();
    }
  }, [commentsPage]);

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
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [statRes, commentRes] = await Promise.all([
        apiCall(`/podcast-analytics/${podcast.id}`),
        apiCall(
          `/podcasts/${podcast.id}/comments?page=1&limit=${comments_per_page}`,
        ),
      ]);

      setStats(statRes.data);
      setComments(commentRes.result.data || []);
      setTotalComments(commentRes.result.pagination?.totalRecords || 0);
      setHasMoreComments(
        commentRes.result.pagination?.currentPage <
          commentRes.result.pagination?.totalPages,
      );
    } catch (error) {
      toast.error("Failed to load podcast details");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (commentsLoading || !hasMoreComments) return;

    setCommentsLoading(true);
    try {
      const commentRes = await apiCall(
        `/podcasts/${podcast.id}/comments?page=${commentsPage}&limit=${comments_per_page}`,
      );
      const newComments = commentRes.result.data || [];
      setComments((prev) => [...prev, ...newComments]);
      setHasMoreComments(
        commentRes.result.pagination?.currentPage <
          commentRes.result.pagination?.totalPages,
      );
    } catch (error) {
      toast.error("Failed to load more comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleStatusChange = async (comment) => {
    if (
      !window.confirm(
        "Are you sure you want to change the status of this comment?",
      )
    )
      return;

    const newStatus = comment.status === "approved" ? "pending" : "approved";
    try {
      await apiCall(`/podcasts/comments/${comment.id}/status`, "PATCH", {
        status: newStatus,
      });

      // Update comment locally
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id ? { ...c, status: newStatus } : c,
        ),
      );

      toast.success(
        `Comment ${newStatus === "approved" ? "approved" : "set to pending"} successfully`,
      );
    } catch (error) {
      toast.error("Failed to update comment status");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await apiCall(`/podcasts/${commentId}/comments`, "DELETE");

      // Remove comment locally
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotalComments((prev) => prev - 1);

      toast.success("Comment deleted successfully");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 flex lg:items-center justify-center z-[200] p-4 backdrop-blur-md transition-all duration-300"
    >
      <div className="bg-white md:rounded-xl shadow-xl w-full h-full overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="sticky top-0 z-30 flex justify-between items-center border-b border-gray-200 bg-white/90 backdrop-blur px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Podcast className="text-indigo-600" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              PODCAST DETAILS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            aria-label="Close Modal"
          >
            <X
              size={24}
              className="text-gray-600 group-hover:text-red-600 transition-colors duration-200"
            />
          </button>
        </div>

        {/* Main Content - Side by Side */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden scrollbar-hide">
          {/* Left Side - Podcast Details */}
          <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col ">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Podcast Information
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Complete details about this podcast episode
              </p>
            </div>

            <div
              ref={detailsContainerRef}
              className="flex-1 overflow-visible lg:overflow-y-auto overscroll-contain scrollbar-hide p-6"
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Podcast Cover Image */}
                  <div className="relative rounded-xl overflow-hidden shadow-lg aspect-video ">
                    <img
                      src={
                        podcast.image_url
                          ? podcast.image_url
                          : `${window.location.origin}/A8J3K9Z5QW/podcast-banner.jpg`
                      }
                      alt={podcast.title}
                      className="w-full h-auto object-cover rounded-xl"
                    />
                  </div>

                  {/* Title and Basic Info */}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                      {podcast.title}
                    </h1>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
                        <Calendar size={14} />
                        <span className="text-sm font-medium">
                          {formatDate(podcast.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg">
                        <User size={14} />
                        <span className="text-sm font-medium">
                          RJ: {podcast.rjname || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg">
                        <Tag size={14} />
                        <span className="text-sm font-medium">
                          {podcast.category?.name || "Uncategorized"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  {stats && (
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-5 border border-indigo-100">
                      <h3 className="text-sm font-semibold text-gray-700 mb-4 tracking-wide">
                        PODCAST ANALYTICS
                      </h3>

                      <div className="grid grid-cols-3 gap-3">
                        {/* Plays */}
                        <div className=" overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                          <div className="relative flex flex-col items-center">
                            <Eye size={18} className="text-blue-600 mb-1" />
                            <span className="text-2xl font-bold text-gray-900">
                              {stats.play_count ?? 0}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">Plays</p>
                          </div>
                        </div>

                        {/* Likes */}
                        <div className=" overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                          <div className="relative flex flex-col items-center">
                            <ThumbsUp
                              size={18}
                              className="text-green-600 mb-1"
                            />
                            <span className="text-2xl font-bold text-gray-900">
                              {stats.like_count ?? 0}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">Likes</p>
                          </div>
                        </div>

                        {/* Shares */}
                        <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                          <div className="  flex flex-col items-center">
                            <Share2
                              size={18}
                              className="text-purple-600 mb-1"
                            />
                            <span className="text-2xl font-bold text-gray-900">
                              {stats.shares_count ?? 0}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">Shares</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description Section */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection("description")}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-gray-600" />
                        <span className="font-semibold text-gray-900">
                          Description
                        </span>
                      </div>
                      {expandedSections.description ? (
                        <ChevronUp size={16} className="text-gray-600" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-600" />
                      )}
                    </button>
                    {expandedSections.description && (
                      <div className="p-4">
                        <div
                          className="text-gray-700 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: podcast.description,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Tags Section */}
                  {podcast.tags && podcast.tags.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection("tags")}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-gray-600" />
                          <span className="font-semibold text-gray-900">
                            Tags ({podcast.tags.length})
                          </span>
                        </div>
                        {expandedSections.tags ? (
                          <ChevronUp size={16} className="text-gray-600" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-600" />
                        )}
                      </button>
                      {expandedSections.tags && (
                        <div className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {podcast.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Comments */}
          <div className="w-full lg:w-3/5 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
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
                      {totalComments} total comments • Auto-loads on scroll
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
              className="flex-1 overflow-visible lg:overflow-y-auto p-6 bg-gradient-to-b from-gray-50/30 to-white scrollbar-hide"
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
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
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`bg-white rounded-xl border p-3 md:p-4 hover:shadow-md transition-all duration-200 ${
                        comment.status === "approved"
                          ? "border-green-100"
                          : "border-yellow-100"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              comment.Member
                                ? "bg-gradient-to-br from-indigo-100 to-purple-100"
                                : "bg-gradient-to-br from-gray-100 to-gray-200"
                            }`}
                          >
                            <User
                              size={20}
                              className={
                                comment.Member
                                  ? "text-indigo-600"
                                  : "text-gray-600"
                              }
                            />
                          </div>
                          <div>
                            <div className="flex items-start gap-2">
                              <h4 className="font-semibold text-gray-900">
                                {comment.Member?.name ||
                                  comment.guest_name ||
                                  "Guest User"}
                              </h4>
                              {comment.Member ? (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full">
                                  Member
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                  Guest
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(comment)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105 ${
                              comment.status === "approved"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            }`}
                            title={`Click to ${
                              comment.status === "approved"
                                ? "set pending"
                                : "approve"
                            }`}
                          >
                            {comment.status === "approved" ? (
                              <CheckCircle size={12} />
                            ) : (
                              <XCircle size={12} />
                            )}
                            {comment.status}
                          </button>

                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete comment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="ml-13">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                        {comment.guest_email && (
                          <p className="text-xs text-gray-500 mt-2">
                            Email: {comment.guest_email}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {commentsLoading && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center gap-2">
                        <Loader2
                          className="animate-spin text-indigo-600"
                          size={20}
                        />
                        <span className="text-gray-600 text-sm">
                          Loading more comments...
                        </span>
                      </div>
                    </div>
                  )}

                  {!hasMoreComments && comments.length > 0 && (
                    <div className="text-center py-4">
                      <div className="inline-block px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg">
                        All comments loaded
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastDetailsModal;
