import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiCall } from "../../utils/apiCall";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AddRjProfileModal = ({ isOpen, onClose, editRjData, onSuccess }) => {
  const [form, setForm] = useState(initialFormState());
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  function initialFormState() {
    return {
      name: "",
      email: "",
      gender: "",
      date_of_birth: "",
      phone_number: "",
      whatsapp_number: "",
      address: "",
      description: "",
      image: null,
      status: "active",
    };
  }

  useEffect(() => {
    if (isOpen) {
      editRjData ? populateForm(editRjData) : resetForm();
    }
  }, [isOpen, editRjData]);

  const resetForm = () => {
    setForm(initialFormState());
    setErrors({});
    setImagePreview(null);
  };

  const populateForm = (data) => {
    setForm({
      name: data.name || "",
      email: data.email || "",
      gender: data.gender || "",
      date_of_birth: data.date_of_birth ? data.date_of_birth.split("T")[0] : "",
      phone_number: data.phone_number || "",
      whatsapp_number: data.whatsapp_number || "",
      address: data.address || "",
      description: data.description || "",
      image: null,
      status: data.status || "active",
    });
    setImagePreview(
      data.image_url
        ? `${BASE_URL}/${data.image_url.replace(/\\/g, "/")}`
        : null
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required.";
    if (!form.email) newErrors.email = "Email is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const payload = new FormData();
      for (const key in form) {
        if (key === "image" && form.image) {
          payload.append("profile_image", form.image);
        } else {
          payload.append(key, form[key]);
        }
      }

      if (editRjData) {
        await apiCall(`/rj-profile/update/${editRjData.id}`, "PATCH", payload);
        toast.success("RJ profile updated successfully!");
      } else {
        await apiCall("/rj-profile/create", "POST", payload);
        toast.success("RJ profile created successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save RJ profile.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 relative overflow-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {editRjData ? "Edit RJ Profile" : "Add RJ Profile"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {renderTextInput(
            "Name",
            "name",
            form.name,
            handleChange,
            errors.name
          )}
          {renderTextInput(
            "Email",
            "email",
            form.email,
            handleChange,
            errors.email
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {renderSelectInput("Gender", "gender", form.gender, handleChange, [
            "Male",
            "Female",
            "Other",
          ])}
          {renderDateInput(
            "Date of Birth",
            "date_of_birth",
            form.date_of_birth,
            handleChange
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {renderTextInput(
            "Phone Number",
            "phone_number",
            form.phone_number,
            handleChange
          )}
          {renderTextInput(
            "WhatsApp Number",
            "whatsapp_number",
            form.whatsapp_number,
            handleChange
          )}
        </div>

        {renderTextArea("Address", "address", form.address, handleChange)}
        {renderTextArea(
          "Description",
          "description",
          form.description,
          handleChange
        )}

        {renderFileInput(
          "Profile Image",
          "image",
          handleFileChange,
          imagePreview
        )}

        <div className="mt-4">
          <label className="font-semibold mb-1 text-sm">Status</label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="status"
                value="active"
                checked={form.status === "active"}
                onChange={handleChange}
              />
              Active
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={form.status === "inactive"}
                onChange={handleChange}
              />
              Inactive
            </label>
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
            className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
          >
            {editRjData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  function renderTextInput(label, name, value, onChange, error) {
    return (
      <div className="mt-4 flex flex-col">
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

  function renderTextArea(label, name, value, onChange) {
    return (
      <div className="mt-4 flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows="3"
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
      </div>
    );
  }

  function renderSelectInput(label, name, value, onChange, options) {
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
      </div>
    );
  }

  function renderDateInput(label, name, value, onChange) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
      </div>
    );
  }

  function renderFileInput(label, name, onChange, preview) {
    return (
      <div className="mt-4 flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <input type="file" accept="image/*" onChange={onChange} />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-2 w-full max-h-60 object-contain rounded"
          />
        )}
      </div>
    );
  }
};

export default AddRjProfileModal;
