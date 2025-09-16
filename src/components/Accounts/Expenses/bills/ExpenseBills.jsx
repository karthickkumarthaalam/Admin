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
  const [allBills, setAllBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [openBillDropdown, setOpenBillDropdown] = useState(null);

  const [selectedVendorType, setSelectedVendorType] = useState(null);

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

  // Group bills by vendor + type
  const vendorTypeGroups = allBills.reduce((acc, bill) => {
    const key = `${bill.vendor} - ${bill.type}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(bill);
    return acc;
  }, {});

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb
        title="Audit Bills"
        paths={
          selectedYear
            ? selectedVendorType
              ? [
                  "Audit Bills",
                  `${selectedYear.start_year}-${selectedYear.end_year}`,
                  selectedVendorType.charAt(0).toUpperCase() +
                    selectedVendorType.slice(1),
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
                  className="rounded bg-red-500 hover:bg-red-600 text-white px-3 py-2 flex gap-2 items-center text-sm"
                >
                  <BadgePlus size={16} />
                  <span>Create Financial Year</span>
                </button>
              )}
            </div>

            <table className="w-full border text-sm mt-4">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="border px-3 py-2">SI</th>
                  <th className="border px-3 py-2">Financial Year</th>
                  {user.role === "admin" && (
                    <th className="border px-3 py-2">Created By</th>
                  )}
                  <th className="border px-3 py-2">Action</th>
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
                      <td className="border px-3 py-2">{index + 1}</td>
                      <td className="border px-3 py-2 text-blue-600 hover:underline">
                        {year.start_year} - {year.end_year}
                      </td>
                      {user.role === "admin" && (
                        <td className="border px-3 py-2">
                          {year?.creator?.name || "Admin"}
                        </td>
                      )}
                      <td className="border px-3 py-2">
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
                          {/* {hasPermission("Audit Bills", "delete") && (
                            <button
                              className="inline-flex items-center gap-1.5 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteYear(year.id);
                              }}
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          )} */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <AddFinancialYear
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              editData={editData}
              onSuccess={() => fetchFinancialYears()}
            />
          </>
        )}

        {/* Step 2: Vendor-Type List */}
        {selectedYear && !selectedVendorType && (
          <>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setSelectedYear(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
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
            ) : Object.keys(vendorTypeGroups).length === 0 ? (
              <p className="text-center py-6">No Vendors Found.</p>
            ) : (
              <table className="w-full border text-sm mt-4">
                <thead className="bg-gray-100">
                  <tr className="text-left">
                    <th className="border px-3 py-2">SI</th>
                    <th className="border px-3 py-2">Vendor</th>
                    <th className="border px-3 py-2">Type</th>
                    <th className="border px-3 py-2 text-center">
                      No. of Bills
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(vendorTypeGroups).map((key, index) => {
                    const [vendor, type] = key.split(" - ");
                    return (
                      <tr
                        key={key}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedVendorType(key)}
                      >
                        <td className="border px-3 py-2">{index + 1}</td>
                        <td className="border px-3 py-2 font-medium hover:cursor-pointer text-blue-800 hover:underline">
                          {vendor}
                        </td>
                        <td className="border px-3 py-2 ">
                          {type === "expense" ? (
                            <span className=" text-xs font-medium bg-red-50 text-red-700 rounded px-2 py-1">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          ) : (
                            <span className="text-xs font-medium bg-green-50 text-green-700 rounded px-2 py-1">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {vendorTypeGroups[key].length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

        {/* Step 3: Bills Table for Selected Vendor-Type */}
        {selectedYear && selectedVendorType && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedVendorType(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
              >
                <ArrowLeft size={18} /> Back to Vendors
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

            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="border px-3 py-2">SI</th>
                  <th className="border px-3 py-2">Vendor</th>
                  <th className="border px-3 py-2">Title</th>
                  <th className="border px-3 py-2">Bill Period</th>
                  <th className="border px-3 py-2">Bill Type</th>
                  <th className="border px-3 py-2">Bills</th>
                  {user.role === "admin" && (
                    <th className="border px-3 py-2">Created By</th>
                  )}
                  <th className="border px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {vendorTypeGroups[selectedVendorType] &&
                vendorTypeGroups[selectedVendorType].length > 0 ? (
                  vendorTypeGroups[selectedVendorType].map((bill, index) => (
                    <tr key={bill.id}>
                      <td className="border px-3 py-2">{index + 1}</td>
                      <td className="border px-3 py-2">{bill.vendor}</td>
                      <td className="border px-3 py-2">{bill.title}</td>
                      <td className="border px-3 py-2 whitespace-nowrap">
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
                      <td className="border px-3 py-2 ">
                        {" "}
                        {bill.type === "expense" ? (
                          <span className="px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded ">
                            {bill.type.charAt(0).toUpperCase() +
                              bill.type.slice(1)}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded ">
                            {bill.type.charAt(0).toUpperCase() +
                              bill.type.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="border px-3 py-2 relative">
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
                        <td className="border px-3 py-2">
                          {bill?.creator?.name || "Admin"}
                        </td>
                      )}

                      <td className="border px-3 py-2">
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6">
                      No bills found for this vendor-type.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

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
