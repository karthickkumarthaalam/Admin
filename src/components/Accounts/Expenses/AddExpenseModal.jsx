import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";

const AddExpenseModal = ({ isOpen, onClose, onSuccess, editExpenseData }) => {
  const [state, setState] = useState({
    documentNo: null,
    merchantName: "",
    date: "",
    status: "pending",
    paymentMode: "",
    paidThrough: "",
    completedDate: "",
    vendorType: "vendor",
    users: [],
    currencies: [],
    categories: [
      { category_name: "", description: "", amount: "", currency_name: "" },
    ],
    paymentModes: [],
    paidThroughOptions: [],
    showAddMode: false,
    newMode: "",
    showAddPaidThrough: false,
    newPaidThrough: "",
    totalAmount: 0,
    isMultiCurrency: false,
  });

  const {
    documentNo,
    merchantName,
    date,
    status,
    paymentMode,
    paidThrough,
    completedDate,
    vendorType,
    users,
    currencies,
    categories,
    paymentModes,
    paidThroughOptions,
    showAddMode,
    newMode,
    showAddPaidThrough,
    newPaidThrough,
    totalAmount,
    isMultiCurrency,
  } = state;

  useEffect(() => {
    if (isOpen) {
      const isEditing = !!editExpenseData;
      if (isEditing) {
        fetchCurrencies();
        setState((prev) => ({
          ...prev,
          documentNo: editExpenseData.document_id || "",
          merchantName: editExpenseData.merchant || "",
          date: editExpenseData.date || "",
          status: editExpenseData.status || "pending",
          paymentMode: editExpenseData?.paymentMode?.name || "",
          paidThrough: editExpenseData?.paidThrough?.name || "",
          categories: editExpenseData.categories.map((cat) => ({
            category_name: cat.category_name,
            amount: cat.amount,
            currency_name: cat.currency?.currency_name || "",
            description: cat.description,
          })),
          completedDate: editExpenseData.completed_date || "",
          vendorType: editExpenseData.vendor_type || "vendor",
        }));

        if (editExpenseData.vendor_type === "user") {
          fetchUsers();
        }
        if (editExpenseData.status === "completed") {
          fetchPaymentModes();
          fetchPaidThrough();
        }
      } else {
        fetchDocumentNo();
        fetchCurrencies();
        setState({
          documentNo: null,
          merchantName: "",
          date: "",
          status: "pending",
          paymentMode: "",
          paidThrough: "",
          completedDate: "",
          vendorType: "vendor",
          users: [],
          currencies: [],
          categories: [
            {
              category_name: "",
              description: "",
              amount: "",
              currency_name: "",
            },
          ],
          paymentModes: [],
          paidThroughOptions: [],
          showAddMode: false,
          newMode: "",
          showAddPaidThrough: false,
          newPaidThrough: "",
          totalAmount: 0,
          isMultiCurrency: false,
        });
      }
    }
  }, [isOpen, editExpenseData]);

  useEffect(() => {
    const currencySet = new Set(
      categories.map((cat) => cat.currency_name).filter(Boolean)
    );
    const multi = currencySet.size > 1;
    const sum = categories.reduce((acc, cat) => {
      const amt = parseFloat(cat.amount);
      return acc + (isNaN(amt) ? 0 : amt);
    }, 0);

    setState((prev) => ({
      ...prev,
      isMultiCurrency: multi,
      totalAmount: multi ? 0 : sum,
    }));
  }, [categories]);

  const fetchCurrencies = async () => {
    try {
      const res = await apiCall("/currency", "GET");
      setState((prev) => ({ ...prev, currencies: res.data }));
    } catch {
      toast.error("Failed to load currencies");
    }
  };

  const fetchDocumentNo = async () => {
    try {
      const res = await apiCall("/expense/document-no", "GET");
      setState((prev) => ({ ...prev, documentNo: res.document_no }));
    } catch {
      toast.error("Failed to fetch Document No");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiCall("/system-user", "GET");
      setState((prev) => ({ ...prev, users: res.data }));
    } catch (err) {
      toast.error("Failed to fetch users");
    }
  };

  const fetchPaymentModes = async () => {
    const res = await apiCall("/payment-mode", "GET");
    setState((prev) => ({ ...prev, paymentModes: res.data }));
  };

  const addNewPaymentMode = async () => {
    try {
      const res = await apiCall("/payment-mode", "POST", { name: newMode });
      setState((prev) => ({
        ...prev,
        paymentModes: [...prev.paymentModes, res.data],
        paymentMode: res.data.name,
        newMode: "",
        showAddMode: false,
      }));
    } catch {
      toast.error("Failed to add payment mode");
    }
  };

  const fetchPaidThrough = async () => {
    try {
      const res = await apiCall("/paid-through", "GET");
      setState((prev) => ({ ...prev, paidThroughOptions: res.data }));
    } catch {
      toast.error("Failed to fetch Paid Through options");
    }
  };

  const addPaidThrough = async () => {
    try {
      const res = await apiCall("/paid-through", "POST", {
        name: newPaidThrough,
      });
      setState((prev) => ({
        ...prev,
        paidThroughOptions: [...prev.paidThroughOptions, res.data],
        newPaidThrough: "",
        showAddPaidThrough: false,
      }));
    } catch (error) {
      toast.error("Failed to add Paid Through ");
    }
  };

  const handleCategoryChange = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;
    setState((prev) => ({ ...prev, categories: updated }));
  };

  const addCategory = () => {
    setState((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { category_name: "", description: "", amount: "", currency_name: "" },
      ],
    }));
  };

  const removeCategory = (index) => {
    const updated = [...categories];
    updated.splice(index, 1);
    setState((prev) => ({ ...prev, categories: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editExpenseData;
    const payload = {
      document_no: documentNo,
      merchant: merchantName,
      date,
      vendor_type: vendorType,
      expenseCategories: categories,
      status,
      ...(status === "completed" && {
        payment_mode: paymentMode,
        paid_through: paidThrough,
        completed_date: completedDate,
      }),
      ...(isMultiCurrency ? {} : { total_amount: totalAmount }),
    };
    try {
      if (isEditing) {
        await apiCall(`/expense/${editExpenseData.id}`, "PUT", payload);
        toast.success("Expense updated successfully");
      } else {
        await apiCall("/expense", "POST", payload);
        toast.success("Expense created successfully");
      }
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(
        error.message || `Failed to ${isEditing ? "update" : "create"} expense`
      );
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  if (!isOpen) return null;

  const currencySymbol = !isMultiCurrency
    ? currencies.find((c) => c.currency_name === categories[0]?.currency_name)
        ?.symbol || ""
    : "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-6xl p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-red-500"
        >
          <X size={22} />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {editExpenseData ? "Edit Expense" : "Add Expense"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Document No" value={documentNo || ""} readOnly />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expense For
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={vendorType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setState((prev) => ({ ...prev, vendorType: val }));
                    if (val === "user") fetchUsers();
                  }}
                >
                  <option value="vendor">Vendor</option>
                  <option value="user">User</option>
                </select>
              </div>
              {vendorType === "vendor" ? (
                <Input
                  label="Merchant Name"
                  value={merchantName}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      merchantName: e.target.value,
                    }))
                  }
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select User
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        merchantName: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) =>
                setState((prev) => ({ ...prev, date: e.target.value }))
              }
            />
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setState((prev) => ({
                    ...prev,
                    status: newStatus,
                    completedDate:
                      newStatus === "completed" ? getTodayDate() : "",
                  }));
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {status === "completed" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onFocus={fetchPaymentModes}
                  onChange={(e) =>
                    e.target.value === "add_new"
                      ? setState((prev) => ({ ...prev, showAddMode: true }))
                      : setState((prev) => ({
                          ...prev,
                          paymentMode: e.target.value,
                        }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {paymentModes.map((pm) => (
                    <option key={pm.id} value={pm.name}>
                      {pm.name}
                    </option>
                  ))}
                  <option value="add_new" className="text-blue-500">
                    + Add New
                  </option>
                </select>
                {showAddMode && (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={newMode}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          newMode: e.target.value,
                        }))
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                    <button
                      type="button"
                      onClick={addNewPaymentMode}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      +{" "}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          showAddMode: false,
                        }))
                      }
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      x
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Paid Through
                </label>
                <select
                  value={paidThrough}
                  onFocus={fetchPaidThrough}
                  onChange={(e) => {
                    if (e.target.value === "add_new") {
                      setState((prev) => ({
                        ...prev,
                        showAddPaidThrough: true,
                      }));
                    } else {
                      setState((prev) => ({
                        ...prev,
                        paidThrough: e.target.value,
                        showAddPaidThrough: false,
                      }));
                    }
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {paidThroughOptions.map((pt) => (
                    <option key={pt.id} value={pt.name}>
                      {pt.name}
                    </option>
                  ))}
                  <option value="add_new" className="text-blue-500">
                    + Add New
                  </option>
                </select>
                {showAddPaidThrough && (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={newPaidThrough}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          newPaidThrough: e.target.value,
                        }))
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                    <button
                      type="button"
                      onClick={addPaidThrough}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          showAddPaidThrough: false,
                        }))
                      }
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      x
                    </button>
                  </div>
                )}
              </div>
              <Input
                label="Completed Date"
                type="date"
                value={completedDate}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    completedDate: e.target.value,
                  }))
                }
              />
            </div>
          )}

          {/* Category Table */}
          <div>
            <h3 className="font-medium mb-2">Expense Categories</h3>
            <div className="overflow-hidden rounded-lg border">
              <div className="max-h-[180px] md:max-h-[220px] overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Currency</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">
                          <input
                            type="text"
                            value={cat.category_name}
                            onChange={(e) =>
                              handleCategoryChange(
                                index,
                                "category_name",
                                e.target.value
                              )
                            }
                            className="w-full border rounded px-2 py-1"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={cat.currency_name}
                            onChange={(e) =>
                              handleCategoryChange(
                                index,
                                "currency_name",
                                e.target.value
                              )
                            }
                            className="w-full border rounded px-2 py-1"
                          >
                            <option value="">Select</option>
                            {currencies.map((cur) => (
                              <option key={cur.id} value={cur.currency_name}>
                                {cur.code} - ({cur.symbol})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={cat.description}
                            onChange={(e) =>
                              handleCategoryChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full border rounded px-2 py-1"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={cat.amount}
                            onChange={(e) =>
                              handleCategoryChange(
                                index,
                                "amount",
                                e.target.value
                              )
                            }
                            className="w-full border rounded px-2 py-1"
                          />
                        </td>
                        <td className="p-2 text-center">
                          {categories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCategory(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {isMultiCurrency ? (
              <span className="text-sm text-red-500 p-2">
                Total cannot be calculated due to multiple currencies
              </span>
            ) : (
              <span className="p-2">
                Total:{" "}
                <span className="text-lg font-semibold">
                  {currencySymbol} {totalAmount.toLocaleString()}
                </span>
              </span>
            )}
            <button
              type="button"
              onClick={addCategory}
              className="mt-3 flex items-center text-sm text-blue-600 hover:underline"
            >
              <Plus size={16} className="mr-1" /> Add Another Row
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              {editExpenseData ? "Edit" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Input Component
const Input = ({ label, value, onChange, type = "text", readOnly = false }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none ${
        readOnly ? "bg-gray-100" : ""
      }`}
    />
  </div>
);

export default AddExpenseModal;
