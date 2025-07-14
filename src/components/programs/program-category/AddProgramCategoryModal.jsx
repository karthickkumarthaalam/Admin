import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const AddProgramCategoryModal = ({
  isOpen,
  onClose,
  editCategoryData,
  onSuccess,
}) => {
  const [form, setForm] = useState(initialFormState());
  const [errors, setErrors] = useState({});

  function initialFormState() {
    return {
      category: "",
      start_time: "",
      end_time: "",
      country: "",
      status: "in-active",
    };
  }

  useEffect(() => {
    if (isOpen) {
      editCategoryData ? populateForm(editCategoryData) : resetForm();
    }
  }, [isOpen, editCategoryData]);

  const resetForm = () => {
    setForm(initialFormState());
    setErrors({});
  };

  const populateForm = (data) => {
    setForm({
      category: data.category || "",
      start_time: data.start_time || "",
      end_time: data.end_time || "",
      country: data.country || "",
      status: data.status || "in-active",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.category) newErrors.category = "Category is required.";
    if (!form.start_time) newErrors.start_time = "Start time is required.";
    if (!form.end_time) newErrors.end_time = "End time is required.";
    if (!form.country) newErrors.country = "Country is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editCategoryData) {
        await apiCall(`/program-category/${editCategoryData.id}`, "PUT", form);
        toast.success("Program category updated successfully!");
      } else {
        await apiCall("/program-category/create", "POST", form);
        toast.success("Program category created successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save program category.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative overflow-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {editCategoryData ? "Edit Program Category" : "Add Program Category"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {renderTextInput(
            "Category",
            "category",
            form.category,
            handleChange,
            errors.category
          )}
          {renderTimeInput(
            "Start Time",
            "start_time",
            form.start_time,
            handleChange,
            errors.start_time
          )}
          {renderTimeInput(
            "End Time",
            "end_time",
            form.end_time,
            handleChange,
            errors.end_time
          )}
          {renderSelectInput(
            "Country",
            "country",
            form.country,
            handleChange,
            ["Switzerland"],
            errors.country
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
            {editCategoryData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  function renderTextInput(label, name, value, onChange, error) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  function renderTimeInput(label, name, value, onChange, error) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <input
          type="time"
          name={name}
          value={value}
          onChange={onChange}
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  function renderSelectInput(label, name, value, onChange, options, error) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
};

export default AddProgramCategoryModal;
