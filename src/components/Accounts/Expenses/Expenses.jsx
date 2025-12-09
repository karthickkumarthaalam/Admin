import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import {
  Loader2,
  Trash2,
  Edit,
  BadgePlus,
  Upload,
  Download,
  Search,
  ClipboardPlus,
  ArchiveRestore,
  Archive,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import AddExpenseModal from "./AddExpenseModal";
import BreadCrumb from "../../BreadCrum";
import { usePermission } from "../../../context/PermissionContext";
import debounce from "lodash.debounce";
import ExportModal from "./ExportModal";
import { useAuth } from "../../../context/AuthContext";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editExpenseData, setEditExpenseData] = useState(null);
  const { hasPermission } = usePermission();
  const [loadingBillId, setLoadingBillId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [viewDeleted, setViewDeleted] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const pageSize = 50;

  const { user } = useAuth();

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        show_deleted: viewDeleted,
      });

      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);

      if (!fromDate && !toDate) {
        if (month) params.append("month", month);
      }

      const response = await apiCall(`/expense?${params.toString()}`);
      setExpenses(response?.data);
      setTotalRecords(response?.pagination?.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [month, currentPage, searchQuery, fromDate, toDate, viewDeleted]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleUploadBill = async (categoryId, file) => {
    const formData = new FormData();
    formData.append("bill", file);
    setLoadingBillId(categoryId);
    try {
      await apiCall(
        `/expense/category/${categoryId}/add-bill`,
        "POST",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Bill uploaded successfully");
      fetchExpenses();
    } catch (error) {
      toast.error("Failed to upload bill");
    } finally {
      setLoadingBillId(null);
    }
  };

  const handleDeleteBill = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete the bill?")) return;
    setLoadingBillId(categoryId);

    try {
      await apiCall(`/expense/category/${categoryId}/delete-bill`, "DELETE");
      toast.success("Bill deleted successfully");
      fetchExpenses(); // refresh
    } catch (error) {
      toast.error("Failed to delete bill");
    } finally {
      setLoadingBillId(null);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Are you sure you want to restore the Expense")) return;
    try {
      await apiCall(`/expense/${id}/restore`, "PATCH");
      toast.success("Expense Restore successfully");
      setViewDeleted(false);
      fetchExpenses();
    } catch (error) {
      toast.error("Failed to restore Expense");
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  // --- Monthly Calculations ---
  const MonthlyTotals = expenses.reduce(
    (acc, exp) => {
      acc.total += exp.total_amount || 0;
      acc.pending += exp.pending_amount || 0;
      return acc;
    },
    { total: 0, pending: 0 }
  );

  const completionRate =
    MonthlyTotals.total > 0
      ? Math.round(
          ((MonthlyTotals.total - MonthlyTotals.pending) /
            MonthlyTotals.total) *
            100
        )
      : 0;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb title="Expense Management" paths={["Expenses"]} />
      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-semibold text-lg">Expenses List</h2>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setExportModalOpen(true);
              }}
              className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300 "
            >
              <ClipboardPlus size={16} />
              <span>Generate Report</span>
            </button>
            {hasPermission("Expenses", "create") && (
              <button
                onClick={() => {
                  setEditExpenseData(null);
                  setIsAddModalOpen(true);
                }}
                className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
              >
                <BadgePlus size={16} />
                <span>Add Expense</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 w-full overflow-x-auto scrollbar-none">
          {/* Left: Show Deleted Toggle */}
          {user.email === "admin" && (
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  setViewDeleted((prev) => {
                    setCurrentPage(1);
                    return !prev;
                  });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border shadow-sm transition-all duration-200 ${
                  viewDeleted
                    ? "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {viewDeleted ? (
                  <>
                    <ArchiveRestore size={16} />
                    Showing Deleted Expenses
                  </>
                ) : (
                  <>
                    <Archive size={16} />
                    Show Deleted Expenses
                  </>
                )}
              </button>
            </div>
          )}

          {/* Right: Filters + Search */}
          <div className="">
            <div className="flex gap-4 min-w-max items-center">
              {!viewDeleted && (
                <>
                  {/* From Date */}
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setMonth(""); // disable month when using range
                      setCurrentPage(1);
                    }}
                    className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                  />

                  {/* To Date */}
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setMonth(""); // disable month when using range
                      setCurrentPage(1);
                    }}
                    className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                  />

                  <select
                    value={month}
                    onChange={(e) => {
                      setMonth(e.target.value);
                      setFromDate(""); // clear date range when using month filter
                      setToDate("");
                      setCurrentPage(1);
                    }}
                    className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                    disabled={fromDate || toDate}
                  >
                    <option value="">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {/* Search Box */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search Expenses..."
                  onChange={(e) => handleSearch(e.target.value)}
                  className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-8 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Summary Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Monthly Total */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium text-sm">Monthly Total</h4>
              <TrendingUp size={18} />
            </div>
            <p className="text-2xl font-bold">
              ₹{" "}
              {MonthlyTotals.total.toLocaleString("en-GB", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Pending Total */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium text-sm">Pending Total</h4>
              <AlertCircle size={18} />
            </div>
            <p className="text-2xl font-bold">
              ₹{" "}
              {MonthlyTotals.pending.toLocaleString("en-GB", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Completion */}
          <div className="p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium text-sm">Completion</h4>
              <CheckCircle2 size={18} />
            </div>
            <p className="text-2xl font-bold">{completionRate}%</p>
          </div>
        </div>

        <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full text-sm ">
            <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white">
              <tr>
                <th className="border-b px-3 py-3 w-[20px] whitespace-nowrap text-left">
                  SI
                </th>
                <th className="border-b px-3 py-3 min-w-[260px] md:w-[500px] whitespace-nowrap text-left">
                  Details
                </th>
                <th className="border-b px-3 py-3 min-w-[260px] md:w-[250px] whitespace-nowrap text-left">
                  Status
                </th>
                <th className="border-b px-3 py-3 min-w-[320px] md:w-[450px] whitespace-nowrap text-left">
                  Category
                </th>
                <th className="border-b px-3 py-3 w-[60px]  whitespace-nowrap text-left">
                  Total Amount
                </th>
                <th className="border-b px-3 py-3 w-[60px] whitespace-nowrap text-left">
                  Pending Amount
                </th>
                <th className="border-b px-3 py-3 w-[60px] text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-6">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-red-500"
                    />
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                expenses.map((expense, index) => (
                  <tr
                    key={expense.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition`}
                  >
                    {/* SI */}
                    <td className="border-b px-3 py-4 text-sm text-gray-600 font-medium align-top">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    {/* Expense Info */}
                    <td className="border-b px-3 py-4 text-sm text-gray-700 align-top w-60">
                      <div className="space-y-1">
                        <div>
                          <span className="font-semibold text-gray-800">
                            Document No:
                          </span>{" "}
                          <span className="bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full text-xs ">
                            {expense.document_id}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold">
                            {expense.vendor_type === "user"
                              ? "User:"
                              : "Merchant:"}
                          </span>{" "}
                          {expense.merchant}
                        </div>
                        <div>
                          <span className="font-semibold">Date:</span>{" "}
                          {expense.date
                            ? new Date(expense.date).toLocaleDateString("en-GB")
                            : ""}
                        </div>
                        {expense.status === "completed" && (
                          <>
                            <div>
                              <span className="font-semibold">
                                Paid Through:
                              </span>{" "}
                              {expense.paidThrough.name}
                            </div>
                            <div>
                              <span className="font-semibold">
                                Payment Mode:
                              </span>{" "}
                              {expense.paymentMode.name}
                            </div>
                          </>
                        )}
                        <div>
                          <span className="font-semibold">Created By:</span>{" "}
                          {expense?.creator?.name || "Admin"}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="border-b px-3 py-4 text-sm align-top text-gray-700">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border 
              ${
                expense.status === "completed"
                  ? "bg-green-100 text-green-700 border-green-500"
                  : "bg-red-100 text-red-600 border-red-400"
              }`}
                      >
                        {expense.status.charAt(0).toUpperCase() +
                          expense.status.slice(1)}
                      </span>
                      {expense.status === "completed" && (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Completed on:</span>{" "}
                          {expense.completed_date
                            ? new Date(
                                expense.completed_date
                              ).toLocaleDateString("en-GB")
                            : ""}
                        </div>
                      )}
                    </td>

                    {/* Category Table */}
                    <td className="border-b px-3 py-4 align-top">
                      {expense.categories && expense.categories.length > 0 ? (
                        <div className="rounded-md overflow-hidden border border-gray-200">
                          <table className="text-xs w-full">
                            <thead className="bg-gray-100 text-gray-700 font-semibold">
                              <tr>
                                <th className="px-2 py-1 text-left">Name</th>
                                <th className="px-2 py-1 text-left">
                                  Description
                                </th>
                                <th className="px-2 py-1 text-left">Amount</th>
                                <th className="px-2 py-1 text-left">Bill</th>
                              </tr>
                            </thead>
                            <tbody>
                              {expense.categories.map((cat, idx) => (
                                <tr key={idx} className="border-t">
                                  <td className="px-2 py-1">
                                    {cat.category_name}
                                  </td>
                                  <td className="px-2 py-1">
                                    {cat.description}
                                  </td>
                                  <td className="px-2 py-1 whitespace-nowrap">
                                    <span className="text-gray-800 font-medium">
                                      {cat.currency?.symbol}
                                      {cat.amount.toFixed(2)}
                                    </span>
                                  </td>
                                  <td className="px-2 py-1">
                                    <div className="flex gap-2 items-center">
                                      {loadingBillId === cat.id ? (
                                        <Loader2
                                          className="animate-spin text-gray-400"
                                          size={14}
                                        />
                                      ) : (
                                        <>
                                          {cat.bill_drive_link && (
                                            <a
                                              href={cat.bill_drive_link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-green-600"
                                              title="View Bill"
                                            >
                                              <Download size={14} />
                                            </a>
                                          )}
                                          {hasPermission(
                                            "Expenses",
                                            "update"
                                          ) && (
                                            <label
                                              className="cursor-pointer text-blue-600"
                                              title={
                                                cat.bill_drive_link
                                                  ? "Edit Bill"
                                                  : "Upload Bill"
                                              }
                                            >
                                              <Upload size={14} />
                                              <input
                                                type="file"
                                                accept="application/pdf"
                                                className="hidden"
                                                onChange={(e) => {
                                                  const file =
                                                    e.target.files[0];
                                                  if (file)
                                                    handleUploadBill(
                                                      cat.id,
                                                      file
                                                    );
                                                }}
                                              />
                                            </label>
                                          )}
                                          {hasPermission(
                                            "Expenses",
                                            "delete"
                                          ) &&
                                            cat.bill_drive_link && (
                                              <button
                                                className="text-red-600"
                                                title="Delete Bill"
                                                onClick={() =>
                                                  handleDeleteBill(cat.id)
                                                }
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            )}
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 italic">-</div>
                      )}
                    </td>

                    {/* Total Amount */}
                    <td className="border-b px-3 py-4 text-sm align-top whitespace-nowrap text-gray-800 font-semibold">
                      {(() => {
                        const allCurrencies = expense.categories?.map(
                          (cat) => cat.currency?.symbol
                        );
                        const firstCurrency = allCurrencies?.[0];
                        const isSameCurrency = allCurrencies?.every(
                          (symbol) => symbol === firstCurrency
                        );
                        return `${
                          isSameCurrency ? firstCurrency + " " : ""
                        }${expense.total_amount.toFixed(2)}`;
                      })()}
                    </td>

                    {/* Total Amount */}
                    <td className="border-b px-3 py-4 text-sm align-top whitespace-nowrap text-gray-800 font-semibold">
                      {(() => {
                        const allCurrencies = expense.categories?.map(
                          (cat) => cat.currency?.symbol
                        );
                        const firstCurrency = allCurrencies?.[0];
                        const isSameCurrency = allCurrencies?.every(
                          (symbol) => symbol === firstCurrency
                        );
                        return `${
                          isSameCurrency ? firstCurrency + " " : ""
                        }${expense.pending_amount.toFixed(2)}`;
                      })()}
                    </td>

                    {/* Actions */}
                    <td className="border-b px-3 py-4 align-top">
                      {!viewDeleted ? (
                        <div className="flex gap-2">
                          {hasPermission("Expenses", "update") && (
                            <button
                              className="text-gray-500 hover:text-blue-600 hover:scale-125"
                              title="Edit"
                              onClick={() => {
                                setEditExpenseData(expense);
                                setIsAddModalOpen(true);
                              }}
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {hasPermission("Expenses", "delete") && (
                            <button
                              className="text-gray-500 hover:text-red-600 hover:scale-125"
                              title="Delete"
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    "Are you sure you want to delete this expense?"
                                  )
                                )
                                  return;
                                try {
                                  await apiCall(
                                    `/expense/${expense.id}`,
                                    "DELETE"
                                  );
                                  toast.success("Expense deleted successfully");
                                  fetchExpenses();
                                } catch (error) {
                                  toast.error("Failed to delete expense");
                                }
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          className="px-3 py-2 text-center bg-blue-800 text-white rounded-lg text-xs"
                          onClick={() => handleRestore(expense.id)}
                        >
                          Restore Expense
                        </button>
                      )}
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
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchExpenses();
          setIsAddModalOpen(false);
        }}
        editExpenseData={editExpenseData}
      />
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        expenses={expenses}
        month={month}
        year={new Date().getFullYear()}
        fromDate={fromDate}
        toDate={toDate}
      />
    </div>
  );
};
export default Expenses;
