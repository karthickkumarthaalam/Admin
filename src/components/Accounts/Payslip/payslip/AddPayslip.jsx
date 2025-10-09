import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../../utils/apiCall";

export const AddPayslip = ({ isOpen, onClose, onSuccess, editPayslipData }) => {
  const initialState = {
    user_id: "",
    currency_id: "",
    month: "",
    paid_date: "",
    items: [],
    paid_days: 0,
    lop_days: 0,
    total_earnings: 0,
    total_deductions: 0,
    net_salary: 0,
  };

  const [form, setForm] = useState(initialState);
  const [employeesList, setEmployeesList] = useState([]);
  const [currenciesList, setCurrenciesList] = useState([]);
  const [categoriesList, setcategoriesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedCurrency = useMemo(() => {
    return currenciesList.find((c) => c.id === Number(form.currency_id));
  }, [form.currency_id, currenciesList]);

  const currencySymbol = selectedCurrency?.symbol;

  const fetchDropDownData = async () => {
    try {
      const [currencyRes, userRes, categoriesRes] = await Promise.all([
        apiCall("/currency", "GET"),
        apiCall("/system-user", "GET"),
        apiCall("/payslip-category", "GET"),
      ]);

      setCurrenciesList(currencyRes.data);
      setEmployeesList(userRes.data);
      setcategoriesList(categoriesRes.data);
    } catch (error) {
      toast.error("Failed to load dropdown data");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDropDownData();
      if (editPayslipData) {
        setForm({
          user_id: editPayslipData.user_id,
          currency_id: editPayslipData.currency_id,
          month: editPayslipData.month,
          paid_date: editPayslipData.paid_date,
          paid_days: Number(editPayslipData.paid_days || 0),
          lop_days: Number(editPayslipData.lop_days || 0),
          total_deductions: Number(editPayslipData.total_deductions || 0),
          total_earnings: Number(editPayslipData.total_earnings || 0),
          net_salary: Number(editPayslipData.net_salary || 0),
          items: editPayslipData.items || [],
        });
      } else {
        setForm(initialState);
      }
    }
  }, [isOpen, editPayslipData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (!currencySymbol) {
      toast.error("Please select Currency");
      return;
    }
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { component_id: "", name: "", type: "", amount: 0 },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    const updated = [...form.items];
    updated.splice(index, 1);
    recalcTotals(updated);
    setForm((prev) => ({ ...prev, items: updated }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][field] = value;

    if (field === "component_id") {
      const category = categoriesList.find((c) => c.id === Number(value));
      if (category) {
        updatedItems[index].name = category.name;
        updatedItems[index].type = category.type;
        updatedItems[index].amount = category.default_amount || 0;
      }
    }

    recalcTotals(updatedItems);
    setForm((prev) => ({ ...prev, items: updatedItems }));
  };

  const recalcTotals = (updatedItems) => {
    const totalEarnings = updatedItems
      .filter((i) => i.type === "earning")
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    const totalDeductions = updatedItems
      .filter((i) => i.type === "deduction")
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    setForm((prev) => ({
      ...prev,
      total_earnings: totalEarnings,
      total_deductions: totalDeductions,
      net_salary: totalEarnings - totalDeductions,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!form.user_id || !form.currency_id || !form.month) {
        toast.error("User, Currency, and Month are required");
        return;
      }

      const endpoint = editPayslipData
        ? `/payslip/${editPayslipData.id}`
        : "/payslip";

      const method = editPayslipData ? "PUT" : "POST";

      await apiCall(endpoint, method, form);
      toast.success(
        editPayslipData
          ? "Payslip updated successfully"
          : "Payslip created successfully"
      );

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save payslip");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-4xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100  text-white rounded-t-2xl">
          <h2 className="text-lg font-semibold text-red-900 ">
            {editPayslipData ? "Edit Payslip" : "Add Payslip"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-800 hover:text-gray-900 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">
                Employee
              </label>
              <select
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="">Select Employee</option>
                {employeesList.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">
                Month
              </label>
              <input
                type="month"
                name="month"
                value={form.month}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">
                Paid Days
              </label>
              <input
                type="number"
                name="paid_days"
                value={form.paid_days}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">
                LOP Days
              </label>
              <input
                type="number"
                name="lop_days"
                value={form.lop_days}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">
                Currency
              </label>
              <select
                name="currency_id"
                value={form.currency_id}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="">Select Currency</option>
                {currenciesList.map((cur) => (
                  <option key={cur.id} value={cur.id}>
                    {cur.code} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">
                Paid Date
              </label>
              <input
                type="date"
                name="paid_date"
                value={form.paid_date}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 foscu:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payslip Items Table */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-red-900 text-base">
                Payslip Categories
              </h3>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-1 text-sm bg-green-50 text-green-600 border border-green-600 px-3 py-1.5 rounded-lg  hover:bg-green-100 transition"
              >
                <Plus size={14} /> Add Category
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                    <tr>
                      <th className="p-2 text-left border">Category</th>
                      <th className="p-2 text-center border">Type</th>
                      <th className="p-2 text-left border">Name</th>
                      <th className="p-2 text-right border">
                        Amount ({currencySymbol})
                      </th>
                      <th className="p-2 text-center border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center p-4 text-gray-500"
                        >
                          No components added yet
                        </td>
                      </tr>
                    ) : (
                      form.items.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="p-2 border">
                            <select
                              value={item.component_id}
                              onChange={(e) =>
                                handleItemChange(
                                  idx,
                                  "component_id",
                                  e.target.value
                                )
                              }
                              className="w-full border rounded p-1 focus:ring-2 focus:ring-red-500 focus:outline-none"
                            >
                              <option value="">Select</option>
                              {categoriesList.map((comp) => (
                                <option key={comp.id} value={comp.id}>
                                  {comp.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td
                            className={`p-2 text-center capitalize border font-medium ${
                              item.type === "earning"
                                ? "text-green-500"
                                : item.type === "deduction"
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {item.type || "-"}
                          </td>
                          <td className="p-2 border">
                            <input
                              value={item.name}
                              onChange={(e) =>
                                handleItemChange(idx, "name", e.target.value)
                              }
                              className="w-full border rounded p-1"
                            />
                          </td>
                          <td className="p-2 text-right border">
                            {currencySymbol}{" "}
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) =>
                                handleItemChange(idx, "amount", e.target.value)
                              }
                              className="w-24 border rounded p-1 text-right"
                            />
                          </td>
                          <td className="p-2 text-center border">
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="text-red-600 hover:text-red-800 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-4 text-right text-sm font-semibold space-y-1">
            <div className="text-gray-700 mb-2">
              Gross Earnings:{" "}
              <span className="text-green-600">
                {currencySymbol} {form.total_earnings.toFixed(2)}
              </span>
            </div>
            <div className="text-gray-700 mb-2">
              Total Deductions:{" "}
              <span className="text-red-600">
                {currencySymbol} {form.total_deductions.toFixed(2)}
              </span>
            </div>
            <div className="text-gray-900 text-base  ">
              Net Salary:{" "}
              <span className="text-blue-600 font-bold">
                {currencySymbol} {form.net_salary.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-100 rounded-b-2xl">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition shadow"
          >
            {loading ? "Saving..." : editPayslipData ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};
