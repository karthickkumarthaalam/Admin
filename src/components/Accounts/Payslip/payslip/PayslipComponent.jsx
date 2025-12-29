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
} from "lucide-react";
import { AddPayslip } from "./AddPayslip";
import ViewPayslipModal from "./ViewPayslipModal";

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

  const { hasPermission } = usePermission();

  const pageSize = 50;

  const fetchingPayslips = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/payslip?page=${currentPage}&limit=${pageSize}&search=${searchQuery}&month=${monthFilter}`,
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
  }, [currentPage, searchQuery, monthFilter]);

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

  const totalPages = Math.ceil(totalRecords / pageSize);

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
            {hasPermission("PaySlip", "create") && (
              <button
                onClick={handleAddPaySlip}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
              >
                <BadgePlus size={16} />
                <span>Add Payslip</span>
              </button>
            )}
          </div>

          {/* Search */}
          <div className="flex justify-end mt-4 gap-2">
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
                className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-2 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="relative w-64">
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

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 size={32} className="text-red-500 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white sticky top-0 z-10">
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
                    <th className="px-5 py-3 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {payslips.length > 0 ? (
                    payslips.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                        }`}
                      >
                        <td className="px-5 py-3 text-gray-700">{index + 1}</td>
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
                        <td className="px-5 py-3 text-center">
                          <div className="flex justify-center gap-3">
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
                              title="Download PDF"
                            >
                              <FileText size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center text-gray-500 py-8"
                      >
                        No Payslips found
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

        {/* Add/Edit Modal */}
        <AddPayslip
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editPayslipData={editPayslipData}
          onSuccess={() => {
            fetchingPayslips();
            setShowModal(false);
          }}
        />

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
