import React, { useEffect, useState } from "react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import BreadCrumb from "../../BreadCrum";
import { Copy, Loader2, Search, X } from "lucide-react";

const SummerFestivalRefund = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const pageSize = 50;

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/summer-festival/refund?page=${currentPage}&limit=${pageSize}&search=${searchQuery}&status=${status}`,
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
    pending: "verified",
    verified: "refunded",
    refunded: "pending",
  };

  const handleStatusChange = async (id, currentStatus) => {
    if (!window.confirm("Are you sure you want to update status change"))
      return;

    if (currentStatus === "refunded") {
      toast.info("Ticket is already refunded and cannot be changed.");
      return;
    }

    const newStatus = statusCycle[currentStatus];
    try {
      await apiCall(`/summer-festival/refund-status/${id}`, "PATCH", {
        REFUNDED_STATUS: newStatus,
      });
      toast.success(`Status updated to ${newStatus}`);
      setEnquiries((prev) =>
        prev.map((enquiry) =>
          enquiry.id === id
            ? { ...enquiry, REFUNDED_STATUS: newStatus }
            : enquiry,
        ),
      );
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const capitalizeStr = (str) => {
    if (!str) {
      return;
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <>
      <BreadCrumb
        title={"Summer Festival Refund"}
        paths={["Summer Festival", "Refund Enquiries"]}
      />
      <div className="mt-4 rounded-sm shadow-md px-6 py-4 mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-center ">
          <p className="text-xs sm:text-sm text-gray-600">
            Showing{" "}
            {(currentPage - 1) * pageSize + (enquiries.length > 0 ? 1 : 0)} to{" "}
            {(currentPage - 1) * pageSize + enquiries.length} of {totalRecords}{" "}
            ({totalPages} {totalPages === 1 ? "page" : "pages"})
          </p>

          <div className="flex justify-end mt-4 gap-3">
            <div className="w-48">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="refunded">Refunded</option>
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-red-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-700 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b">ORDER ID</th>
                    <th className="py-3 px-4 border-b">Name</th>
                    <th className="py-3 px-4 border-b">Email</th>
                    <th className="py-3 px-4 border-b">Phone</th>
                    <th className="py-3 px-4 border-b">Decision</th>
                    <th className="py-3 px-4 border-b">Status</th>
                    <th className="py-3 px-4 border-b">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center text-gray-500 py-6 text-sm md:text-lg"
                      >
                        No Enquiries Found
                      </td>
                    </tr>
                  ) : (
                    enquiries.map((enquiry, index) => (
                      <tr key={enquiry.id}>
                        <td className="py-3 px-4 border-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-3 px-4 border-b">
                          <button
                            className="text-blue-800 bg-blue-50 rounded-full px-2 py-0.5 text-sm font-medium"
                            onClick={() => {
                              setSelectedEnquiry(enquiry);
                              setShowOrderDetails(true);
                            }}
                          >
                            {enquiry.ORDER_ID}
                          </button>
                        </td>
                        <td className="py-3 px-4 border-b">{enquiry.NAME}</td>
                        <td className="py-3 px-4 border-b">
                          {enquiry.EMAIL_ID}
                        </td>
                        <td className="py-3 px-4 border-b whitespace-nowrap">
                          {enquiry.PHONE_NUMBER}
                        </td>
                        <td className="py-3 px-4 border-b font-semibold">
                          <p className="mb-1 text-gray-600">
                            {capitalizeStr(enquiry.REFUND_OR_CONTINUE)}
                          </p>
                          {enquiry.PAYMENT_MODE ? (
                            <p className="whitespace-nowrap">
                              Payment Mode:{" "}
                              <span className="text-blue-600">
                                {capitalizeStr(enquiry.PAYMENT_MODE)}
                              </span>
                            </p>
                          ) : (
                            ""
                          )}
                        </td>
                        <td className="py-3 px-4 border-b">
                          <button
                            onClick={() => {
                              handleStatusChange(
                                enquiry.id,
                                enquiry.REFUNDED_STATUS,
                              );
                            }}
                            className={`text-xs px-2.5 py-1 border rounded-lg font-semibold ${
                              enquiry.REFUNDED_STATUS === "pending"
                                ? "bg-yellow-50 text-yellow-600 border-yellow-500"
                                : enquiry.REFUNDED_STATUS === "refunded"
                                  ? "bg-green-50 text-green-600 border-green-500"
                                  : "bg-gray-50 text-gray-700 border-gray-500"
                            }`}
                          >
                            {capitalizeStr(enquiry.REFUNDED_STATUS)}
                          </button>
                        </td>
                        <td className="py-3 px-4 border-b">
                          <button
                            onClick={() => {
                              setSelectedEnquiry(enquiry);
                              setShowDescription(true);
                            }}
                            className="text-xs text-blue-700 hover:underline bg-blue-50 rounded-full items-center inline-flex px-2 py-0.5 font-medium"
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
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="text-sm px-3 py-1.5 rounded border hover:bg-gray-100 disabled:opacity-50"
                >
                  {" "}
                  Previous
                </button>
                <span className="text-sm font-medium">
                  page {currentPage} of {totalPages}
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
          </>
        )}
      </div>
      <DescriptionModal
        isOpen={showDescription}
        enquiry={selectedEnquiry}
        onClose={() => setShowDescription(false)}
      />
      <OrderDetailsModal
        isOpen={showOrderDetails}
        enquiry={selectedEnquiry}
        onClose={() => setShowOrderDetails(false)}
      />
    </>
  );
};

const DescriptionModal = ({ isOpen, enquiry, onClose }) => {
  if (!isOpen || !enquiry) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-100 sticky top-0">
          <h2 className="text-lg font-semibold text-gray-800">
            Refund Description
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 space-y-5">
          {/* Order ID */}
          <p className="text-sm text-gray-800 font-semibold">
            ORDER ID: <span className="text-blue-700 ">{enquiry.ORDER_ID}</span>
          </p>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Ticket Description
            </h3>
            <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {enquiry?.TICKET_DESCRIPTION || (
                <span className="italic text-gray-400">
                  No description available.
                </span>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              enquiry?.PAYMENT_MODE && {
                label: "Payment Mode",
                value: enquiry.PAYMENT_MODE,
              },
              enquiry?.TWINT_ACCOUNT && {
                label: "Twint Account",
                value: enquiry.TWINT_ACCOUNT,
                copy: true,
              },
              enquiry?.USER_IP && {
                label: "User IP Address",
                value: enquiry.USER_IP,
                copy: true,
                breakAll: true,
              },
              enquiry?.USER_CITY && {
                label: "User City",
                value: enquiry.USER_CITY,
              },
            ]
              .filter(Boolean)
              .map(({ label, value, copy, breakAll }, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-gray-50 to-white border rounded-xl p-4 flex justify-between items-start gap-3 hover:shadow-sm transition"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                      {label}
                    </p>
                    <p
                      className={`text-sm font-semibold text-gray-800 ${
                        breakAll ? "break-all" : ""
                      }`}
                    >
                      {value}
                    </p>
                  </div>

                  {copy && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(value);
                        toast.success(`${label} copied`);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 transition"
                      title="Copy"
                    >
                      <Copy size={16} />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md bg-slate-200 hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderDetailsModal = ({ isOpen, enquiry, onClose }) => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---- Fetch Order Details ----
  const fetchOrderDetails = async () => {
    if (!enquiry?.ORDER_ID) return;
    setLoading(true);

    try {
      const response = await apiCall(
        `/summer-festival/attendee/${enquiry.ORDER_ID}`,
      );

      const attendees = response?.attendees || [];
      setOrderDetails(attendees);
    } catch (error) {
      toast.error("Failed to fetch order details");
      setOrderDetails([]);
    } finally {
      setLoading(false);
    }
  };

  // ---- Run on modal open ----
  useEffect(() => {
    if (isOpen && enquiry?.ORDER_ID) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, enquiry?.ORDER_ID]);

  if (!isOpen) return null;

  // ---- Derived values ----
  const totalTickets = orderDetails.length;
  const totalAmount = orderDetails.reduce(
    (sum, item) => sum + (parseFloat(item?.AMOUNT_COLLECTED) || 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-100 sticky top-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Order Details
            </h2>
            <p className="text-xs text-gray-500">
              ORDER ID:{" "}
              <span className="font-semibold text-blue-700">
                {enquiry?.ORDER_ID}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading order details...</p>
          ) : orderDetails.length > 0 ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gradient-to-br from-gray-50 to-white border rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    Total Tickets
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {totalTickets}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white border rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    Total Amount Collected
                  </p>
                  <p className="text-lg font-bold text-green-700">
                    CHF {totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Tickets Table */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Tickets
                </h3>

                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-4 py-2 border-b text-left">
                          Ticket ID
                        </th>
                        <th className="px-4 py-2 border-b text-left">
                          Ticket Class
                        </th>
                        <th className="px-4 py-2 border-b text-left">Name</th>
                        <th className="px-4 py-2 border-b text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.map((ticket) => (
                        <tr
                          key={ticket?.TICKET_ID}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-2 border-b font-medium text-gray-800">
                            {ticket?.TICKET_ID}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {ticket?.TICKET_CLASS}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {ticket?.FIRST_NAME}
                          </td>
                          <td className="px-4 py-2 border-b text-right font-semibold">
                            CHF {ticket?.AMOUNT_COLLECTED}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No order details found.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md bg-slate-200 hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummerFestivalRefund;
