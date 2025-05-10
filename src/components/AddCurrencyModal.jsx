import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { toast } from "react-toastify";

const AddCurrencyModal = ({ isOpen, onClose, editCurrencyData, onSuccess }) => {
  const [form, setForm] = useState({
    country_name: "",
    currency_name: "",
    code: "",
    symbol: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      resetForm();
      if (editCurrencyData) populateForm(editCurrencyData);
    }
  }, [isOpen, editCurrencyData]);

  const resetForm = () => {
    setForm({
      country_name: "",
      currency_name: "",
      code: "",
      symbol: "",
    });
    setErrors({});
  };

  const populateForm = (data) => {
    setForm({
      country_name: data.country_name || "",
      currency_name: data.currency_name || "",
      code: data.code || "",
      symbol: data.symbol || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value.trim() });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.country_name) newErrors.country_name = "Country name is required";
    if (!form.currency_name)
      newErrors.currency_name = "Currency name is required.";
    if (!form.code) newErrors.code = "Currency code is required.";
    if (!form.symbol) newErrors.symbol = "Currency symbol is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        country_name: form.country_name,
        currency_name: form.currency_name,
        code: form.code,
        symbol: form.symbol,
      };

      if (editCurrencyData) {
        await apiCall(`/currency/${editCurrencyData.id}`, "PUT", payload);
        toast.success("Currency updated successfully!");
      } else {
        await apiCall("/currency", "POST", payload);
        toast.success("Currency created successfully!");
      }

      onSuccess();
    } catch (error) {
      toast.error("Failed to save currency");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-4xl p-6 relative overflow-auto max-h-[90vh] sm:max-h-[80vh]">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {editCurrencyData ? "Edit Currency" : "Add Currency"}
        </h2>

        <div className="space-y-4">
          {/* Country Name */}
          <div className="flex flex-col">
            <label htmlFor="country_name" className="font-medium mb-1 text-sm">
              Country Name
            </label>
            <input
              type="text"
              name="country_name"
              id="country_name"
              placeholder="Country Name"
              value={form.country_name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            {errors.country_name && (
              <p className="text-sm text-red-500">{errors.country_name}</p>
            )}
          </div>

          {/* Currency Name */}
          <div className="flex flex-col">
            <label htmlFor="currency_name" className="font-medium mb-1 text-sm">
              Currency Name
            </label>
            <input
              type="text"
              name="currency_name"
              id="currency_name"
              placeholder="Currency Name"
              value={form.currency_name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            {errors.currency_name && (
              <p className="text-sm text-red-500">{errors.currency_name}</p>
            )}
          </div>

          {/* Currency Code */}
          <div className="flex flex-col">
            <label htmlFor="code" className="font-medium mb-1 text-sm">
              Code
            </label>
            <input
              type="text"
              name="code"
              id="code"
              placeholder="Code"
              value={form.code}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            {errors.currency_code && (
              <p className="text-sm text-red-500">{errors.code}</p>
            )}
          </div>

          {/* Currency Symbol */}
          <div className="flex flex-col">
            <label htmlFor="symbol" className="font-medium mb-1 text-sm">
              Symbol
            </label>
            <input
              type="text"
              name="symbol"
              id="symbol"
              placeholder="Symbol"
              value={form.symbol}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            {errors.currency_symbol && (
              <p className="text-sm text-red-500">{errors.symbol}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
          >
            {editCurrencyData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCurrencyModal;
