import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const AddDepartmentModal = ({ isOpen, onClose, editDeptData, onSuccess }) => {
  const [form, setForm] = useState(initialFormState());
  const [errors, setErrors] = useState({});

  function initialFormState() {
    return {
      department_name: "",
      description: "",
      status: "active",
    };
  }

  useEffect(() => {
    if (isOpen) {
      editDeptData ? populateForm(editDeptData) : resetForm();
    }
  }, [isOpen, editDeptData]);

  const resetForm = () => {
    setForm(initialFormState());
    setErrors({});
  };

  const populateForm = (data) => {
    setForm({
      department_name: data.department_name || "",
      description: data.description || "",
      status: data.status || "active",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.department_name)
      newErrors.department_name = "Department name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editDeptData) {
        await apiCall(`/departments/${editDeptData.id}`, "PUT", form);
        toast.success("Department updated successfully!");
      } else {
        await apiCall("/departments/create", "POST", form);
        toast.success("Department created successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save department.");
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
          {editDeptData ? "Edit Department" : "Add Department"}
        </h2>

        {renderTextInput(
          "Department Name",
          "department_name",
          form.department_name,
          handleChange,
          errors.department_name
        )}

        {renderTextareaInput(
          "Description",
          "description",
          form.description,
          handleChange
        )}

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
            {editDeptData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  // Input render functions
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

  function renderTextareaInput(label, name, value, onChange) {
    return (
      <div className="flex flex-col mt-4">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows="3"
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        ></textarea>
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

export default AddDepartmentModal;
