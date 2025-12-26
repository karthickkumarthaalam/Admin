import React, { useState, useEffect } from "react";
import {
  User,
  Settings,
  Phone,
  Building2,
  Upload,
  Banknote,
  Save,
  RotateCcw,
  X,
  Trash2,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UserDetailsTab = ({ onSuccess, onClose, editUserData }) => {
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
      date_of_joining: "",
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
      remove_image: false,
    };
  }

  useEffect(() => {
    fetchDepartments();
    if (editUserData) {
      populateForm(editUserData);
    }
  }, [editUserData]);

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
      date_of_joining: data.date_of_joining ? data.date_of_joining : "",
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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setForm((prev) => ({ ...prev, image: file }));
      const fileReader = new FileReader();

      fileReader.onload = () => {
        setImagePreview(fileReader.result);
      };

      fileReader.onerror = () => {
        console.error("File reading failed");
      };

      fileReader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.department_id) newErrors.department_id = "Department is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.phone_number) {
      newErrors.phone_number = "Please enter a  phone number";
    }
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
        toast.success("User updated successfully!");
      } else {
        await apiCall("/system-user/create", "POST", payload);
        toast.success("User created successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save user details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    if (!imagePreview) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to remove the current image?"
    );
    if (!confirmDelete) return;

    // Reset both preview and file
    setImagePreview(null);
    setForm((prev) => ({
      ...prev,
      image: null,
      remove_image: true,
    }));

    toast.info("Profile image removed.");
  };

  return (
    <div className="space-y-6 ">
      {/* Personal Information Section */}
      <SectionCard
        icon={<User className="text-blue-600" size={20} />}
        title="Personal Information"
        description="Basic personal details and identification"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TextInput
            label="Full Name *"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter full name"
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
          <TextInput
            label="Employee ID"
            name="employee_id"
            value={form.employee_id}
            onChange={handleChange}
            placeholder="Enter employee ID"
          />
          <SelectInput
            label="Department *"
            name="department_id"
            value={form.department_id}
            onChange={handleChange}
            options={departments.map((d) => ({
              label: d.department_name,
              value: d.id,
            }))}
            error={errors.department_id}
          />
          <DateInput
            label="Date of Joining"
            name="date_of_joining"
            value={form.date_of_joining}
            onChange={handleChange}
          />
        </div>
        <div className="mt-2">
          <FileInput
            label="Profile Image"
            onChange={handleFileChange}
            preview={imagePreview}
            onRemove={handleRemoveImage}
          />
        </div>
      </SectionCard>

      {/* Contact Details Section */}
      <SectionCard
        icon={<Phone className="text-green-600" size={20} />}
        title="Contact Details"
        description="Primary contact information"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TextInput
            label="Email Address *"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="user@company.com"
          />
          <TextInput
            label="Phone Number *"
            name="phone_number"
            type="tel"
            value={form.phone_number}
            onChange={handleChange}
            error={errors.phone_number}
            placeholder="10-digit phone number"
          />
          <TextInput
            label="WhatsApp Number"
            name="whatsapp_number"
            type="tel"
            value={form.whatsapp_number}
            onChange={handleChange}
            placeholder="10-digit WhatsApp number"
          />
        </div>
        <div className="mt-4">
          <TextArea
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            placeholder="Enter complete address"
          />
        </div>
      </SectionCard>

      {/* Bank Details Section */}
      <SectionCard
        icon={<Banknote className="text-emerald-600" size={20} />}
        title="Bank Details"
        description="Financial and account information"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TextInput
            label="Bank Name"
            name="bank_name"
            value={form.bank_name}
            onChange={handleChange}
            placeholder="Enter bank name"
          />
          <TextInput
            label="Account Number"
            name="account_number"
            value={form.account_number}
            onChange={handleChange}
            placeholder="Enter account number"
          />
          <TextInput
            label="IFSC Code"
            name="ifsc_code"
            value={form.ifsc_code}
            onChange={handleChange}
            placeholder="Enter IFSC code"
          />
          <TextInput
            label="PAN Number"
            name="pan_number"
            value={form.pan_number}
            onChange={handleChange}
            placeholder="Enter PAN number"
          />
          <TextInput
            label="UAN Number"
            name="uan_number"
            value={form.uan_number}
            onChange={handleChange}
            placeholder="Enter UAN number"
          />
        </div>
      </SectionCard>

      {/* Additional Information Section */}
      <SectionCard
        icon={<Building2 className="text-purple-600" size={20} />}
        title="Additional Information"
        description="Additional notes and descriptions"
      >
        <TextArea
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Enter any additional information about the user..."
        />
      </SectionCard>

      {/* Account Settings Section */}
      <SectionCard
        icon={<Settings className="text-orange-600" size={20} />}
        title="Account Settings"
        description="User permissions and access controls"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToggleSwitch
            label="Show Profile"
            name="show_profile"
            checked={form.show_profile}
            onChange={handleChange}
            description="Make profile visible to others"
          />
          <ToggleSwitch
            label="Share Password"
            name="share_access"
            checked={form.share_access}
            onChange={handleChange}
            description="Allow password sharing"
          />
          <ToggleSwitch
            label="Admin Access"
            name="is_admin"
            checked={form.is_admin}
            onChange={handleChange}
            description="Grant administrative privileges"
          />
        </div>
      </SectionCard>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={resetForm}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={16} />
          Reset Form
        </button>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Save size={16} />
            {loading
              ? editUserData
                ? "Updating..."
                : "Saving..."
              : editUserData
              ? "Update User"
              : "Save User"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------- */
/* Reusable Components           */
/* ----------------------------- */
const SectionCard = ({ icon, title, description, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <div className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  </div>
);

const TextInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
}) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border rounded-lg px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 ${
        error
          ? "border-2 border-red-300 focus:ring-red-500 focus:border-red-500"
          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      }`}
    />
    {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
  </div>
);

const SelectInput = ({ label, name, value, onChange, options, error }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-700 mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`border  rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 ${
        error
          ? "border-2 border-red-300 focus:ring-red-500 focus:border-red-500"
          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      }  transition-colors`}
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
    {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
  </div>
);

const DateInput = ({ label, name, value, onChange }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-700 mb-2">{label}</label>
    <input
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    />
  </div>
);

const FileInput = ({ label, onChange, preview, onRemove }) => (
  <div className="flex flex-col w-full">
    {/* Label */}
    <label className="font-semibold text-sm text-gray-800 mb-2">{label}</label>

    <div className="flex flex-wrap items-start gap-4">
      {/* Upload Box */}
      <label className="flex flex-col items-center justify-center gap-3 w-60 h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200">
        <Upload size={28} className="text-gray-400" />
        <div className="text-center">
          <span className="text-sm font-medium text-gray-700">
            Click to upload
          </span>
          <p className="text-xs text-gray-500">PNG, JPG, JPEG (max 5MB)</p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </label>

      {/* Preview */}
      {preview && (
        <div className="relative w-40 h-40">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain rounded-2xl border shadow-sm"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-white text-red-500 hover:bg-gray-200 rounded-full shadow-md p-1.5 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  </div>
);

const TextArea = ({ label, name, value, onChange, rows = 3, placeholder }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-700 mb-2">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
    />
  </div>
);

const ToggleSwitch = ({ label, name, checked, onChange, description }) => (
  <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex items-center h-5">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
      />
    </div>
    <div className="flex-1 min-w-0">
      <label className="text-sm font-medium text-gray-900 cursor-pointer">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  </div>
);

export default UserDetailsTab;
