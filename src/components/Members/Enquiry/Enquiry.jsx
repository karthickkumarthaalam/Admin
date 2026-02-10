import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import { Loader2, Search } from "lucide-react";
import BreadCrumb from "../../BreadCrum";
import { apiCall } from "../../../utils/apiCall";
import ViewEnquiryModal from "./ViewEnquiryModal";

const Enquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const pageSize = 50;

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/enquiry?page=${currentPage}&search=${searchQuery}&status=${status}`,
        "GET",
      );
      setEnquiries(response.data);
      setTotalRecords(response.pagination.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
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
    if (
      !window.confirm(
        "Are you sure you want to change the status of this enquiry?",
      )
    ) {
      return;
    }

    if (currentStatus === "closed") {
      toast.info("This enquiry is already closed and cannot be changed.");
      return;
    }

    const newStatus = statusCycle[currentStatus];

    try {
      await apiCall(`/enquiry/${id}/status`, "PATCH", { status: newStatus });
      toast.success("Status updated successfully");
      fetchEnquiries();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <>
      <BreadCrumb title={"Enquiries"} paths={["Members", "Enquiries List"]} />

      <div className="mt-4 rounded-sm shadow-md px-6 py-4 mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="flex justify-between items-center border-b border-dashed pb-3">
          <p className="text-lg font-semibold">Enquiries List</p>
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
              placeholder="Search Enquiries..."
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
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm ">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b">Name</th>
                    <th className="py-3 px-4 border-b">Email</th>
                    <th className="py-3 px-4 border-b">Phone</th>
                    <th className="py-3 px-4 border-b">Subject</th>
                    <th className="py-3 px-4 border-b">Status</th>
                    <th className="py-3 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-6 text-gray-500"
                      >
                        No enquiries available
                      </td>
                    </tr>
                  ) : (
                    enquiries.map((enquiry, index) => (
                      <tr key={enquiry.id}>
                        <td className="py-3 px-4 border-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-3 px-4 border-b">{enquiry.name}</td>
                        <td className="py-3 px-4 border-b">{enquiry.email}</td>
                        <td className="py-3 px-4 border-b">{enquiry.phone}</td>
                        <td className="py-3 px-4 border-b">
                          {enquiry.subject}
                        </td>
                        <td className="py-3 px-4 border-b capitalize">
                          {
                            <button
                              onClick={() =>
                                handleStatusUpdate(enquiry.id, enquiry.status)
                              }
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold
                                  ${
                                    enquiry.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : enquiry.status === "resolved"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-200 text-gray-700"
                                  }`}
                            >
                              {enquiry.status}
                            </button>
                          }
                        </td>
                        <td className="py-3 px-4 border-b space-x-2">
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={() => {
                              setSelectedEnquiry(enquiry);
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

        <ViewEnquiryModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          enquiry={selectedEnquiry}
          onSuccess={() => {
            fetchEnquiries();
            setIsViewModalOpen(false);
          }}
        />
      </div>
    </>
  );
};

export default Enquiry;
