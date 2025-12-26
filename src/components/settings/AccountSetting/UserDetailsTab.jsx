import React, { useEffect, useState } from "react";
import {
  User,
  Phone,
  Building2,
  Banknote,
  Save,
  RotateCcw,
  Camera,
  CheckCircle,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UserDetailsTab = ({ onSuccess, userId }) => {
  const [form, setForm] = useState(initialFormState());
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [activeSection, setActiveSection] = useState("personal");
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobileView(width < 768);
      setIsTabletView(width >= 768 && width < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function initialFormState() {
    return {
      name: "",
      email: "",
      employee_id: "",
      gender: "",
      department_name: "",
      date_of_birth: "",
      date_of_joining: "",
      phone_number: "",
      whatsapp_number: "",
      address: "",
      description: "",
      bank_name: "",
      ifsc_code: "",
      account_number: "",
      pan_number: "",
      uan_number: "",
      image: null,
      remove_image: false,
    };
  }

  // Validate form fields
  const validateField = (name, value) => {
    const errors = { ...validationErrors };

    switch (name) {
      case "phone_number":
      case "whatsapp_number":
        if (value && !/^\d{10}$/.test(value)) {
          errors[name] = "Must be 10 digits";
        } else {
          delete errors[name];
        }
        break;
      case "account_number":
        if (value && !/^\d{9,18}$/.test(value)) {
          errors[name] = "Invalid account number";
        } else {
          delete errors[name];
        }
        break;
      case "ifsc_code":
        if (value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
          errors[name] = "Invalid IFSC code";
        } else {
          delete errors[name];
        }
        break;
      case "pan_number":
        if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
          errors[name] = "Invalid PAN format";
        } else {
          delete errors[name];
        }
        break;
      default:
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      const res = await apiCall(`/system-user/${userId}/user-details`, "GET");
      const data = res.data;

      setForm({
        ...form,
        name: data.name,
        email: data.email,
        employee_id: data.employee_id,
        gender: data.gender,
        department_name: data.department?.department_name || "",
        date_of_birth: data.date_of_birth?.split("T")[0] || "",
        date_of_joining: data.date_of_joining || "",
        phone_number: data.phone_number,
        whatsapp_number: data.whatsapp_number,
        address: data.address,
        description: data.description,
        bank_name: data.bank_name,
        ifsc_code: data.ifsc_code,
        account_number: data.account_number,
        pan_number: data.pan_number,
        uan_number: data.uan_number,
      });

      setEmployeeId(data.id);
      setIsDirty(false);

      setImagePreview(
        data.image_url
          ? `${BASE_URL}/${data.image_url.replace(/\\/g, "/")}`
          : null
      );
    } catch (error) {
      toast.error("Failed to fetch user details");
    }
  };

  useEffect(() => {
    if (userId) fetchUserDetails();
  }, [userId]);

  // Handle input update
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
    setIsDirty(true);
  };

  // Handle image change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be < 5MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, WebP)");
      return;
    }

    setForm((prev) => ({ ...prev, image: file, remove_image: false }));

    const fileReader = new FileReader();

    fileReader.onload = () => {
      setImagePreview(fileReader.result);
    };

    fileReader.onerror = () => {
      console.error("File reading failed");
    };

    fileReader.readAsDataURL(file);
    setIsDirty(true);
  };

  // Submit updated details
  const handleSubmit = async () => {
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      for (let key in form) {
        if (key === "image" && form.image) {
          payload.append("profile_image", form.image);
        } else {
          payload.append(key, form[key]);
        }
      }

      await apiCall(`/system-user/update/${employeeId}`, "PATCH", payload);

      toast.success("Account details updated successfully!");
      setIsDirty(false);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update details");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImagePreview(null);
    setValidationErrors({});
    fetchUserDetails();
    toast.info("Form reset to original values");
  };

  const sections = [
    { id: "personal", label: "Personal", icon: User },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "bank", label: "Bank", icon: Banknote },
    { id: "additional", label: "Additional", icon: Building2 },
  ];

  // Get current section icon component
  const CurrentSectionIcon = () => {
    const section = sections.find((s) => s.id === activeSection);
    return section
      ? React.createElement(section.icon, {
          className: "text-blue-600",
          size: isMobileView ? 16 : 20,
        })
      : null;
  };

  // Main render
  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Progress Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-6 border border-blue-100">
        {!isMobileView && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">
                Profile Details
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
                Manage your personal and professional information
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium ${
                  isDirty
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {isDirty ? "Unsaved Changes" : "All Saved"}
              </div>
            </div>
          </div>
        )}

        {/* Navigation - Responsive */}
        <div className={`mt-6 ${isMobileView ? "hidden" : "block"}`}>
          {isTabletView ? (
            // Tablet view - Scrollable tabs
            <div className="relative">
              <div
                className="flex space-x-1 overflow-x-auto pb-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-all whitespace-nowrap ${
                      activeSection === section.id
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {React.createElement(section.icon, { size: 16 })}
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Desktop view - Full tabs
            <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-6 py-3 rounded-lg font-medium transition-all text-sm md:text-base ${
                    activeSection === section.id
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {React.createElement(section.icon, { size: 16 })}
                  <span className="hidden sm:inline">{section.label}</span>
                  {isMobileView && (
                    <span className="text-xs">{section.label}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Section Indicator */}
        {isMobileView && !isMobileMenuOpen && (
          <div className="flex items-center justify-between mt-4 bg-white rounded-xl p-3">
            <button
              onClick={() => {
                const currentIndex = sections.findIndex(
                  (s) => s.id === activeSection
                );
                const prevIndex =
                  currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
                setActiveSection(sections[prevIndex].id);
              }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <CurrentSectionIcon />
              <span className="font-medium text-sm">
                {sections.find((s) => s.id === activeSection)?.label}
              </span>
            </div>
            <button
              onClick={() => {
                const currentIndex = sections.findIndex(
                  (s) => s.id === activeSection
                );
                const nextIndex =
                  currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
                setActiveSection(sections[nextIndex].id);
              }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div
        className={`grid gap-4 md:gap-8 ${
          isTabletView || isMobileView
            ? "grid-cols-1"
            : "grid-cols-1 lg:grid-cols-4"
        }`}
      >
        {/* Sidebar Profile - Hidden on mobile, full width on tablet */}
        {(isTabletView || !isMobileView) && (
          <div
            className={`
            ${isTabletView ? "col-span-1" : "lg:col-span-1"}
            ${isMobileView ? "hidden" : "block"}
          `}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 sticky top-4 md:top-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg mx-auto">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <User
                          size={isMobileView ? 32 : 48}
                          className="text-gray-400"
                        />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-1 md:bottom-2 right-1 md:right-2 bg-white p-1.5 md:p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Camera
                      size={isMobileView ? 12 : 16}
                      className="text-gray-700"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <h3 className="text-lg md:text-xl font-bold mt-3 md:mt-4 text-gray-900 truncate">
                  {form.name || "Unknown User"}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm mt-1 truncate">
                  {form.employee_id}
                </p>
                <p className="text-blue-600 text-xs md:text-sm font-medium mt-1 md:mt-2 truncate">
                  {form.department_name}
                </p>

                <div className="mt-4 md:mt-6 space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-gray-500">Account Status</span>
                    <span className="px-2 py-1 md:px-3 md:py-1 bg-green-100 text-green-800 rounded-full font-medium text-xs">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="text-gray-700 font-medium">Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div
          className={`space-y-4 md:space-y-6 ${
            isTabletView ? "col-span-1" : "lg:col-span-3"
          }`}
        >
          {/* Personal Info */}
          {activeSection === "personal" && (
            <SectionCard
              icon={
                <User className="text-blue-600" size={isMobileView ? 16 : 20} />
              }
              title="Personal Information"
              description="Core employee details (Read-only)"
              badge="Auto-filled"
              isMobile={isMobileView}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <DisabledInput
                  label="Full Name"
                  value={form.name}
                  isMobile={isMobileView}
                />
                <DisabledInput
                  label="Email"
                  value={form.email}
                  isMobile={isMobileView}
                />
                <DisabledInput
                  label="Employee ID"
                  value={form.employee_id}
                  isMobile={isMobileView}
                />
                <DisabledInput
                  label="Gender"
                  value={form.gender}
                  isMobile={isMobileView}
                />
                <DisabledInput
                  label="Department"
                  value={form.department_name}
                  isMobile={isMobileView}
                />
                <DisabledInput
                  label="Date of Birth"
                  value={form.date_of_birth}
                  isMobile={isMobileView}
                />
                <DisabledInput
                  label="Date of Joining"
                  value={form.date_of_joining}
                  isMobile={isMobileView}
                />
              </div>
            </SectionCard>
          )}

          {/* Contact Info */}
          {activeSection === "contact" && (
            <SectionCard
              icon={
                <Phone
                  className="text-green-600"
                  size={isMobileView ? 16 : 20}
                />
              }
              title="Contact Details"
              description="Update your contact information"
              badge="Editable"
              isMobile={isMobileView}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <EditableInput
                  label="Phone Number"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  error={validationErrors.phone_number}
                  placeholder="Enter 10-digit number"
                  icon={<Phone size={isMobileView ? 14 : 16} />}
                  isMobile={isMobileView}
                />
                <EditableInput
                  label="WhatsApp Number"
                  name="whatsapp_number"
                  value={form.whatsapp_number}
                  onChange={handleChange}
                  error={validationErrors.whatsapp_number}
                  placeholder="Optional"
                  icon={<Phone size={isMobileView ? 14 : 16} />}
                  isMobile={isMobileView}
                />
              </div>

              <TextArea
                label="Address"
                name="address"
                value={form.address}
                rows={2}
                onChange={handleChange}
                placeholder="Enter your complete address"
                isMobile={isMobileView}
              />
            </SectionCard>
          )}

          {/* Bank Details */}
          {activeSection === "bank" && (
            <SectionCard
              icon={
                <Banknote
                  className="text-emerald-600"
                  size={isMobileView ? 16 : 20}
                />
              }
              title="Bank Details"
              description="Update your banking information"
              badge="Sensitive"
              isMobile={isMobileView}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <EditableInput
                  label="Bank Name"
                  name="bank_name"
                  value={form.bank_name}
                  onChange={handleChange}
                  placeholder="e.g., State Bank of India"
                  icon={<Building2 size={isMobileView ? 14 : 16} />}
                  isMobile={isMobileView}
                />
                <PasswordInput
                  label="Account Number"
                  name="account_number"
                  value={form.account_number}
                  onChange={handleChange}
                  error={validationErrors.account_number}
                  placeholder="Enter account number"
                  showPassword={showPassword.account_number}
                  onToggleShow={() =>
                    setShowPassword((prev) => ({
                      ...prev,
                      account_number: !prev.account_number,
                    }))
                  }
                  isMobile={isMobileView}
                />
                <EditableInput
                  label="IFSC Code"
                  name="ifsc_code"
                  value={form.ifsc_code}
                  onChange={handleChange}
                  error={validationErrors.ifsc_code}
                  placeholder="e.g., SBIN0001234"
                  icon={<Lock size={isMobileView ? 14 : 16} />}
                  isMobile={isMobileView}
                />
                <EditableInput
                  label="PAN Number"
                  name="pan_number"
                  value={form.pan_number}
                  onChange={handleChange}
                  error={validationErrors.pan_number}
                  placeholder="e.g., ABCDE1234F"
                  icon={<Lock size={isMobileView ? 14 : 16} />}
                  isMobile={isMobileView}
                />
                <EditableInput
                  label="UAN Number"
                  name="uan_number"
                  value={form.uan_number}
                  onChange={handleChange}
                  placeholder="12-digit number"
                  icon={<Lock size={isMobileView ? 14 : 16} />}
                  isMobile={isMobileView}
                />
              </div>
            </SectionCard>
          )}

          {/* Additional Info */}
          {activeSection === "additional" && (
            <SectionCard
              icon={
                <Building2
                  className="text-purple-600"
                  size={isMobileView ? 16 : 20}
                />
              }
              title="Additional Information"
              description="Personal notes & additional details"
              badge="Optional"
              isMobile={isMobileView}
            >
              <TextArea
                label="Description"
                name="description"
                rows={isMobileView ? 6 : 3}
                value={form.description}
                onChange={handleChange}
                placeholder="Add any additional information about yourself..."
                maxLength={1000}
                showCount
                isMobile={isMobileView}
              />
            </SectionCard>
          )}

          {/* Action Buttons - Responsive */}
          <div className="">
            <div
              className={`flex ${
                isMobileView ? "flex-col" : "items-center justify-between"
              } gap-4`}
            >
              <div
                className={`flex items-center gap-3 ${
                  isMobileView ? "justify-center" : ""
                }`}
              >
                {isDirty && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle size={isMobileView ? 14 : 16} />
                    <span className="text-xs md:text-sm font-medium">
                      You have unsaved changes
                    </span>
                  </div>
                )}
              </div>

              <div className={`flex gap-3 ${isMobileView ? "flex-col" : ""}`}>
                <button
                  onClick={resetForm}
                  disabled={!isDirty || loading}
                  className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-medium transition-all w-full md:w-auto ${
                    !isDirty || loading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  <RotateCcw size={isMobileView ? 16 : 18} />
                  <span className="text-xs md:text-sm">Reset</span>
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !isDirty ||
                    Object.keys(validationErrors).length > 0
                  }
                  className={`flex items-center justify-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-medium transition-all shadow-md w-full md:w-auto ${
                    loading ||
                    !isDirty ||
                    Object.keys(validationErrors).length > 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 "
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-xs md:text-sm">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={isMobileView ? 16 : 18} />
                      <span className="text-xs md:text-sm">Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= ENHANCED REUSABLE COMPONENTS ================= */

const SectionCard = ({
  icon,
  title,
  description,
  badge,
  children,
  isMobile,
}) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <h3
                className={`font-semibold ${
                  isMobile ? "text-base" : "text-lg"
                } text-gray-900 truncate`}
              >
                {title}
              </h3>
              {badge && (
                <span
                  className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    badge === "Auto-filled"
                      ? "bg-blue-100 text-blue-800"
                      : badge === "Editable"
                      ? "bg-green-100 text-green-800"
                      : badge === "Sensitive"
                      ? "bg-red-100 text-red-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {badge}
                </span>
              )}
            </div>
            <p
              className="text-gray-600 text-xs md:text-sm mt-1 md:mt-2"
              style={{
                overflow: "hidden",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
      {children}
    </div>
  </div>
);

const DisabledInput = ({ label, value, isMobile }) => (
  <div className="group">
    <label className="text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 block truncate">
      {label}
    </label>
    <div className="relative">
      <input
        type="text"
        value={value || ""}
        disabled
        className="w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700 rounded-lg md:rounded-xl cursor-not-allowed font-medium text-sm md:text-base"
      />
      <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Lock size={isMobile ? 12 : 14} className="text-gray-400" />
      </div>
    </div>
  </div>
);

const EditableInput = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  icon,
  isMobile,
}) => (
  <div className="group">
    <label className="text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 block flex items-center justify-between">
      <span className="truncate">{label}</span>
      {error && (
        <span className="text-xs text-red-600 font-medium flex items-center gap-1 shrink-0 ml-2">
          <AlertCircle size={isMobile ? 10 : 12} />
          <span className="hidden sm:inline">{error}</span>
          <span className="sm:hidden">!</span>
        </span>
      )}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-offset-1 md:focus:ring-offset-2 transition-all text-sm md:text-base ${
          icon ? (isMobile ? "pl-8" : "pl-10") : ""
        } ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-400"
        }`}
      />
      {!error && value && (
        <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CheckCircle size={isMobile ? 12 : 14} className="text-green-500" />
        </div>
      )}
    </div>
  </div>
);

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  showPassword,
  onToggleShow,
  isMobile,
}) => (
  <div className="group">
    <label className="text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 block flex items-center justify-between">
      <span className="truncate">{label}</span>
      {error && (
        <span className="text-xs text-red-600 font-medium flex items-center gap-1 shrink-0 ml-2">
          <AlertCircle size={isMobile ? 10 : 12} />
          <span className="hidden sm:inline">{error}</span>
          <span className="sm:hidden">!</span>
        </span>
      )}
    </label>
    <div className="relative">
      <div className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Lock size={isMobile ? 14 : 16} />
      </div>
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-offset-1 md:focus:ring-offset-2 transition-all text-sm md:text-base pl-8 md:pl-10 pr-9 md:pr-12 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-400"
        }`}
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
      >
        {showPassword ? (
          <EyeOff size={isMobile ? 16 : 18} />
        ) : (
          <Eye size={isMobile ? 16 : 18} />
        )}
      </button>
    </div>
  </div>
);

const TextArea = ({
  label,
  name,
  value,
  onChange,
  rows,
  placeholder,
  maxLength,
  showCount,
  isMobile,
}) => {
  const charCount = value?.length || 0;

  return (
    <div className="group">
      <label className="text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 block flex items-center justify-between">
        <span>{label}</span>
        {showCount && maxLength && (
          <span
            className={`text-xs font-medium ${
              charCount > maxLength * 0.9 ? "text-amber-600" : "text-gray-500"
            }`}
          >
            {charCount}/{maxLength}
          </span>
        )}
      </label>
      <textarea
        name={name}
        rows={rows}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 md:focus:ring-offset-2 focus:border-blue-500 resize-none hover:border-gray-400 transition-colors text-sm md:text-base"
      />
    </div>
  );
};

export default UserDetailsTab;
