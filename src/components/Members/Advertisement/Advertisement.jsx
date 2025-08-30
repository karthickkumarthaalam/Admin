import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import { Loader2, Search } from "lucide-react";
import BreadCrumb from "../../BreadCrum";
import { apiCall } from "../../../utils/apiCall";
import ViewAdvertisementModal from "./ViewAdvertisementModal";

const Advertisement = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedAd, setSelectedAd] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const pageSize = 50;

  const fetchAds = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/advertisement?page=${currentPage}&search=${searchQuery}&status=${status}`,
        "GET"
      );
      setAds(response.data);
      setTotalRecords(response.pagination.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [currentPage, searchQuery, status]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const statusCycle = {
    pending: "resolved",
    resolved: "closed",
    closed: "pending",
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    if (currentStatus === "closed") {
      toast.info(
        "This advertisement status is already closed and cannot be changed."
      );
      return;
    }
    if (!window.confirm("Are you Sure do you want to update the status?"))
      return;

    const newStatus = statusCycle[currentStatus];

    try {
      await apiCall(`/advertisement/${id}/status`, "PATCH", {
        status: newStatus,
      });
      toast.success("Status updated successfully");
      fetchAds();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <>
      <BreadCrumb
        title={"Advertisements"}
        paths={["Ads", "Advertisements List"]}
      />

      <div className="mt-4 rounded-sm shadow-md px-6 py-4 mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="flex justify-between items-center border-b border-dashed pb-3">
          <p className="text-lg font-semibold">Advertisements List</p>
        </div>

        <div className="flex justify-end mt-4 gap-3">
          <div className="w-48">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="relative w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search Advertisements..."
              onChange={(e) => handleSearch(e.target.value)}
              className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-8 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-red-500" size={32} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mt-4">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="py-2 px-4 border">SI</th>
                    <th className="py-2 px-4 border">Company</th>
                    <th className="py-2 px-4 border">Contact Person</th>
                    <th className="py-2 px-4 border">Email</th>
                    <th className="py-2 px-4 border">Phone</th>
                    <th className="py-2 px-4 border">Status</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-6 text-gray-500"
                      >
                        No advertisements available
                      </td>
                    </tr>
                  ) : (
                    ads.map((ad, index) => (
                      <tr key={ad.id}>
                        <td className="py-2 px-4 border">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-2 px-4 border">{ad.company_name}</td>
                        <td className="py-2 px-4 border">
                          {ad.contact_person}
                        </td>
                        <td className="py-2 px-4 border">{ad.email}</td>
                        <td className="py-2 px-4 border">{ad.phone}</td>
                        <td className="py-2 px-4 border capitalize">
                          <button
                            onClick={() => handleStatusUpdate(ad.id, ad.status)}
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold
                                ${
                                  ad.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : ad.status === "resolved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                          >
                            {ad.status}
                          </button>
                        </td>
                        <td className="py-2 px-4 border space-x-2">
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() => {
                              setSelectedAd(ad);
                              setIsViewModalOpen(true);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        <ViewAdvertisementModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          advertisement={selectedAd}
          onSuccess={() => {
            fetchAds();
            setIsViewModalOpen(false);
          }}
        />
      </div>
    </>
  );
};

export default Advertisement;
