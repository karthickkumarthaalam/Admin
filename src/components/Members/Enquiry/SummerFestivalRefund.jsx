import React, { useEffect, useState } from "react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import BreadCrumb from "../../BreadCrum";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  ChartBar,
  Copy,
  Download,
  Loader,
  Loader2,
  Search,
  WholeWord,
  X,
} from "lucide-react";
import Pagination from "../../Pagination";
import { exportSummerFestivalRefundPDF } from "../../../utils/exportSummerFestivalRefundPDF";

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
  const [ticketClass, setTicketClass] = useState("");
  const [exportType, setExportType] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [summary, setSummary] = useState({
    TOTAL_ENQUIRIES: 0,
    TOTAL_AMOUNT_COLLECTED: 0,
    PENDING_AMOUNT: 0,
    VERIFIED_AMOUNT: 0,
    REFUNDED_AMOUNT: 0,
  });

  const pageSize = 100;

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/summer-festival/refund?page=${currentPage}&limit=${pageSize}&search=${searchQuery}&status=${status}&ticket_class=${ticketClass}`,
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

  const fetchRefundSummary = async () => {
    try {
      const response = await apiCall("/summer-festival/refund-summary", "GET");

      setSummary(response.summary);
    } catch (error) {
      toast.error("Failed to fetch refund summary");
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [currentPage, searchQuery, status, ticketClass]);

  useEffect(() => {
    fetchRefundSummary();
  }, []);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const statusCycle = {
    pending: "verified",
    verified: "refunded",
    refunded: "pending",
  };

  const handleSummaryFilter = (selectedStatus) => {
    setCurrentPage(1);
    setStatus(selectedStatus);
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

  const handleExport = async (type) => {
    setExportLoading(true);
    try {
      const response = await apiCall(
        `/summer-festival/refund?page=1&limit=100000&search=${searchQuery}&status=${status}&ticket_class=${ticketClass}`,
        "GET",
      );

      const allData = response.data || [];

      if (!allData.length) {
        toast.info("No data available to export");
        return;
      }

      if (type === "excel") {
        await exportEmailsToExcel(allData);
      } else if (type === "pdf") {
        await exportSummerFestivalRefundPDF({
          reportData: allData,
          status,
          ticketClass,
        });
      }
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setExportLoading(false);
      setExportType("");
    }
  };

  const exportEmailsToExcel = async (allData) => {
    try {
      const emailData = allData.map((item, index) => {
        const totalAmount =
          item.Attendees?.reduce(
            (sum, attendee) => sum + (attendee.AMOUNT_COLLECTED || 0),
            0,
          ) || 0;

        const ticketClasses =
          item.Attendees?.map((a) => a.TICKET_CLASS).join(", ") || "";

        const ticketIds =
          item.Attendees?.map((a) => a.TICKET_ID).join(", ") || "";

        return {
          SI: index + 1,
          ORDER_ID: item.ORDER_ID,
          NAME: item.NAME,
          EMAIL: item.EMAIL_ID,
          PHONE: item.PHONE_NUMBER,
          COUNTRY: item.Attendees?.[0]?.COUNTRY || "",
          TICKETS: item.Attendees?.length || 0,
          TICKET_CLASSES: ticketClasses,
          TICKET_IDS: ticketIds,
          TOTAL_AMOUNT: totalAmount,
          STATUS: item.REFUNDED_STATUS,
          DECISION: item.REFUND_OR_CONTINUE,
          PAYMENT_MODE: item.PAYMENT_MODE || "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(emailData);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Refund Enquiries");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });

      saveAs(blob, `summer_festival_report_${Date.now()}.xlsx`);

      toast.success(`Exported ${allData.length} records`);
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setLoading(false);
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Side */}
          <p className="text-xs sm:text-sm text-gray-600">
            Showing{" "}
            {(currentPage - 1) * pageSize + (enquiries.length > 0 ? 1 : 0)} to{" "}
            {(currentPage - 1) * pageSize + enquiries.length} of {totalRecords}{" "}
            ({totalPages} {totalPages === 1 ? "page" : "pages"})
          </p>

          {/* Right Side */}
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
            {/* Export Button */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-sm hover:shadow-md hover:from-green-700 hover:to-green-800 transition-all duration-200"
              >
                {exportLoading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Export
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showExportMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showExportMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b bg-gray-50">
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        Export Options
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        handleExport("excel");
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                    >
                      <ChartBar />
                      <div className="text-left">
                        <p className="font-medium">Excel Report</p>
                        <p className="text-xs text-gray-500">
                          Download XLSX file
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        handleExport("pdf");
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition border-t"
                    >
                      <WholeWord />
                      <div className="text-left">
                        <p className="font-medium">PDF Report</p>
                        <p className="text-xs text-gray-500">
                          Download formatted PDF
                        </p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="w-full sm:w-48">
              <select
                value={ticketClass}
                onChange={(e) => {
                  setCurrentPage(1);
                  setTicketClass(e.target.value);
                }}
                className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
              >
                <option value="">All Tickets</option>
                <option value="Day 1">Day 1 Pass</option>
                <option value="Day 2">Day 2 Pass</option>
                <option value="Day 3">Day 3 Pass</option>
                <option value="3 Days Pass">All Day Pass</option>
              </select>
            </div>

            {/* Status Filter */}
            {/* <div className="w-full sm:w-44">
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
            </div> */}

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search Enquiries..."
                onChange={(e) => handleSearch(e.target.value)}
                className="border-2 border-gray-300 rounded-md text-xs sm:text-sm pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase">
              Total Enquiries
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">
              {summary.TOTAL_ENQUIRIES}
            </h2>
          </div>

          <div
            onClick={() => handleSummaryFilter("")}
            className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-blue-500 ${
              status === "" ? "border-blue-500 bg-blue-50" : ""
            }`}
          >
            <p className="text-xs text-gray-500 font-semibold uppercase">
              Total Collected
            </p>
            <h2 className="text-2xl font-bold text-blue-700 mt-2">
              CHF{" "}
              {summary.TOTAL_AMOUNT_COLLECTED?.toLocaleString("en-CH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>

          <div
            onClick={() => handleSummaryFilter("pending")}
            className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-yellow-500 ${
              status === "pending" ? "border-yellow-500 bg-yellow-50" : ""
            }`}
          >
            <p className="text-xs text-gray-500 font-semibold uppercase">
              Pending Amount
            </p>
            <h2 className="text-2xl font-bold text-yellow-600 mt-2">
              CHF{" "}
              {summary.PENDING_AMOUNT?.toLocaleString("en-CH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>

          <div
            onClick={() => handleSummaryFilter("verified")}
            className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-gray-600 ${
              status === "verified" ? "border-gray-600 bg-gray-50" : ""
            }`}
          >
            <p className="text-xs text-gray-500 font-semibold uppercase">
              Verified Amount
            </p>
            <h2 className="text-2xl font-bold text-gray-700 mt-2">
              CHF{" "}
              {summary.VERIFIED_AMOUNT?.toLocaleString("en-CH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>

          <div
            onClick={() => handleSummaryFilter("refunded")}
            className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-green-600 ${
              status === "refunded" ? "border-green-600 bg-green-50" : ""
            }`}
          >
            <p className="text-xs text-gray-500 font-semibold uppercase">
              Refunded Amount
            </p>
            <h2 className="text-2xl font-bold text-green-700 mt-2">
              CHF{" "}
              {summary.REFUNDED_AMOUNT?.toLocaleString("en-CH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-red-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-300 rounded-lg shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-700 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b">Customer Details</th>
                    <th className="py-3 px-4 border-b">Tickets</th>
                    <th className="py-3 px-4 border-b text-center">Country</th>
                    <th className="py-3 px-4 border-b">Total Amount</th>
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
                    enquiries.map((enquiry, index) => {
                      const totalAmount =
                        enquiry.Attendees?.reduce(
                          (sum, attendee) =>
                            sum + (attendee.AMOUNT_COLLECTED || 0),
                          0,
                        ) || 0;

                      const country = enquiry.Attendees?.[0]?.COUNTRY || "-";
                      return (
                        <tr
                          key={enquiry.id}
                          className="border-b border-gray-300"
                        >
                          <td className="py-3 px-4  ">
                            <div>
                              {(currentPage - 1) * pageSize + index + 1}
                            </div>
                          </td>

                          <td className="py-4 px-4 max-w-[280px]">
                            <div className="space-y-2">
                              <button
                                onClick={() => {
                                  setSelectedEnquiry(enquiry);
                                  setShowOrderDetails(true);
                                }}
                                className=" text-blue-700  text-xs font-semibold hover:text-blue-800 whitespace-nowrap"
                              >
                                Order #{enquiry.ORDER_ID}
                              </button>

                              <div>
                                <p className="font-semibold text-gray-900">
                                  {enquiry.NAME}
                                </p>

                                <p className="text-xs text-gray-600">
                                  {enquiry.EMAIL_ID}
                                </p>

                                <p className="text-xs text-gray-600">
                                  {enquiry.PHONE_NUMBER}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4  max-w-[260px]">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-2">
                                {enquiry.Attendees?.length} Ticket(s)
                              </p>

                              <div className="space-y-2">
                                {enquiry.Attendees?.map((ticket) => (
                                  <div key={ticket.TICKET_ID}>
                                    <div className="flex justify-between">
                                      <span className="font-medium text-gray-800 whitespace-nowrap">
                                        {ticket.TICKET_CLASS}
                                      </span>

                                      <span className="text-green-600 font-semibold whitespace-nowrap">
                                        CHF{" "}
                                        {ticket.AMOUNT_COLLECTED?.toLocaleString(
                                          "en-CH",
                                          {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          },
                                        )}
                                      </span>
                                    </div>

                                    <p className="text-xs text-gray-400">
                                      {ticket.TICKET_ID}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4  font-semibold text-center">
                            <p className="text-sm text-gray-700">{country}</p>
                          </td>

                          {/* Total Amount */}
                          <td className="py-3 px-4  font-bold text-sm text-green-600 whitespace-nowrap">
                            CHF{" "}
                            {totalAmount?.toLocaleString("en-CH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* Decision */}
                          <td className="py-3 px-4 font-semibold">
                            <p className="mb-1 text-gray-600">
                              {capitalizeStr(enquiry.REFUND_OR_CONTINUE)}
                            </p>

                            {enquiry.PAYMENT_MODE && (
                              <p className="whitespace-nowrap">
                                Payment Mode:{" "}
                                <span className="text-blue-600">
                                  {capitalizeStr(enquiry.PAYMENT_MODE)}
                                </span>
                              </p>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 ">
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

                          {/* Description */}
                          <td className="py-3 px-4 ">
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalRecords={totalRecords}
              onPageChange={setCurrentPage}
            />
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
