import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../../utils/apiCall";

const AddBudgetTaxModal = ({ isOpen, onClose, editTaxData, onSuccess }) => {
  const [form, setForm] = useState(initialFormState());
  const [errors, setErrors] = useState({});

  function initialFormState() {
    return {
      tax_name: "",
      tax_percentage: "",
      description: "",
    };
  }

  useEffect(() => {
    if (isOpen) {
      editTaxData ? populateForm(editTaxData) : resetForm();
    }
  }, [isOpen, editTaxData]);

  const resetForm = () => {
    setForm(initialFormState());
    setErrors({});
  };

  const populateForm = (data) => {
    setForm({
      tax_name: data.tax_name || "",
      tax_percentage: data.tax_percentage?.toString() || "",
      description: data.description || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.tax_name) newErrors.tax_name = "Tax name is required.";
    if (!form.tax_percentage) {
      newErrors.tax_percentage = "Tax percentage is required.";
    } else if (isNaN(parseFloat(form.tax_percentage))) {
      newErrors.tax_percentage = "Tax percentage must be a number.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      tax_name: form.tax_name.trim(),
      tax_percentage: parseFloat(form.tax_percentage),
      description: form.description.trim(),
    };

    try {
      if (editTaxData) {
        await apiCall(`/budget-tax/${editTaxData.id}`, "PATCH", payload);
        toast.success("Tax updated successfully!");
      } else {
        await apiCall("/budget-tax", "POST", payload);
        toast.success("Tax created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save tax.");
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
          {editTaxData ? "Edit Budget Tax" : "Add Budget Tax"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {renderTextInput(
            "Tax Name",
            "tax_name",
            form.tax_name,
            handleChange,
            errors.tax_name
          )}
          {renderTextInput(
            "Tax Percentage (%)",
            "tax_percentage",
            form.tax_percentage,
            handleChange,
            errors.tax_percentage,
            "number"
          )}
        </div>

        <div className="mt-4">
          {renderTextarea(
            "Description (optional)",
            "description",
            form.description,
            handleChange
          )}
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
            className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
          >
            {editTaxData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  function renderTextInput(label, name, value, onChange, error, type = "text") {
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

export default AddBudgetTaxModal;
