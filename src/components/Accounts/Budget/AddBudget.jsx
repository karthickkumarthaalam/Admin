import React, { useEffect, useState } from "react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";
import { X } from "lucide-react";

const AddBudget = ({ isOpen, onClose, onSuccess, editBudgetData }) => {
  const [form, setForm] = useState(initialFormState());
  const [budgetId, setBudgetId] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function initialFormState() {
    return {
      title: "",
      date: "",
      from_date: "",
      to_date: "",
      currency_id: "",
      description: "",
      multiple_date: false,
    };
  }

  useEffect(() => {
    if (isOpen) {
      if (editBudgetData) {
        populateForm(editBudgetData);
        setBudgetId(editBudgetData.budget_id);
      } else {
        fetchBudgetId();
        resetForm();
      }

      fetchCurrencies();
    }
  }, [isOpen, editBudgetData]);

  const fetchBudgetId = async () => {
    try {
      const res = await apiCall("/budget/next-budget_id", "GET");
      setBudgetId(res.budget_id);
    } catch (error) {
      toast.error("Failed to fetch Budget ID");
    }
  };

  const fetchCurrencies = async () => {
    try {
      const res = await apiCall("/currency?limit=100", "GET");
      setCurrencies(res.data || []);
    } catch {
      toast.error("Failed to load currencies");
    }
  };

  const populateForm = (data) => {
    setForm({
      title: data.title || "",
      date: data.date || "",
      from_date: data.from_date || "",
      to_date: data.to_date || "",
      currency_id: data.currency_id || "",
      description: data.description || "",
      multiple_date: !!data.from_date || !!data.to_date,
    });
  };

  const resetForm = () => {
    setForm(initialFormState());
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title) newErrors.title = "Title is required.";
    if (!form.currency_id) newErrors.currency_id = "Currency is required.";

    if (form.multiple_date) {
      if (!form.from_date) newErrors.from_date = "From date is required.";
      if (!form.to_date) newErrors.to_date = "To date is required.";
    } else {
      if (!form.date) newErrors.date = "Date is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      budget_id: budgetId,
      title: form.title.trim(),
      currency_id: form.currency_id,
      description: form.description.trim(),
      multiple_date: form.multiple_date,
      from_date: form.multiple_date ? form.from_date : null,
      to_date: form.multiple_date ? form.to_date : null,
      date: form.multiple_date ? null : form.date,
    };

    try {
      setLoading(true);
      if (editBudgetData) {
        await apiCall(`/budget/${editBudgetData.id}`, "PATCH", payload);
        toast.success("Budget updated successfully!");
      } else {
        await apiCall("/budget", "POST", payload);
        toast.success("Budget created successfully!");
      }
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Failed to save budget.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-xl p-6 relative overflow-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {editBudgetData ? "Edit Budget" : "Add New Budget"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {renderReadOnlyInput("Budget ID", budgetId)}

          {renderInput(
            "Title",
            "title",
            form.title,
            handleChange,
            errors.title
          )}

          <div className="flex items-center gap-2 col-span-2 mt-2">
            <input
              type="checkbox"
              name="multiple_date"
              checked={form.multiple_date}
              onChange={handleChange}
            />
            <label className="text-sm font-medium">
              Use multiple date range
            </label>
          </div>

          {form.multiple_date ? (
            <>
              {renderInput(
                "From Date",
                "from_date",
                form.from_date,
                handleChange,
                errors.from_date,
                "date"
              )}
              {renderInput(
                "To Date",
                "to_date",
                form.to_date,
                handleChange,
                errors.to_date,
                "date"
              )}
            </>
          ) : (
            renderInput(
              "Date",
              "date",
              form.date,
              handleChange,
              errors.date,
              "date"
            )
          )}

          <div className="col-span-2">
            <label className="font-semibold mb-1 text-sm">Currency</label>
            <select
              name="currency_id"
              value={form.currency_id}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="">Select Currency</option>
              {currencies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.symbol}
                </option>
              ))}
            </select>
            {errors.currency_id && (
              <p className="text-sm text-red-500">{errors.currency_id}</p>
            )}
          </div>

          <div className="col-span-2">
            {renderTextarea(
              "Description (optional)",
              "description",
              form.description,
              handleChange
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
          >
            {loading
              ? "Saving..."
              : editBudgetData
              ? "Update Budget"
              : "Create Budget"}
          </button>
        </div>
      </div>
    </div>
  );

  function renderInput(label, name, value, onChange, error, type = "text") {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  function renderReadOnlyInput(label, value) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <input
          type="text"
          value={value || ""}
          readOnly
          className="border rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
        />
      </div>
    );
  }

  function renderTextarea(label, name, value, onChange) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={4}
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
        />
      </div>
    );
  }
};

export default AddBudget;
