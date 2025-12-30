import React, { useEffect, useRef, useState } from "react";
import { usePermission } from "../../../../context/PermissionContext";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "react-toastify";
import { apiCall } from "../../../../utils/apiCall";
import BreadCrumb from "../../../BreadCrum";
import {
  BadgePlus,
  Edit,
  Loader2,
  Trash2,
  ArrowLeft,
  Download,
} from "lucide-react";
import AddFinancialYear from "./AddFinancialYear";
import AddExpenseBill from "./AddExpenseBill";

const ExpenseBills = () => {
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [allBills, setAllBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [openBillDropdown, setOpenBillDropdown] = useState(null);

  const billDropdownRef = useRef(null);
  const { hasPermission } = usePermission();
  const { user } = useAuth();

  const fetchFinancialYears = async () => {
    setLoading(true);
    try {
      const res = await apiCall("/financial-year", "GET");
      setFinancialYears(res.data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch financial years");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseBills = async (yearId) => {
    setLoading(true);
    try {
      const res = await apiCall(
        `/expense-bills?financial_year_id=${yearId}`,
        "GET"
      );
      setAllBills(res.data);
      if (
        selectedVendor &&
        (!res.data.some((b) => b.vendor === selectedVendor) ||
          !res.data.some((b) => b.type === selectedType))
      ) {
        setSelectedVendor(null);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch expense bills");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYear = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Financial Year?"))
      return;
    try {
      await apiCall(`/financial-year/${id}`, "DELETE");
      toast.success("Financial Year deleted successfully");
      fetchFinancialYears();
    } catch (error) {
      toast.error("Failed to delete Financial Year");
    }
  };

  const handleDeleteBill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Expense Bill?"))
      return;
    try {
      await apiCall(`/expense-bills/${id}`, "DELETE");
      toast.success("Expense Bill deleted successfully");
      fetchExpenseBills(selectedYear.id);
    } catch (error) {
      toast.error("Failed to delete Expense Bill");
    }
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        billDropdownRef.current &&
        !billDropdownRef.current.contains(event.target)
      ) {
        setOpenBillDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedYear) fetchFinancialYears();
  }, [selectedYear]);

  // Group bills: type → vendor
  const groupedByType = allBills.reduce((acc, bill) => {
    if (!acc[bill.type]) acc[bill.type] = {};
    if (!acc[bill.type][bill.vendor]) acc[bill.type][bill.vendor] = [];
    acc[bill.type][bill.vendor].push(bill);
    return acc;
  }, {});

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb
        title="Audit Bills"
        paths={
          selectedYear
            ? selectedType
              ? selectedVendor
                ? [
                    "Audit Bills",
                    `${selectedYear.start_year}-${selectedYear.end_year}`,
                    selectedType.charAt(0).toUpperCase() +
                      selectedType.slice(1),
                    selectedVendor.charAt(0).toUpperCase() +
                      selectedVendor.slice(1),
                  ]
                : [
                    "Audit Bills",
                    `${selectedYear.start_year}-${selectedYear.end_year}`,
                    selectedType.charAt(0).toUpperCase() +
                      selectedType.slice(1),
                  ]
              : [
                  "Audit Bills",
                  `${selectedYear.start_year}-${selectedYear.end_year}`,
                ]
            : ["Audit Bills"]
        }
      />

      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 overflow-y-auto pb-48">
        {/* Step 1: Financial Year List */}
        {!selectedYear && (
          <>
            <div className="flex justify-between items-center border-b pb-2 border-dashed">
              <h2 className="font-semibold text-lg">Financial Year List</h2>
              {hasPermission("Audit Bills", "create") && (
                <button
                  onClick={() => {
                    setShowModal(true);
                    setEditData(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
                >
                  <BadgePlus size={16} />
                  <span>Create Financial Year</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm ">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white">
                  <tr className="text-left">
                    <th className="border-b px-5 py-3">SI</th>
                    <th className="border-b px-5 py-3 whitespace-nowrap">
                      Financial Year
                    </th>
                    {user.role === "admin" && (
                      <th className="border-b px-5 py-3 whitespace-nowrap">
                        Created By
                      </th>
                    )}
                    <th className="border-b px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6">
                        <Loader2 className="mx-auto animate-spin text-red-500" />
                      </td>
                    </tr>
                  ) : financialYears.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6">
                        No Financial Year Found.
                      </td>
                    </tr>
                  ) : (
                    financialYears.map((year, index) => (
                      <tr
                        key={year.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedYear(year);
                          fetchExpenseBills(year.id);
                        }}
                      >
                        <td className="border-b px-5 py-3">{index + 1}</td>
                        <td className="border-b px-5 py-3 text-blue-600 hover:underline font-semibold">
                          {year.start_year} - {year.end_year}
                        </td>
                        {user.role === "admin" && (
                          <td className="border-b px-5 py-3">
                            {year?.creator?.name || "Admin"}
                          </td>
                        )}
                        <td className="border-b px-5 py-3">
                          <div className="flex gap-4">
                            {hasPermission("Audit Bills", "update") && (
                              <button
                                className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowModal(true);
                                  setEditData(year);
                                }}
                              >
                                <Edit size={16} /> Edit
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

            <AddFinancialYear
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              editData={editData}
              onSuccess={() => fetchFinancialYears()}
            />
          </>
        )}

        {/* Step 2: Type List */}
        {selectedYear && !selectedType && (
          <>
            <div className="flex justify-between items-center mb-4 ">
              <button
                onClick={() => setSelectedYear(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 font-semibold"
              >
                <ArrowLeft size={18} /> Back to Years
              </button>

              {hasPermission("Audit Bills", "create") && (
                <button
                  onClick={() => {
                    setShowModal(true);
                    setEditData(null);
                  }}
                  className="rounded bg-red-500 hover:bg-red-600 text-white px-3 py-2 flex gap-2 items-center text-sm"
                >
                  <BadgePlus size={16} />
                  <span>Create Expense Bill</span>
                </button>
              )}
            </div>
            {loading ? (
              <div className="py-6 text-center">
                <Loader2 className="mx-auto animate-spin text-red-500" />
              </div>
            ) : Object.keys(groupedByType).length === 0 ? (
              <p className="text-center py-6">No Types Found.</p>
            ) : (
              <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
                <table className="w-full  text-sm">
                  <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white">
                    <tr className="text-left">
                      <th className="border-b px-5 py-3">SI</th>
                      <th className="border-b px-5 py-3">Type</th>
                      <th className="border-b px-5 py-3 text-center">
                        No. of Merchants
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(groupedByType || []).map((type, index) => (
                      <tr
                        key={type}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedType(type)}
                      >
                        <td className="border-b px-5 py-3">{index + 1}</td>
                        <td className="border-b px-5 py-3 ">
                          {type === "expense" ? (
                            <span className="text-sm font-semibold bg-red-50 text-red-700 rounded px-2 py-1">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          ) : type === "income" ? (
                            <span className="text-sm font-semibold bg-green-50 text-green-700 rounded px-2 py-1">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          ) : type === "payable" ? (
                            <span className="text-sm font-semibold bg-blue-50 text-blue-700 rounded px-2 py-1">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold bg-violet-50 text-violet-700 rounded px-2 py-1">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="border-b px-5 py-3 text-center">
                          {Object.keys(groupedByType[type]).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <AddExpenseBill
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              editData={editData}
              financialYearId={selectedYear.id}
              onSuccess={() => fetchExpenseBills(selectedYear.id)}
            />
          </>
        )}

        {/* Step 3: Vendor List for Selected Type */}
        {selectedYear && selectedType && !selectedVendor && (
          <>
            <div className="flex  flex-col md:flex-row items-start md:items-center justify-between mb-4">
              <button
                onClick={() => setSelectedType(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 font-semibold whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  <ArrowLeft size={18} /> Back to Types
                </div>
                <span className="text-blue-600">
                  ( Selected Type:{" "}
                  <span className="text-lg">
                    {selectedType.charAt(0).toUpperCase() +
                      selectedType.slice(1)}{" "}
                  </span>
                  )
                </span>
              </button>

              {hasPermission("Audit Bills", "create") && (
                <button
                  onClick={() => {
                    setShowModal(true);
                    setEditData(null);
                  }}
                  className="rounded bg-red-500 hover:bg-red-600 text-white px-3 py-2 flex gap-2 items-center text-sm"
                >
                  <BadgePlus size={16} />
                  <span>Create Expense Bill</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full  text-sm">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white">
                  <tr className="text-left">
                    <th className="border-b px-5 py-3">SI</th>
                    <th className="border-b px-5 py-3">Merchant</th>
                    <th className="border-b px-5 py-3">Type</th>
                    <th className="border-b px-5 py-3 text-center">
                      No. of Bills
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupedByType[selectedType] || []).map(
                    (vendor, index) => (
                      <tr
                        key={vendor}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedVendor(vendor)}
                      >
                        <td className="border-b px-5 py-3">{index + 1}</td>
                        <td className="border-b px-5 py-3 text-blue-800 hover:underline font-semibold text-md">
                          {vendor.charAt(0).toUpperCase() + vendor.slice(1)}
                        </td>
                        <td className="border-b px-5 py-3 ">
                          {selectedType === "expense" ? (
                            <span className="text-sm font-semibold bg-red-50 text-red-700 rounded px-2 py-1">
                              {selectedType.charAt(0).toUpperCase() +
                                selectedType.slice(1)}
                            </span>
                          ) : selectedType === "income" ? (
                            <span className="text-sm font-semibold bg-green-50 text-green-700 rounded px-2 py-1">
                              {selectedType.charAt(0).toUpperCase() +
                                selectedType.slice(1)}
                            </span>
                          ) : selectedType === "payable" ? (
                            <span className="text-sm font-semibold bg-blue-50 text-blue-700 rounded px-2 py-1">
                              {selectedType.charAt(0).toUpperCase() +
                                selectedType.slice(1)}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold bg-violet-50 text-violet-700 rounded px-2 py-1">
                              {selectedType.charAt(0).toUpperCase() +
                                selectedType.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="border-b px-5 py-3 text-center">
                          {groupedByType[selectedType][vendor].length}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <AddExpenseBill
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              editData={editData}
              financialYearId={selectedYear.id}
              onSuccess={() => fetchExpenseBills(selectedYear.id)}
            />
          </>
        )}

        {/* Step 4: Bills Table for Selected Vendor */}
        {selectedYear && selectedType && selectedVendor && (
          <>
            <div className="flex  flex-col md:flex-row items-start md:items-center justify-between mb-4">
              <button
                onClick={() => setSelectedVendor(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 font-semibold whitespace-nowrap"
              >
                <ArrowLeft size={18} /> Back to Merchant{" "}
                <span className="text-blue-600">
                  ( Selected merchant:{" "}
                  <span className="text-lg">
                    {" "}
                    {selectedVendor.charAt(0).toUpperCase() +
                      selectedVendor.slice(1)}{" "}
                  </span>
                  )
                </span>
              </button>

              {hasPermission("Audit Bills", "create") && (
                <button
                  onClick={() => {
                    setShowModal(true);
                    setEditData(null);
                  }}
                  className="rounded bg-red-500 hover:bg-red-600 text-white px-3 py-2 flex gap-2 items-center text-sm"
                >
                  <BadgePlus size={16} />
                  <span>Create Expense Bill</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full  text-sm">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white">
                  <tr className="text-left">
                    <th className="border-b px-5 py-3">SI</th>
                    <th className="border-b px-5 py-3">Merchant</th>
                    <th className="border-b px-5 py-3">Title</th>
                    <th className="border-b px-5 py-3 whitespace-nowrap">
                      Bill Period
                    </th>
                    <th className="border-b px-5 py-3">Type</th>
                    <th className="border-b px-5 py-3 whitespace-nowrap">
                      Total Amount
                    </th>
                    <th className="border-b px-5 py-3 whitespace-nowrap">
                      Download Files
                    </th>
                    {user.role === "admin" && (
                      <th className="border-b px-5 py-3 whitespace-nowrap">
                        Created By
                      </th>
                    )}
                    <th className="border-b px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedByType[selectedType][selectedVendor] &&
                  groupedByType[selectedType][selectedVendor].length > 0 ? (
                    groupedByType[selectedType][selectedVendor].map(
                      (bill, index) => (
                        <tr key={bill.id}>
                          <td className="border-b px-5 py-3">{index + 1}</td>
                          <td className="border-b px-5 py-3 whitespace-nowrap">
                            {bill.vendor}
                          </td>
                          <td className="border-b px-5 py-3 whitespace-nowrap">
                            {bill.title}
                          </td>
                          <td className="border-b px-5 py-3 whitespace-nowrap">
                            {bill.start_date && bill.end_date && (
                              <>
                                {new Date(bill.start_date).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}{" "}
                                -{" "}
                                {new Date(bill.end_date).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </>
                            )}
                          </td>
                          <td className="border-b px-5 py-3 ">
                            {selectedType === "expense" ? (
                              <span className="text-sm font-semibold bg-red-50 text-red-700 rounded px-2 py-1">
                                {selectedType.charAt(0).toUpperCase() +
                                  selectedType.slice(1)}
                              </span>
                            ) : selectedType === "income" ? (
                              <span className="text-sm font-semibold bg-green-50 text-green-700 rounded px-2 py-1">
                                {selectedType.charAt(0).toUpperCase() +
                                  selectedType.slice(1)}
                              </span>
                            ) : selectedType === "payable" ? (
                              <span className="text-sm font-semibold bg-blue-50 text-blue-700 rounded px-2 py-1">
                                {selectedType.charAt(0).toUpperCase() +
                                  selectedType.slice(1)}
                              </span>
                            ) : (
                              <span className="text-sm font-semibold bg-violet-50 text-violet-700 rounded px-2 py-1">
                                {selectedType.charAt(0).toUpperCase() +
                                  selectedType.slice(1)}
                              </span>
                            )}
                          </td>
                          <td className="border-b px-5 py-3">
                            {bill.currency?.symbol || "CHF"} {bill.amount}
                          </td>
                          <td className="border-b px-5 py-3 relative">
                            <button
                              onClick={() =>
                                setOpenBillDropdown((prev) =>
                                  prev === bill.id ? null : bill.id
                                )
                              }
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition whitespace-nowrap"
                            >
                              Bills ({bill.bills?.length || 0})
                            </button>

                            {openBillDropdown === bill.id &&
                              bill.bills?.length > 0 && (
                                <div
                                  ref={billDropdownRef}
                                  className="absolute z-50 mt-1 bg-white border shadow-lg rounded p-2 flex flex-col gap-1 max-h-60 overflow-y-auto min-w-[150px]"
                                >
                                  {bill.bills.map((item) => (
                                    <a
                                      key={item.id}
                                      href={item.bill_address}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-800 text-xs hover:bg-green-200 transition"
                                    >
                                      <Download size={12} />
                                      {item.bill_address.split("/").pop()}
                                    </a>
                                  ))}
                                </div>
                              )}
                          </td>

                          {user.role === "admin" && (
                            <td className="border-b px-5 py-3">
                              {bill?.creator?.name || "Admin"}
                            </td>
                          )}

                          <td className="border-b px-5 py-3">
                            <div className="flex gap-2">
                              {hasPermission("Audit Bills", "update") && (
                                <button
                                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                                  onClick={() => {
                                    setShowModal(true);
                                    setEditData(bill);
                                  }}
                                >
                                  <Edit size={14} />
                                  Edit
                                </button>
                              )}

                              {hasPermission("Audit Bills", "delete") && (
                                <button
                                  className="inline-flex items-center gap-1.5 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
                                  onClick={() => handleDeleteBill(bill.id)}
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-6">
                        No Expense Bills Found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <AddExpenseBill
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              editData={editData}
              financialYearId={selectedYear.id}
              onSuccess={() => fetchExpenseBills(selectedYear.id)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ExpenseBills;
