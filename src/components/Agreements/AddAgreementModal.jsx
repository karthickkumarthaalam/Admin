import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../utils/apiCall";

const AddAgreementModal = ({
  isOpen,
  onClose,
  onSuccess,
  editAgreementData,
}) => {
  const [form, setForm] = useState(initialFormState());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState(null);

  function initialFormState() {
    return {
      title: "",
      document_number: "",
      date: "",
      category: "",
    };
  }

  const generateDocumentNumber = async () => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");

    try {
      const res = await apiCall(
        `/agreements/last-dcoument-number?date=${dateStr}`
      );
      const lastNumber = res?.lastNumber || 0;
      const newNumber = String(lastNumber + 1).padStart(3, "0");
      const documentNo = `TMA${dateStr}-${newNumber}`;

      setForm((prev) => ({ ...prev, document_number: documentNo }));
    } catch (error) {
      console.error("Failed to generate document number", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiCall("/agreement-category", "GET");
      setCategories(res?.data);
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (editAgreementData) {
        populateForm(editAgreementData);
      } else {
        resetForm();
        generateDocumentNumber();
      }
    }
  }, [isOpen, editAgreementData]);

  const populateForm = (data) => {
    setForm({
      title: data.title || "",
      document_number: data.document_number || "",
      date: data.date ? data.date.split("T")[0] : "",
      category: data.category || "",
    });
  };

  const resetForm = () => {
    setForm(initialFormState());
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title) newErrors.title = "Title is required.";
    if (!form.date) newErrors.date = "Date is required.";
    if (!form.category) newErrors.category = "Category is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("document_number", form.document_number);
      formData.append("date", form.date);
      formData.append("category", form.category);

      if (editAgreementData) {
        await apiCall(
          `/agreements/update/${editAgreementData.id}`,
          "put",
          formData
        );
        toast.success("Agreement updated successfully");
      } else {
        await apiCall("/agreements/create", "POST", formData);
        toast.success("Agreement created successfully!");
      }
      onSuccess();
    } catch (error) {
      toast.error("Failed to create agreement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
        <div className="bg-white rounded-xl w-full max-w-xl p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>

          <h2 className="text-xl font-semibold mb-4 text-red-600">
            {editAgreementData ? "Edit Agreement" : "Add Agreement"}
          </h2>

          <div className="flex flex-col mb-4">
            <label className="font-semibold mb-1 text-sm">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={`border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none ${
                errors.title ? "border-red-500" : ""
              }`}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="flex flex-col mb-4">
            <label className="font-semibold mb-1 text-sm">Document No</label>
            <input
              type="text"
              name="document_number"
              value={form.document_number}
              onChange={handleChange}
              readOnly
              className="border rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col mb-4">
            <label className="font-semibold mb-1 text-sm">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={`border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none ${
                errors.date ? "border-red-500" : ""
              }`}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          <div className="flex flex-col mb-4">
            <label className="font-semibold mb-1 text-sm">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none ${
                errors.category ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Category</option>
              {categories &&
                categories.map((cat) => (
                  <option key={cat.id} value={cat.category_name}>
                    {cat.category_name}
                  </option>
                ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div className="flex justify-between gap-3 mt-6">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddAgreementModal;
