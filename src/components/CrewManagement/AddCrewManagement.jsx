import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../utils/apiCall";
import { X } from "lucide-react";

const AddCrewManagement = ({ isOpen, onClose, onSuccess, editCrewData }) => {
  const initialFormState = {
    title: "",
    description: "",
    email: "",
  };

  const [form, setForm] = useState(initialFormState);
  const [crewId, setCrewId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const populateForm = (data) => {
    setForm({
      title: data.title,
      description: data.description,
      email: data.email,
    });
  };

  const resetForm = () => {
    setForm(initialFormState);
    setErrors({});
  };

  const fetchCrewId = async () => {
    try {
      const res = await apiCall("/crew-management/crew-id", "GET");
      setCrewId(res.crew_id);
    } catch (error) {
      toast.error("Failed to fetch crew ID");
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (editCrewData) {
        populateForm(editCrewData);
        setCrewId(editCrewData.crew_id);
      } else {
        fetchCrewId();
        resetForm();
      }
    }
  }, [isOpen, editCrewData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm) return;

    const payload = {
      crew_id: crewId,
      title: form.title?.trim() || "",
      email: form.email?.trim() || "",
      description: form.description?.trim() || "",
    };

    try {
      setLoading(true);
      if (editCrewData) {
        await apiCall(`/crew-management/${editCrewData.id}`, "PUT", payload);
        toast.success("Crew updated successfully");
      } else {
        await apiCall("/crew-management", "POST", payload);
        toast.success("Crew added successfully");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to save Crew");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl p-6 relative animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {editCrewData ? "Edit Crew" : "Add Crew"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            <X size={18} />
          </button>
        </div>

        {/* Crew ID */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Crew ID
          </label>
          <input
            type="text"
            value={crewId || ""}
            readOnly
            className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-600 text-sm focus:outline-none"
          />
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter crew title"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              errors.title
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-400"
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Crew Admin Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Add Client email"
            className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-none focus:ring-blue-400`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter description"
            rows={5}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm rounded-md bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 disabled:opacity-60"
          >
            {loading && (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            )}
            {editCrewData ? "Update Crew" : "Save Crew"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCrewManagement;
