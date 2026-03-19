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
            <div className="mt-6 overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="p-3 w-10 text-left">SI</th>
                    <th className="p-3 w-40 text-left">Title</th>
                    <th className="p-3 w-64 text-left ">Content</th>
                    <th className="p-3">Programs</th>
                    <th className="p-3 w-16 text-left">Status</th>
                    <th className="p-3 w-24 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {flashNews.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-6">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    flashNews.map((item, index) => (
                      <tr key={item.id}>
                        <td className="p-3 border-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>

                        <td className="p-3 font-semibold w-40 max-w-[10rem] truncate border-b">
                          {item.title}
                        </td>

                        <td className="p-3 w-64 max-w-[16rem] truncate border-b">
                          {item.news_content}
                        </td>

                        <td className="p-3 w-80 max-w-[24rem] truncate border-b">
                          <div className="flex flex-wrap gap-1">
                            {item.categories?.map((cat) => (
                              <span
                                key={cat.id}
                                className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                              >
                                {cat.category}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-3 border-b align-center">
                          <button
                            onClick={() => {
                              handleStatusToggle(item);
                            }}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 shadow-sm hover:shadow-md ${
                              item.status === "active"
                                ? "text-green-700 border-green-300 bg-green-50 hover:bg-green-100"
                                : "text-red-700 border-red-300 bg-red-50 hover:bg-red-100"
                            }`}
                          >
                            {item.status === "active" ? (
                              <>
                                <CheckCircle size={14} />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle size={14} />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>

                        <td className="p-3 border-b">
                          <div className="flex items-center  gap-2 h-full">
                            {hasPermission("Flash News", "update") && (
                              <button
                                onClick={() => {
                                  setSelectedNews(item);
                                  setShowModal(true);
                                }}
                                className="p-2 bg-blue-50 text-blue-600 rounded"
                              >
                                <Edit size={14} />
                              </button>
                            )}

                            {hasPermission("Flash News", "delete") && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-50 text-red-600 rounded"
                              >
                                <Trash2 size={14} />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded"
              >
                Prev
              </button>

              <span>
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <AddFlashNews
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
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
