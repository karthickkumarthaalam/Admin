import React, { useEffect, useState } from "react";
import {
  BadgePlus,
  Loader2,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";

import debounce from "lodash.debounce";
import { toast } from "react-toastify";

import BreadCrumb from "../../../components/BreadCrum";
import Pagination from "../../Pagination";
import { apiCall } from "../../../utils/apiCall";
import { usePermission } from "../../../context/PermissionContext";

import AddAdvertisementModal from "./AddAdvertisementModal";

const Advertisement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [totalRecords, setTotalRecords] = useState(0);

  const [showModal, setShowModal] = useState(false);

  const [selectedAdvertisement, setSelectedAdvertisement] = useState(null);

  const { hasPermission } = usePermission();

  const pageSize = 20;

  // ─────────────────────────────────────────────
  // Fetch Advertisements
  // ─────────────────────────────────────────────
  const fetchAdvertisements = async () => {
    setLoading(true);

    try {
      const res = await apiCall(
        `/news-advertisement?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`,
        "GET",
      );

      setAdvertisements(res.data || []);
      setTotalRecords(res.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, [currentPage, searchQuery]);

  // ─────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────
  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  // ─────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this advertisement?"))
      return;

    try {
      setLoading(true);

      await apiCall(`/news-advertisement/${id}`, "DELETE");

      toast.success("Advertisement deleted successfully");

      fetchAdvertisements();
    } catch (error) {
      toast.error("Failed to delete advertisement");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Status Toggle
  // ─────────────────────────────────────────────
  const handleStatusToggle = async (item) => {
    if (
      !window.confirm(
        "Are you sure you want to update status of this advertisement?",
      )
    )
      return;

    try {
      setLoading(true);

      await apiCall(`/news-advertisement/status/${item.id}`, "PATCH", {
        is_active: !item.is_active,
      });

      toast.success("Status updated successfully");

      fetchAdvertisements();
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
          title={"Advertisement Management"}
          paths={["News", "Advertisement"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {/* Header */}
          <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Advertisement
            </p>

            {hasPermission("News Advertisements", "create") && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
              >
                <BadgePlus size={16} />
                <span>Add Advertisement</span>
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
                placeholder="Search Advertisement..."
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

                    <th className="py-3 px-4 border-b text-center">
                      Advertisement
                    </th>

                    <th className="py-3 px-4 border-b ">Date</th>

                    <th className="py-3 px-4 border-b">Status</th>

                    <th className="py-3 px-4 border-b">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {advertisements.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="py-6 px-4 border text-center text-gray-500 text-sm"
                      >
                        No advertisements found.
                      </td>
                    </tr>
                  ) : (
                    advertisements.map((item, index) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4 border-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>

                        {/* Advertisement */}
                        <td className="py-3 px-4 border-b min-w-[480px]">
                          <div className="flex  gap-3">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.headline}
                                className="w-24 h-16 rounded-md object-cover border"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-md border flex items-center justify-center bg-gray-100">
                                <ImageIcon
                                  size={18}
                                  className="text-gray-400"
                                />
                              </div>
                            )}

                            <div>
                              <p className="font-semibold text-gray-800 line-clamp-1">
                                {item.headline}
                              </p>

                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {item.sub || "-"}
                              </p>

                              <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                                {item.tag}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  item.size === "big"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {item.size}
                              </span>
                              <p className="mt-2 text-xs text-gray-700">
                                <span className="text-purple-600 font-semibold">
                                  Button Text :
                                </span>{" "}
                                {item.cta || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Start Date */}
                        <td className="py-3 px-4 border-b ">
                          <div className="flex flex-col items-start gap-2 max-w-[260px]">
                            {/* Start Date */}
                            <div className="flex items-center gap-4">
                              <p className="text-[10px] font-semibold whitespace-nowrap uppercase tracking-wide text-green-700">
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
                              <p className="text-[10px] font-semibold whitespace-nowrap uppercase tracking-wide text-red-700">
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

                        {/* Status */}
                        <td className="py-3 px-4 border-b">
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

                        {/* Actions */}
                        <td className="py-3 px-4 border-b">
                          <div className="flex items-center gap-2">
                            {hasPermission("News Advertisements", "update") && (
                              <button
                                onClick={() => {
                                  setShowModal(true);
                                  setSelectedAdvertisement(item);
                                }}
                                className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-md"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                            )}

                            {hasPermission("News Advertisements", "delete") && (
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

      {/* Modal */}
      <AddAdvertisementModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedAdvertisement(null);
        }}
        onSuccess={() => {
          setShowModal(false);
          fetchAdvertisements();
        }}
        editAdvertisementData={selectedAdvertisement}
      />
    </div>
  );
};

export default Advertisement;
