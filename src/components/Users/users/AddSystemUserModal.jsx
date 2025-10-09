import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Settings,
  Phone,
  Building2,
  Upload,
  Banknote,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AddSystemUserModal = ({ isOpen, onClose, editUserData, onSuccess }) => {
  const [form, setForm] = useState(initialFormState());
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  function initialFormState() {
    return {
      name: "",
      email: "",
      employee_id: "",
      gender: "",
      department_id: "",
      date_of_birth: "",
      phone_number: "",
      whatsapp_number: "",
      address: "",
      description: "",
      image: null,
      status: "inactive",
      share_access: false,
      is_admin: false,
      show_profile: false,
      bank_name: "",
      ifsc_code: "",
      account_number: "",
      pan_number: "",
      uan_number: "",
    };
  }

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      editUserData ? populateForm(editUserData) : resetForm();
    }
  }, [isOpen, editUserData]);

  const fetchDepartments = async () => {
    try {
      const res = await apiCall("/departments?limit=50&status=active", "GET");
      setDepartments(res.data);
    } catch {
      toast.error("Failed to fetch departments.");
    }
  };

  const resetForm = () => {
    setForm(initialFormState());
    setErrors({});
    setImagePreview(null);
  };

  const populateForm = (data) => {
    setForm({
      ...form,
      name: data.name || "",
      email: data.email || "",
      employee_id: data.employee_id || "",
      gender: data.gender || "",
      department_id: data.department_id || "",
      date_of_birth: data.date_of_birth ? data.date_of_birth.split("T")[0] : "",
      phone_number: data.phone_number || "",
      whatsapp_number: data.whatsapp_number || "",
      address: data.address || "",
      description: data.description || "",
      status: data.status || "inactive",
      share_access: data.share_access || false,
      is_admin: data.is_admin || false,
      show_profile: data.show_profile || false,
      bank_name: data.bank_name || "",
      account_number: data.account_number || "",
      ifsc_code: data.ifsc_code || "",
      pan_number: data.pan_number || "",
      uan_number: data.uan_number || "",
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
    setLoading(true);
    try {
      const payload = new FormData();
      for (const key in form) {
        if (key === "image" && form.image) {
          payload.append("profile_image", form.image);
        } else {
          payload.append(key, form[key]);
        }
      }

      if (editUserData) {
        await apiCall(
          `/system-user/update/${editUserData.id}`,
          "PATCH",
          payload
        );
        toast.success("System user updated successfully!");
      } else {
        await apiCall("/system-user/create", "POST", payload);
        toast.success("System user created successfully!");
      }

      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to save system user.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl  relative max-h-[95vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0  w-full bg-gradient-to-t from-gray-100 to-gray-200 border-b p-4 border-gray-300 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <User className="text-red-500" size={22} />
            {editUserData ? "Edit System User" : "Add System User"}
          </h2>
          <button
            onClick={onClose}
            className=" text-red-500 hover:text-red-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* GROUP 1 - Personal Information */}
        <div className="p-6">
          <SectionCard icon={<User size={18} />} title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
              />
              <TextInput
                label="Employee ID"
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
              />
              <SelectInput
                label="Department"
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                options={departments.map((d) => ({
                  label: d.department_name,
                  value: d.id,
                }))}
              />
              <FileInput
                label="Profile Image"
                onChange={handleFileChange}
                preview={imagePreview}
              />
              <SelectInput
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                options={["Male", "Female", "Other"]}
              />
              <DateInput
                label="Date of Birth"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
              />
            </div>
          </SectionCard>

          {/* GROUP 2 - Contact Details */}
          <SectionCard icon={<Phone size={18} />} title="Contact Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
              />
              <TextInput
                label="Phone Number"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
              />
              <TextInput
                label="WhatsApp Number"
                name="whatsapp_number"
                value={form.whatsapp_number}
                onChange={handleChange}
              />
            </div>
            <TextArea
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
            />
          </SectionCard>

          <SectionCard icon={<Banknote size={18} />} title="Bank Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput
                label="Bank Name"
                name="bank_name"
                value={form.bank_name}
                onChange={handleChange}
              />
              <TextInput
                label="Account Number"
                name="account_number"
                value={form.account_number}
                onChange={handleChange}
              />
              <TextInput
                label="IFSC Code"
                name="ifsc_code"
                value={form.ifsc_code}
                onChange={handleChange}
              />
              <TextInput
                label="PAN Number"
                name="pan_number"
                value={form.pan_number}
                onChange={handleChange}
              />
              <TextInput
                label="UAN Number"
                name="uan_number"
                value={form.uan_number}
                onChange={handleChange}
              />
            </div>
          </SectionCard>

          {/* GROUP 3 - Additional Info */}
          <SectionCard icon={<Building2 size={18} />} title="Additional Info">
            <TextArea
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </SectionCard>

          {/* GROUP 4 - Account Settings */}
          <SectionCard icon={<Settings size={18} />} title="Account Settings">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Checkbox
                label="Show Profile"
                checked={form.show_profile}
                onChange={() =>
                  setForm((p) => ({ ...p, show_profile: !p.show_profile }))
                }
              />
              <Checkbox
                label="Share Password"
                checked={form.share_access}
                onChange={() =>
                  setForm((p) => ({ ...p, share_access: !p.share_access }))
                }
              />
              <Checkbox
                label="Admin Access"
                checked={form.is_admin}
                onChange={() =>
                  setForm((p) => ({ ...p, is_admin: !p.is_admin }))
                }
              />
            </div>
          </SectionCard>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 border-t pt-4">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-5 py-2 text-sm rounded-lg text-white transition ${
                loading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {loading
                ? editUserData
                  ? "Updating..."
                  : "Saving..."
                : editUserData
                ? "Update"
                : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------- */
/* Reusable Components           */
/* ----------------------------- */
const SectionCard = ({ icon, title, children }) => (
  <div className="border border-gray-200 rounded-xl p-5 mb-6 shadow-sm bg-gray-50 hover:bg-gray-100 transition">
    <div className="flex items-center gap-2 mb-3">
      <div className="text-red-500">{icon}</div>
      <h3 className="font-semibold text-gray-800 text-base">{title}</h3>
    </div>
    <div>{children}</div>
  </div>
);

const TextInput = ({ label, name, value, onChange, error }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-800 mb-1">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SelectInput = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-800 mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
    >
      <option value="">Select {label}</option>
      {options.map((opt) =>
        typeof opt === "string" ? (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ) : (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        )
      )}
    </select>
  </div>
);

const DateInput = ({ label, name, value, onChange }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-800 mb-1">{label}</label>
    <input
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
    />
  </div>
);

const FileInput = ({ label, onChange, preview }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-800 mb-2">{label}</label>
    <label className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-red-400 transition bg-white">
      <Upload size={18} className="text-gray-500" />
      <span className="text-gray-600 text-sm">Upload Image</span>
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />
    </label>
    {preview && (
      <img
        src={preview}
        alt="Preview"
        className="mt-3 w-28 h-28 object-fit rounded-lg border shadow-sm"
      />
    )}
  </div>
);

const TextArea = ({ label, name, value, onChange, rows = 3 }) => (
  <div className="flex flex-col mt-3">
    <label className="font-medium text-sm text-gray-800 mb-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
    />
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 accent-red-500 rounded focus:ring-2 focus:ring-red-400"
    />
    {label}
  </label>
);

export default AddSystemUserModal;
