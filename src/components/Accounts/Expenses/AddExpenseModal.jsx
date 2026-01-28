import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";

const AddExpenseModal = ({ isOpen, onClose, onSuccess, editExpenseData }) => {
  const [state, setState] = useState({
    documentNo: null,
    merchantName: "",
    addMerchant: "",
    addCategoryName: "",
    date: "",
    status: "pending",
    paymentMode: "",
    paidThrough: "",
    completedDate: "",
    vendorType: "vendor",
    users: [],
    creators: [],
    currencies: [],
    merchants: [],
    categoryNames: [],
    categories: [
      {
        category_name: "",
        description: "",
        amount: "",
        currency_name: "",
        actual_amount: "",
        paid_date: "",
      },
    ],
    paymentModes: [],
    paidThroughOptions: [],
    showAddMode: false,
    newMode: "",
    showAddPaidThrough: false,
    showAddMerchant: false,
    showAddCategoryIndex: null,
    newPaidThrough: "",
    totalAmount: 0,
    pendingAmount: 0,
    isMultiCurrency: false,
    remarks: "",
    errors: {},
  });

  const {
    documentNo,
    merchantName,
    addMerchant,
    date,
    status,
    paymentMode,
    paidThrough,
    completedDate,
    vendorType,
    users,
    creators,
    currencies,
    merchants,
    categoryNames,
    categories,
    paymentModes,
    paidThroughOptions,
    showAddMode,
    newMode,
    showAddPaidThrough,
    showAddMerchant,
    showAddCategoryIndex,
    newPaidThrough,
    totalAmount,
    isMultiCurrency,
    pendingAmount,
    remarks,
  } = state;

  useEffect(() => {
    if (isOpen) {
      const isEditing = !!editExpenseData;
      if (isEditing) {
        fetchCurrencies();
        fetchMerchant();
        fetchCategory();
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
            actual_amount: cat.actual_amount || 0,
            paid_date: cat.paid_date || "",
            currency_name: cat.currency?.currency_name || "",
            description: cat.description,
          })),
          completedDate: editExpenseData.completed_date || "",
          vendorType: editExpenseData.vendor_type || "vendor",
          remarks: editExpenseData.remarks,
        }));

        if (editExpenseData.vendor_type === "user") {
          fetchUsers();
        }
        if (editExpenseData.vendor_type === "creator") {
          fetchCreators();
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
          creators: [],
          currencies: [],
          categories: [
            {
              category_name: "",
              description: "",
              amount: "",
              currency_name: "",
              actual_amount: "",
              paid_date: "",
            },
          ],
          paymentModes: [],
          paidThroughOptions: [],
          merchants: [],
          categoryNames: [],
          showAddMode: false,
          newMode: "",
          showAddPaidThrough: false,
          showAddMerchant: null,
          showAddCategoryIndex: null,
          newPaidThrough: "",
          totalAmount: 0,
          pendingAmount: 0,
          isMultiCurrency: false,
          remarks: "",
        });
      }
    }
  }, [isOpen, editExpenseData]);

  useEffect(() => {
    const currencySet = new Set(
      categories.map((cat) => cat.currency_name).filter(Boolean),
    );
    const multi = currencySet.size > 1;
    const sum = categories.reduce((acc, cat) => {
      const amt = parseFloat(cat.amount) || 0;
      return acc + amt;
    }, 0);

    const paidSum = categories.reduce((acc, cat) => {
      const paidAmt = parseFloat(cat.actual_amount) || 0;
      return acc + paidAmt;
    }, 0);

    const pending = sum - paidSum;

    setState((prev) => ({
      ...prev,
      isMultiCurrency: multi,
      totalAmount: multi ? 0 : sum,
      pendingAmount: multi ? 0 : pending,
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

  const fetchMerchant = async () => {
    try {
      const res = await apiCall("/merchant", "GET");
      setState((prev) => ({ ...prev, merchants: res.data }));
    } catch (error) {
      toast.error("Failed to fetch Merchants");
    }
  };

  const fetchCreators = async () => {
    try {
      const res = await apiCall("/creator/list-creators", "GET");
      setState((prev) => ({ ...prev, creators: res.data }));
    } catch (error) {
      toast.error("Failed to fetch creators");
    }
  };

  const fetchCategory = async () => {
    try {
      const res = await apiCall("/category", "GET");
      setState((prev) => ({ ...prev, categoryNames: res.data }));
    } catch (error) {
      toast.error("Failed to fetch category");
    }
  };

  const addNewCategoryName = async (index) => {
    try {
      const res = await apiCall("/category", "POST", {
        category_name: state.addCategoryName,
      });

      const newCategory = res.data;

      const updatedCategories = [...categories];
      updatedCategories[index].category_name = newCategory.category_name;

      setState((prev) => ({
        ...prev,
        categoryNames: [...prev.categoryNames, newCategory],
        categories: updatedCategories,
        addCategoryName: "",
        showAddCategoryIndex: null,
      }));
    } catch (error) {
      toast.error("Failed to add Category");
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
    if (field === "actual_amount") {
      const isValid = validateActualAmount(index, value);
      if (!isValid) return;
    }
    const updated = [...categories];
    updated[index][field] = value;
    setState((prev) => ({ ...prev, categories: updated }));
  };

  const addCategory = () => {
    setState((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          category_name: "",
          description: "",
          amount: 0,
          currency_name: "",
          actual_amount: 0,
          paid_date: "",
        },
      ],
    }));
  };

  const removeCategory = (index) => {
    const updated = [...categories];
    updated.splice(index, 1);
    setState((prev) => ({ ...prev, categories: updated }));
  };

  const validateActualAmount = (index, value) => {
    const amount = parseFloat(categories[index].amount) || 0;
    const actualAmount = parseFloat(value) || 0;

    if (actualAmount > amount) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [`actual_amount_${index}`]:
            "Paid amount cannot be greater than amount",
        },
      }));
      return false;
    } else {
      const newErrors = { ...state.errors };
      delete newErrors[`actual_amount_${index}`];
      setState((prev) => ({ ...prev, errors: newErrors }));
      return true;
    }
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
      remarks: remarks,
      status,
      ...(status === "completed" && {
        payment_mode: paymentMode,
        paid_through: paidThrough,
        completed_date: completedDate,
      }),
      ...(isMultiCurrency
        ? {}
        : { total_amount: totalAmount, pending_amount: pendingAmount }),
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
        error.message || `Failed to ${isEditing ? "update" : "create"} expense`,
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] md:p-4">
      <div className="bg-slate-50 rounded-2xl w-full h-full flex flex-col overflow-hidden animate-fadeIn relative">
        {/* ─── Sticky Header ───────────────────── */}
        <div className="sticky top-0 z-10 bg-slate-50 border-b border-gray-200 flex justify-between items-center px-8 py-4">
          <h2 className="text-2xl font-bold text-red-600">
            {editExpenseData ? "Edit Expense" : "Add Expense"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-red-500 transition"
          >
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Top Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Document No" value={documentNo || ""} readOnly />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 font-semibold mb-1">
                    Expense For
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={vendorType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setState((prev) => ({ ...prev, vendorType: val }));
                      if (val === "user") fetchUsers();
                      if (val === "creator") fetchCreators();
                    }}
                  >
                    <option value="vendor">Vendor</option>
                    <option value="user">User</option>
                    <option value="creator">Podcast Creator</option>
                  </select>
                </div>
                {vendorType === "vendor" ? (
                  <div>
                    <label className="block text-sm  text-gray-700  font-semibold mb-1">
                      Merchant
                    </label>
                    <select
                      value={state.merchantName}
                      onFocus={fetchMerchant}
                      onChange={(e) => {
                        setState((prev) => ({
                          ...prev,
                          merchantName: e.target.value,
                          showAddMerchant: false,
                        }));
                      }}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select</option>
                      {merchants.map((m) => (
                        <option key={m.id} value={m.merchant_name}>
                          {m.merchant_name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : vendorType === "user" ? (
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Select User
                    </label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                      value={state.merchantName}
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
                ) : (
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Select Podcast Creator
                    </label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                      value={state.merchantName}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          merchantName: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Creator</option>
                      {creators.map((creator) => (
                        <option key={creator.id} value={creator.name}>
                          {creator.name}
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
                <label className="block text-sm text-gray-700  font-semibold mb-1">
                  Status
                </label>
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
                  <label className="block text-sm text-gray-700  font-semibold mb-1">
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
                  <label className="block text-sm text-gray-700  font-semibold mb-1">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Remarks"
                type="text"
                value={remarks}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, remarks: e.target.value }))
                }
              />
            </div>

            {/* Category Table */}
            <div>
              <h3 className="font-semibold mb-2">Expense Categories</h3>
              <div className="overflow-hidden rounded-lg border">
                <div className="max-h-[180px] md:max-h-[370px] overflow-y-auto scrollbar-thin">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-700 text-gray-100">
                      <tr>
                        <th className="p-2 text-left">Category</th>
                        <th className="p-2 text-left">Currency</th>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-left">Amount</th>
                        <th className="p-2 text-left whitespace-nowrap">
                          Paid Amount
                        </th>
                        <th className="p-2 text-left whitespace-nowrap">
                          Paid Date
                        </th>
                        <th className="p-2"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {categories.map((cat, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">
                            <select
                              value={cat.category_name}
                              onFocus={fetchCategory}
                              onChange={(e) => {
                                handleCategoryChange(
                                  index,
                                  "category_name",
                                  e.target.value,
                                );
                              }}
                              className="w-full border rounded px-2 py-1"
                            >
                              <option value="">Select Category</option>
                              {categoryNames.map((catOption) => (
                                <option
                                  key={catOption.id}
                                  value={catOption.category_name}
                                >
                                  {catOption.category_name}
                                </option>
                              ))}
                            </select>

                            {/* Show input only for the current row */}
                            {showAddCategoryIndex === index && (
                              <div className="mt-2 flex gap-2">
                                <input
                                  value={state.addCategoryName}
                                  onChange={(e) =>
                                    setState((prev) => ({
                                      ...prev,
                                      addCategoryName: e.target.value,
                                    }))
                                  }
                                  className="border px-2 py-1 rounded w-full"
                                />
                                <button
                                  type="button"
                                  onClick={() => addNewCategoryName(index)}
                                  className="px-3 py-1 bg-blue-500 text-white"
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  className="px-3 py-1 bg-red-500 text-white"
                                  onClick={() =>
                                    setState((prev) => ({
                                      ...prev,
                                      showAddCategoryIndex: null,
                                      addCategoryName: "",
                                    }))
                                  }
                                >
                                  x
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="p-2">
                            <select
                              value={cat.currency_name}
                              onChange={(e) =>
                                handleCategoryChange(
                                  index,
                                  "currency_name",
                                  e.target.value,
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
                                  e.target.value,
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
                                  e.target.value,
                                )
                              }
                              className="w-full border rounded px-2 py-1"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              type="number"
                              value={cat.actual_amount}
                              onChange={(e) =>
                                handleCategoryChange(
                                  index,
                                  "actual_amount",
                                  e.target.value,
                                )
                              }
                              className={`w-full border rounded px-2 py-1 ${
                                state.errors?.[`actual_amount_${index}`]
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {state.errors?.[`actual_amount_${index}`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {state.errors[`actual_amount_${index}`]}
                              </p>
                            )}
                          </td>

                          <td className="p-2">
                            <input
                              type="date"
                              value={cat.paid_date || ""}
                              onChange={(e) => {
                                handleCategoryChange(
                                  index,
                                  "paid_date",
                                  e.target.value || "",
                                );
                              }}
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
              <button
                type="button"
                onClick={addCategory}
                className="mt-3 flex items-center text-sm text-blue-600 hover:underline"
              >
                <Plus size={16} className="mr-1" /> Add Another Row
              </button>
              {isMultiCurrency ? (
                <span className="text-sm text-red-500 p-2">
                  Total cannot be calculated due to multiple currencies
                </span>
              ) : (
                <div className="flex flex-col text-right">
                  <span>
                    Total Amount:{" "}
                    <span className="text-lg font-semibold">
                      {currencySymbol} {totalAmount.toFixed(2)}
                    </span>
                  </span>
                  <span>
                    Pending Amount:{" "}
                    <span className="text-lg font-semibold">
                      {currencySymbol} {pendingAmount.toFixed(2)}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
          </form>
        </div>
        <div className="sticky bottom-0 z-10 bg-slate-100 border-t border-gray-200 flex justify-end gap-4 px-8 py-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            {editExpenseData ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Input Component
const Input = ({ label, value, onChange, type = "text", readOnly = false }) => (
  <div>
    <label className="block text-sm text-gray-700  font-semibold mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none ${
        readOnly ? "bg-gray-100 focus:ring-0" : ""
      }`}
    />
  </div>
);

export default AddExpenseModal;
