import React, { useEffect, useState, useMemo } from "react";
import { exportBudgetPDF } from "../../../utils/exportBudgetPdf";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";
import { X } from "lucide-react";

const ViewBudgetModal = ({ isOpen, onClose, budget }) => {
  const [incomeItems, setIncomeItems] = useState([]);
  const [expenseItems, setExpenseItems] = useState([]);
  const [sponsersItems, setSponsersItems] = useState([]);
  const [appliedTaxes, setAppliedTaxes] = useState([]);
  const [isActualBudget, setIsActualBudget] = useState(false);
  const [originalTaxes, setOriginalTaxes] = useState([]);

  useEffect(() => {
    if (isOpen && budget?.budget_id) {
      loadData();
      setIsActualBudget(false);
    }
  }, [isOpen, budget]);

  const loadData = async () => {
    try {
      const [incomeRes, expenseRes, sponsersRes, taxRes] = await Promise.all([
        apiCall(`/budget/budget-items/${budget.budget_id}?budget_type=income`),
        apiCall(`/budget/budget-items/${budget.budget_id}?budget_type=expense`),
        apiCall(
          `/budget/budget-items/${budget.budget_id}?budget_type=sponsers`
        ),
        apiCall(`/budget/budget-tax/${budget.id}`),
      ]);

      setIncomeItems(incomeRes.data || []);
      setExpenseItems(expenseRes.data || []);
      setSponsersItems(sponsersRes.data || []);
      const formattedTaxes =
        (taxRes.data || []).map((t) => ({
          tax_name: t.tax.tax_name,
          percentage: t.tax.tax_percentage,
        })) || [];

      setOriginalTaxes(formattedTaxes);
    } catch (err) {
      toast.error("Failed to fetch budget data");
    }
  };

  useEffect(() => {
    const totalIncome = incomeItems.reduce(
      (sum, i) =>
        sum +
        (parseFloat(isActualBudget ? i.actual_amount : i.total_amount) || 0),
      0
    );

    const updatedTaxes = originalTaxes.map((t) => ({
      ...t,
      amount: ((t.percentage || 0) / 100) * totalIncome,
    }));
    setAppliedTaxes(updatedTaxes);
  }, [isActualBudget, incomeItems, originalTaxes]);

  const handleExport = async () => {
    await exportBudgetPDF({
      budgetInfo: {
        title: budget.title,
        budget_id: budget.budget_id,
        date: budget?.date || null,
        from_date: budget?.from_date || null,
        to_date: budget?.to_date || null,
        submittedBy: budget?.creator || { name: "Admin", email: "" },
        reportedTo: { name: "Manager", email: "" },
        submittedOn: new Date(),
        currencySymbol: budget?.currency?.symbol || "₹",
        created_by: budget?.creator?.name || "Admin",
      },
      incomeItems,
      expenseItems,
      sponsersItems,
      appliedTaxes,
      actualBudgetMode: isActualBudget,
    });
  };

  const totalIncome = useMemo(() => {
    return incomeItems.reduce(
      (sum, item) =>
        sum +
        (parseFloat(isActualBudget ? item.actual_amount : item.total_amount) ||
          0),
      0
    );
  }, [incomeItems, isActualBudget]);

  const totalSponsers = useMemo(() => {
    return sponsersItems.reduce(
      (sum, item) =>
        sum +
        (parseFloat(isActualBudget ? item.actual_amount : item.total_amount) ||
          0),
      0
    );
  }, [sponsersItems, isActualBudget]);

  const totalExpense = useMemo(() => {
    return expenseItems.reduce(
      (sum, item) =>
        sum +
        (parseFloat(isActualBudget ? item.actual_amount : item.total_amount) ||
          0),
      0
    );
  }, [expenseItems, isActualBudget]);

  const totalTax = useMemo(() => {
    return appliedTaxes.reduce(
      (sum, tax) => sum + (parseFloat(tax.amount) || 0),
      0
    );
  }, [appliedTaxes]);

  const profit = useMemo(() => {
    return totalIncome + totalSponsers - totalExpense - totalTax;
  }, [totalIncome, totalSponsers, totalExpense, totalTax]);

  const renderTable = (title, items, color = "blue") => {
    if (!items?.length) return null;

    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    const headerColor =
      {
        blue: "text-blue-800",
        green: "text-green-800",
        amber: "text-amber-800",
        rose: "text-rose-700",
      }[color] || "text-gray-800";

    const totalSum = items.reduce(
      (sum, item) =>
        sum +
        (parseFloat(isActualBudget ? item.actual_amount : item.total_amount) ||
          0),
      0
    );
    return (
      <div className="mb-7">
        <h3
          className={`text-lg font-bold mb-2 px-2 py-1 rounded ${headerColor}`}
        >
          {title}
        </h3>
        <div className="overflow-x-auto rounded-xl shadow ring-1 ring-gray-200">
          <table className="min-w-full text-sm bg-white">
            <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600 whitespace-nowrap">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-gray-600 whitespace-nowrap">
                  Category
                </th>
                <th className="px-4 py-2 text-left text-gray-600 whitespace-nowrap">
                  Sub-category
                </th>
                <th className="px-4 py-2 text-left text-gray-600 whitespace-nowrap">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-gray-600 whitespace-nowrap">
                  Qty
                </th>

                {isActualBudget ? (
                  <th className="px-4 py-2 text-right text-gray-600 whitespace-nowrap">
                    Actual Amount
                  </th>
                ) : (
                  <>
                    <th className="px-4 py-2 text-right text-gray-600 whitespace-nowrap">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-right text-gray-600 whitespace-nowrap">
                      Total Amount
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(grouped).map(([cat, rows], i) =>
                rows.map((item, j) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      {j === 0 ? i + 1 : ""}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {j === 0 ? cat : ""}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.sub_category}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.description}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.quantity} {item.units}
                    </td>
                    {isActualBudget ? (
                      <td className="px-4 py-2 text-right text-blue-900 font-medium whitespace-nowrap">
                        {budget.currency?.symbol || "₹"}{" "}
                        {Number(item.actual_amount || 0).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>
                    ) : (
                      [
                        <td
                          key="amount"
                          className="px-4 py-2 text-right text-blue-700 whitespace-nowrap"
                        >
                          {budget.currency?.symbol || "₹"}{" "}
                          {Number(item.amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>,
                        <td
                          key="total"
                          className="px-4 py-2 text-right text-blue-900 font-medium whitespace-nowrap"
                        >
                          {budget.currency?.symbol || "₹"}{" "}
                          {Number(item.total_amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>,
                      ]
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 ">
          <p className="px-4 py-3 text-right text-blue-900 ">
            <span className="font-semibold"> Total {title} Amount: </span>
            {budget.currency?.symbol || "₹"}{" "}
            {totalSum.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    );
  };

  if (!isOpen || !budget) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh]  shadow-xl p-8">
        <div className="flex justify-between items-start border-b border-dashed pb-4 mb-3">
          <div>
            <h2 className="text-2xl font-bold text-red-500 mb-1">
              View Budget
            </h2>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">Budget ID: </span>
              {budget.budget_id}
            </p>
          </div>
          <div className="flex gap-2">
            <select
              className="text-sm border px-2 py-1 rounded bg-white shadow-sm"
              value={isActualBudget ? "actual" : "estimated"}
              onChange={(e) => setIsActualBudget(e.target.value === "actual")}
            >
              <option value="estimated" className="text-blue-700">
                Estimated Budget
              </option>
              <option value="actual" className="text-blue-700">
                Actual Budget
              </option>
            </select>
            <button
              onClick={onClose}
              className="text-2xl font-bold text-gray-600 hover:text-red-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto  max-h-[70vh] pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 mb-8">
            <div>
              <span className="font-semibold">Title:</span> {budget.title}
            </div>
            <div>
              <span className="font-semibold">Date:</span>{" "}
              {budget.date
                ? new Date(budget.date).toLocaleDateString()
                : `${new Date(
                    budget.from_date
                  ).toLocaleDateString()} - ${new Date(
                    budget.to_date
                  ).toLocaleDateString()}`}
            </div>
            <div>
              <span className="font-semibold">Created By:</span>{" "}
              {budget.creator?.name || "-"}
            </div>
          </div>

          {/* Budget Tables */}
          {renderTable("Expense", expenseItems, "rose")}
          {renderTable("Income", incomeItems, "green")}

          {/* Tax Section */}
          {appliedTaxes?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-purple-800  px-2 py-1 mb-3 rounded">
                Applied Taxes
              </h3>
              <div className="rounded-xl">
                <table className="w-full text-sm bg-white ">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="border px-3 py-2 text-left">Tax Name</th>
                      <th className="border px-3 py-2 text-left">Percentage</th>
                      <th className="border px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedTaxes.map((tax, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border px-3 py-2">{tax.tax_name}</td>
                        <td className="border px-3 py-2">{tax.percentage}%</td>
                        <td className="border px-3 py-2 text-right text-blue-900">
                          {budget.currency?.symbol || "₹"}{" "}
                          {tax.amount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50">
                <p className="px-4 py-3 text-right text-blue-900">
                  <span className="font-semibold">Total Tax Amount: </span>
                  {budget.currency?.symbol || "₹"}{" "}
                  {appliedTaxes
                    .reduce(
                      (sum, tax) => sum + (parseFloat(tax.amount) || 0),
                      0
                    )
                    .toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                </p>
              </div>
            </div>
          )}
          {renderTable("Sponsors", sponsersItems, "amber")}

          <div className="mb-8">
            <h3 className="text-lg font-bold text-indigo-700 mb-2">
              Budget Summary
            </h3>
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full text-sm border border-gray-200 bg-white rounded-md">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="border px-4 py-2 text-left whitespace-nowrap">
                      Total Income
                    </th>
                    <th className="border px-4 py-2 text-left whitespace-nowrap">
                      Total Sponsors
                    </th>
                    <th className="border px-4 py-2 text-left whitespace-nowrap">
                      Total Expense
                    </th>
                    <th className="border px-4 py-2 text-left whitespace-nowrap">
                      Total Tax
                    </th>
                    <th className="border px-4 py-2 text-left whitespace-nowrap">
                      Profit / Loss
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2 text-blue-800 font-medium whitespace-nowrap">
                      {budget.currency?.symbol || "₹"}{" "}
                      {totalIncome.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border px-4 py-2 text-yellow-700 font-medium whitespace-nowrap">
                      {budget.currency?.symbol || "₹"}{" "}
                      {totalSponsers.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border px-4 py-2 text-rose-700 font-medium whitespace-nowrap">
                      {budget.currency?.symbol || "₹"}{" "}
                      {totalExpense.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border px-4 py-2 text-purple-700 font-medium whitespace-nowrap">
                      {budget.currency?.symbol || "₹"}{" "}
                      {totalTax.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      className={`border px-4 py-2 font-bold whitespace-nowrap ${
                        profit >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {profit >= 0 ? "🔺 Profit: " : "🔻 Loss: "}
                      {budget.currency?.symbol || "₹"}{" "}
                      {Math.abs(profit).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm shadow"
          >
            Export to PDF
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-md text-sm shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewBudgetModal;
