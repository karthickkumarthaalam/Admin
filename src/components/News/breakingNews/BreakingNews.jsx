import React, { useEffect, useState } from "react";
import {
  BadgePlus,
  Loader2,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";

import BreadCrumb from "../../../components/BreadCrum";
import Pagination from "../../Pagination";
import { apiCall } from "../../../utils/apiCall";
import { usePermission } from "../../../context/PermissionContext";
import AddBreakingNewsModal from "./AddBreakingNews";

const BreakingNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  const { hasPermission } = usePermission();

  const pageSize = 20;

  const fetchNews = async () => {
    setLoading(true);

    try {
      const res = await apiCall(
        `/breaking-news?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`,
        "GET",
      );

      setNews(res.data || []);
      setTotalRecords(res.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch breaking news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [currentPage, searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;

    try {
      setLoading(true);

      await apiCall(`/breaking-news/${id}`, "DELETE");

      toast.success("Breaking news deleted successfully");

      fetchNews();
    } catch (error) {
      toast.error("Failed to delete breaking news");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (item) => {
    try {
      setLoading(true);

      await apiCall(`/breaking-news/${item.id}`, "PUT", {
        is_active: !item.is_active,
      });

      toast.success("Status updated successfully");

      fetchNews();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"Breaking News Management"}
          paths={["News", "Breaking News"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {/* Header */}
          <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Breaking News
            </p>

            {hasPermission("News", "create") && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4  py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
              >
                <BadgePlus size={16} />
                <span>Add News</span>
              </button>
            )}
          </div>

          {/* Search */}
          <div className="flex justify-end mt-4">
            <div className="relative w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search News..."
                onChange={(e) => handleSearch(e.target.value)}
                className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-8 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-red-500" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b">Content</th>
                    <th className="py-3 px-4 border-b">URL</th>
                    <th className="py-3 px-4 border-b text-center">Date</th>
                    <th className="py-3 px-4 border-b ">Status</th>
                    <th className="py-3 px-4 border-b ">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {news.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-6 px-4 border text-center text-gray-500 text-sm"
                      >
                        No breaking news found.
                      </td>
                    </tr>
                  ) : (
                    news.map((item, index) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4 border-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>

                        <td className="py-3 px-4 border-b min-w-[260px] max-w-[420px]">
                          <p className="font-semibold">{item.content}</p>
                        </td>

                        <td className="py-3 px-4 border-b whitespace-nowrap">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              Open Link
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="py-3 px-4 border-b ">
                          <div className="flex flex-col  items-center gap-2 max-w-[260px]">
                            {/* Start Date */}
                            <div className="flex items-center gap-4">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700 whitespace-nowrap">
                                Start Date :
                              </p>

                              <p className="text-xs font-medium text-gray-700 whitespace-nowrap">
                                {item.start_date
                                  ? new Date(item.start_date).toLocaleString()
                                  : "-"}
                              </p>
                            </div>

                            {/* End Date */}
                            <div className="flex gap-4 items-center">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-700 whitespace-nowrap">
                                End Date :
                              </p>

                              <p className="text-xs font-medium text-gray-700 whitespace-nowrap">
                                {item.end_date
                                  ? new Date(item.end_date).toLocaleString()
                                  : "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 border-b ">
                          <button
                            onClick={() => handleStatusToggle(item)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 shadow-sm hover:shadow-md ${
                              item.is_active
                                ? "text-green-700 border-green-300 bg-green-50 hover:bg-green-100"
                                : "text-red-700 border-red-300 bg-red-50 hover:bg-red-100"
                            }`}
                          >
                            {item.is_active ? (
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

                        <td className="py-3 px-4 border-b ">
                          <div className="flex items-center gap-2">
                            {hasPermission("News", "update") && (
                              <button
                                onClick={() => {
                                  setShowModal(true);
                                  setSelectedNews(item);
                                }}
                                className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-md"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                            )}

                            {hasPermission("News", "delete") && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-md"
                                title="Delete"
                              >
                                <Trash2 size={16} />
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <AddBreakingNewsModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedNews(null);
        }}
        onSuccess={() => {
          setShowModal(false);
          fetchNews();
        }}
        editNewsData={selectedNews}
      />
    </div>
  );
};

export default BreakingNews;
