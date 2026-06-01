import React, { useState, useEffect } from "react";
import {
  BadgePlus,
  Search,
  Loader2,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import BreadCrumb from "../../../components/BreadCrum";
import { usePermission } from "../../../context/PermissionContext";
import { useAuth } from "../../../context/AuthContext";
import AddFlashNews from "./AddFlashNews";
import Pagination from "../../Pagination";

const FlashNews = () => {
  const [flashNews, setFlashNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  const { hasPermission } = usePermission();
  const { user } = useAuth();

  const pageSize = 20;

  const fetchFlashNews = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/flash-news?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`,
        "GET",
      );
      setFlashNews(response.data);
      setTotalRecords(response.pagination?.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch flash news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashNews();
  }, [currentPage, searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this flash news?")) return;

    setLoading(true);
    try {
      await apiCall(`/flash-news/${id}`, "DELETE");
      toast.success("Deleted successfully");
      fetchFlashNews();
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (item) => {
    if (!window.confirm("Are you sure you want to update the status?")) return;

    const newStatus = item.status === "active" ? "in-active" : "active";

    try {
      await apiCall(`/flash-news/${item.id}/status`, "PATCH", {
        status: newStatus,
      });
      fetchFlashNews();
    } catch {
      toast.error("Status update failed");
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title="Flash News Management"
          paths={["Programs", "Flash News"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-lg font-semibold">Flash News</h2>

            {hasPermission("Flash News", "create") && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
              >
                <BadgePlus size={16} />
                Add News
              </button>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <div className="relative w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search news..."
                onChange={(e) => handleSearch(e.target.value)}
                className="border px-8 py-2 rounded w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                {/* Header */}
                <thead className="bg-gray-700 text-gray-50 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="p-4 text-left w-10">#</th>
                    <th className="p-4 text-left">Flash News</th>
                    <th className="p-4 text-left">Contents</th>
                    <th className="p-4 text-left">Programs</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left w-28">Actions</th>
                  </tr>
                </thead>

                {/* Body */}
                <tbody className="divide-y">
                  {flashNews.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-10 text-gray-400"
                      >
                        No flash news found
                      </td>
                    </tr>
                  ) : (
                    flashNews.map((item, index) => {
                      const activeCount =
                        item.items?.filter((i) => i.status === "active")
                          .length || 0;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 transition-all duration-150"
                        >
                          {/* SI */}
                          <td className="p-4 text-gray-500">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>

                          {/* Title */}
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800">
                                {item.title}
                              </span>
                              <span className="text-xs text-gray-400">
                                {activeCount} active items
                              </span>
                            </div>
                          </td>

                          {/* Contents */}
                          <td className="p-4">
                            <div className="flex flex-col gap-1 max-w-[220px]">
                              {item.items?.slice(0, 2).map((news) => (
                                <div
                                  key={news.id}
                                  className={`flex items-center justify-between px-2 py-1 rounded-md text-xs ${
                                    news.status === "active"
                                      ? "bg-green-50 text-green-700"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  <span className="truncate">
                                    {news.content}
                                  </span>
                                  <span className="ml-2">
                                    {news.status === "active" ? "●" : "○"}
                                  </span>
                                </div>
                              ))}

                              {item.items?.length > 2 && (
                                <span className="text-[11px] text-gray-400">
                                  +{item.items.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Programs */}
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {item.categories?.slice(0, 2).map((cat) => (
                                <span
                                  key={cat.id}
                                  className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs"
                                >
                                  {cat.category}
                                </span>
                              ))}

                              {item.categories?.length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{item.categories.length - 2}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <button
                              onClick={() => handleStatusToggle(item)}
                              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border transition ${
                                item.status === "active"
                                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                  : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              }`}
                            >
                              {item.status === "active" ? (
                                <CheckCircle size={14} />
                              ) : (
                                <XCircle size={14} />
                              )}
                              {item.status}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {hasPermission("Flash News", "update") && (
                                <button
                                  onClick={() => {
                                    setSelectedNews(item);
                                    setShowModal(true);
                                  }}
                                  className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                                >
                                  <Edit size={14} />
                                </button>
                              )}

                              {hasPermission("Flash News", "delete") && (
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <AddFlashNews
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedNews(null);
        }}
        flashNews={selectedNews}
        onSuccess={() => {
          setShowModal(false);
          setSelectedNews(null);
          fetchFlashNews();
        }}
      />
    </div>
  );
};

export default FlashNews;
