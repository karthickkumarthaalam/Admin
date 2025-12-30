import React, { useEffect, useState } from "react";
import { usePermission } from "../../../../context/PermissionContext";
import { toast } from "react-toastify";
import { apiCall } from "../../../../utils/apiCall";
import debounce from "lodash.debounce";
import BreadCrumb from "../../../BreadCrum";
import {
  BadgePlus,
  Loader2,
  Pencil,
  Trash2,
  FileText,
  Search,
  EyeOff,
  Eye,
} from "lucide-react";
import { AddPayslip } from "./AddPayslip";
import ViewPayslipModal from "./ViewPayslipModal";
import { useAuth } from "../../../../context/AuthContext";

const PayslipComponent = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editPayslipData, setEditPayslipData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [monthFilter, setMonthFilter] = useState("");
  const [viewPayslipData, setViewPayslipData] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false); // New state for toggle

  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const pageSize = 50;

  const fetchingPayslips = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/payslip?page=${currentPage}&limit=${pageSize}&search=${searchQuery}&month=${monthFilter}&show_deleted=${showDeleted}`,
        "GET"
      );
      setPayslips(response.data || []);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch payslip");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  useEffect(() => {
    fetchingPayslips();
  }, [currentPage, searchQuery, monthFilter, showDeleted]); // Added showDeleted to dependencies

  const handleAddPaySlip = () => {
    setEditPayslipData(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditPayslipData(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Payslip?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/payslip/${id}`, "DELETE");
      toast.success("Payslip deleted successfully");
      fetchingPayslips();
    } catch (error) {
      toast.error("Failed to delete payslip");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Are you sure you want to restore this Payslip?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/payslip/${id}/restore`, "PATCH");
      toast.success("Payslip restored successfully");
      fetchingPayslips();
    } catch (error) {
      toast.error("Failed to restore payslip");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  // Helper function to check if a payslip is deleted
  const isDeleted = (payslip) => payslip.deletedAt !== null;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb title="Payslip Management" paths={["Payslip"]} />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Payslip List
            </p>
            <div className="flex items-center gap-4">
              {/* Show Deleted Toggle Button */}

              {user.role === "admin" && (
                <button
                  onClick={() => setShowDeleted(!showDeleted)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 shadow-md ${
                    showDeleted
                      ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {showDeleted ? (
                    <>
                      <EyeOff size={16} />
                      <span>Hide Deleted</span>
                    </>
                  ) : (
                    <>
                      <Eye size={16} />
                      <span>Show Deleted</span>
                    </>
                  )}
                </button>
              )}

              {hasPermission("PaySlip", "create") && !showDeleted && (
                <button
                  onClick={handleAddPaySlip}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
                >
                  <BadgePlus size={16} />
                  <span>Add Payslip</span>
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row justify-end mt-4 gap-2">
            <div className="relative">
              {!monthFilter && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-800 text-sm sm:text-base pointer-events-none">
                  Select Month
                </span>
              )}
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-2 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none w-full md:w-auto"
              />
            </div>

            <div className="relative w-full md:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Payslip"
                onChange={(e) => handleSearch(e.target.value)}
                className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-8 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Info Message */}
          {showDeleted && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <EyeOff size={16} />
                Showing deleted payslips only. Deleted payslips can only be
                viewed.
              </p>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 size={32} className="text-red-500 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">#</th>
                    <th className="px-5 py-3 text-left font-semibold">
                      Employee
                    </th>
                    <th className="px-5 py-3 text-left font-semibold">Month</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">
                      Paid Date
                    </th>
                    <th className="px-5 py-3 text-left font-semibold">
                      Earnings
                    </th>
                    <th className="px-5 py-3 text-left font-semibold">
                      Deductions
                    </th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">
                      Net Salary
                    </th>
                    <th className="px-5 py-3 text-left font-semibold">
                      Status
                    </th>
                    <th className="px-5 py-3 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {payslips.length > 0 ? (
                    payslips.map((item, index) => {
                      const deleted = isDeleted(item);
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-gray-50 transition-colors duration-200 ${
                            deleted
                              ? "bg-red-50/50"
                              : index % 2 === 0
                              ? "bg-gray-50/50"
                              : "bg-white"
                          }`}
                        >
                          <td className="px-5 py-3 text-gray-700">
                            {index + 1}
                          </td>
                          <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">
                            {item.user?.name || "N/A"}
                          </td>
                          <td className="px-5 py-3 text-gray-700 whitespace-nowrap">
                            {new Date(item.month + "-01").toLocaleString(
                              "default",
                              {
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-5 py-3 text-gray-700 whitespace-nowrap">
                            {new Date(item.paid_date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-5 py-3 text-green-600 font-semibold whitespace-nowrap">
                            {item.currency?.symbol} {item.total_earnings}
                          </td>
                          <td className="px-5 py-3 text-red-500 font-semibold whitespace-nowrap">
                            {item.currency?.symbol} {item.total_deductions}
                          </td>
                          <td className="px-5 py-3 text-blue-900 font-bold whitespace-nowrap">
                            {item.currency?.symbol} {item.net_salary}
                          </td>
                          <td className="px-5 py-3">
                            {deleted ? (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                Deleted
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <div className="flex justify-center gap-3">
                              {/* For deleted payslips - only show View button */}
                              {deleted ? (
                                <>
                                  <button
                                    onClick={() => setViewPayslipData(item)}
                                    className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                                    title="View"
                                  >
                                    <FileText size={16} />
                                  </button>
                                  {hasPermission("PaySlip", "delete") && (
                                    <>
                                      <button
                                        onClick={() => handleRestore(item.id)}
                                        className="p-2 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 transition"
                                        title="Restore"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                          <path d="M3 3v5h5" />
                                        </svg>
                                      </button>
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  {/* For active payslips - show all actions */}
                                  {hasPermission("PaySlip", "update") && (
                                    <button
                                      onClick={() => handleEdit(item)}
                                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                                      title="Edit"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                  )}
                                  {hasPermission("PaySlip", "delete") && (
                                    <button
                                      onClick={() => handleDelete(item.id)}
                                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}

                                  <button
                                    onClick={() => setViewPayslipData(item)}
                                    className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                                    title="View PDF"
                                  >
                                    <FileText size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center text-gray-500 py-8"
                      >
                        {showDeleted
                          ? "No deleted payslips found"
                          : "No payslips found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-sm px-3 py-1.5 rounded border hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
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
        </div>

        {/* Add/Edit Modal - Hide when showing deleted */}
        {!showDeleted && (
          <AddPayslip
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            editPayslipData={editPayslipData}
            onSuccess={() => {
              fetchingPayslips();
              setShowModal(false);
            }}
          />
        )}

        <ViewPayslipModal
          isOpen={!!viewPayslipData}
          onClose={() => setViewPayslipData(null)}
          payslip={viewPayslipData}
        />
      </div>
    </div>
  );
};

export default PayslipComponent;
