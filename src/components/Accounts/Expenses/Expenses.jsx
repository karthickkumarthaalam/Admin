import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import { Loader2, Trash2, Edit2, BadgePlus, Upload, Eye } from "lucide-react";
import AddExpenseModal from "./AddExpenseModal";
import BreadCrumb from "../../BreadCrum";
import { usePermission } from "../../../context/PermissionContext";
import debounce from "lodash.debounce";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editExpenseData, setEditExpenseData] = useState(null);
  const { hasPermission } = usePermission();
  const [loadingBillId, setLoadingBillId] = useState(null);

  const pageSize = 20;

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/expense?page=${currentPage}&month=${month}&year=${year}`
      );
      setExpenses(response?.data);
      setTotalRecords(response?.pagination?.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const debouncedYearChange = debounce((newYear) => {
    setYear(newYear);
    setCurrentPage(1);
  }, 400);

  useEffect(() => {
    fetchExpenses();
  }, [month, year, currentPage]);

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

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb title="Expense Management" paths={["Expenses"]} />
      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-semibold text-lg">Expenses List</h2>
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

        <div className="mt-4 flex justify-end items-center gap-4 flex-wrap">
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setCurrentPage(1);
            }}
            className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <div className="flex items-center border-2 border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => debouncedYearChange(year - 1)}
              className="px-3 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200"
            >
              –
            </button>
            <div className="px-4 py-2 text-sm">{year}</div>
            <button
              onClick={() => debouncedYearChange(year + 1)}
              className="px-3 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200"
            >
              +
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full border text-sm ">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 min-w-[20px] whitespace-nowrap">
                  SI
                </th>
                <th className="border px-3 py-2 min-w-[260px] md:w-[500px] whitespace-nowrap">
                  Details
                </th>
                <th className="border px-3 py-2 min-w-[260px] md:w-[250px] whitespace-nowrap">
                  Status
                </th>
                <th className="border px-3 py-2 min-w-[320px] md:w-[450px] whitespace-nowrap">
                  Categories
                </th>
                <th className="border px-3 py-2 w-[60px]  whitespace-nowrap">
                  Total Amount
                </th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-red-500"
                    />
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                expenses.map((expense, index) => {
                  return (
                    <tr key={expense.id}>
                      <td className="border px-3 py-2">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="border px-3 py-2 text-left">
                        <div className="mb-1">
                          <span className="font-semibold">Document No:</span>{" "}
                          {expense.document_id}
                        </div>
                        {expense.vendor_type === "user" ? (
                          <div className="mb-1">
                            <span className="font-semibold">User:</span>{" "}
                            {expense.merchant}
                          </div>
                        ) : (
                          <div className="mb-1">
                            <span className="font-semibold">Merchant: </span>
                            {expense.merchant}
                          </div>
                        )}
                        <div>
                          {" "}
                          <span className="font-semibold">Date:</span>{" "}
                          {expense.date
                            ? new Date(expense.date).toLocaleDateString("en-GB")
                            : ""}
                        </div>
                        {expense.status === "completed" && (
                          <>
                            <div className="mb-1 mt-1">
                              <span className="font-semibold">
                                Paid Through:
                              </span>{" "}
                              {expense.paidThrough.name}
                            </div>
                            <div className="mb-1">
                              <span className="font-semibold">
                                Payment Mode:
                              </span>{" "}
                              {expense.paymentMode.name}
                            </div>
                          </>
                        )}
                      </td>
                      <td className="border px-3 py-2 align-top">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-block w-fit text-sm font-medium px-3 py-1 rounded-full border 
                              ${
                                expense.status === "completed"
                                  ? "bg-green-100 border-green-600 text-green-700"
                                  : "bg-red-100 border-red-400 text-red-600"
                              }`}
                          >
                            {expense.status.charAt(0).toUpperCase() +
                              expense.status.slice(1)}
                          </span>

                          {expense.status === "completed" && (
                            <div className=" mt-1">
                              <span className="font-semibold">
                                Completed on:{" "}
                              </span>
                              {expense.date
                                ? new Date(
                                    expense.completed_date
                                  ).toLocaleDateString("en-GB")
                                : ""}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="border px-3 py-2 align-top">
                        {expense.categories && expense.categories.length > 0 ? (
                          <table className="text-xs  border-gray-200 rounded-md w-auto">
                            <thead>
                              <tr>
                                <th className="text-left px-2 py-1 font-semibold w-36">
                                  Name
                                </th>
                                <th className="text-left px-2 py-1 font-semibold w-36">
                                  Description
                                </th>
                                <th className="text-left px-2 py-1 font-semibold w-28">
                                  Amount
                                </th>
                                <th className="text-left px-2 py-1 font-semibold w-36">
                                  Bill
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {expense.categories.map((cat, idx) => (
                                <tr key={idx} className="border-t">
                                  <td className="px-2 py-1 align-top">
                                    {cat.category_name}
                                  </td>
                                  <td className="px-2 py-1 align-top">
                                    {cat.description}
                                  </td>

                                  <td className="px-2 py-1 align-top whitespace-nowrap">
                                    {cat.currency?.symbol}{" "}
                                    {cat.amount.toFixed(2)}
                                  </td>

                                  <td className="px-2 py-1 align-top">
                                    <div className="flex gap-1 items-center">
                                      {loadingBillId === cat.id ? (
                                        <Loader2
                                          className="animate-spin text-gray-500"
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
                                              <Eye size={14} />
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
                        ) : (
                          <div>-</div>
                        )}
                      </td>
                      <td className="border px-3 py-2 align-top ">
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
                      <td className="border px-3 py-2 align-top ">
                        <div className="flex justify-start gap-2">
                          {hasPermission("Expenses", "update") && (
                            <button
                              className="text-blue-600"
                              onClick={() => {
                                setEditExpenseData(expense);
                                setIsAddModalOpen(true);
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {hasPermission("Expenses", "update") && (
                            <button
                              className="text-red-600"
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
                      </td>
                    </tr>
                  );
                })
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
    </div>
  );
};
export default Expenses;
