import React from "react";
import {
  X,
  Calendar,
  Phone,
  MapPin,
  User,
  Mail,
  Info,
  Smartphone,
  UserCircle,
  Briefcase,
  Building2,
  Banknote,
  Hash,
  FileText,
} from "lucide-react";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ViewSystemUserModal = ({ isOpen, onClose, userData }) => {
  if (!isOpen || !userData) return null;

  const {
    name,
    email,
    employee_id,
    gender,
    date_of_birth,
    phone_number,
    whatsapp_number,
    address,
    city,
    state,
    country,
    description,
    image_url,
    status,
    department,
    bank_name,
    ifsc_code,
    account_number,
    pan_number,
    uan_number,
  } = userData;

  const imageSrc = image_url
    ? `${BASE_URL}/${image_url.replace(/\\/g, "/")}`
    : "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gradient-to-t from-gray-100 to-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            👤 System User Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          {/* Profile Section */}
          <Section title="Profile Information">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <img
                src={imageSrc}
                alt="User Profile"
                className="w-36 h-36 rounded-lg object-fit border shadow-sm"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 text-sm">
                <Field icon={User} label="Full Name" value={name} />
                <Field icon={Hash} label="Employee ID" value={employee_id} />
                <Field
                  icon={UserCircle}
                  label="Gender"
                  value={gender || "N/A"}
                />
                <Field
                  icon={Calendar}
                  label="Date of Birth"
                  value={
                    date_of_birth
                      ? new Date(date_of_birth).toLocaleDateString()
                      : "N/A"
                  }
                />
                <Field
                  icon={Briefcase}
                  label="Department"
                  value={department?.department_name || "N/A"}
                />
                <Field icon={UserCircle} label="Status" value={status} />
              </div>
            </div>
          </Section>

          {/* Contact Section */}
          <Section title="Contact Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Field icon={Mail} label="Email" value={email} />
              <Field icon={Phone} label="Phone" value={phone_number || "N/A"} />
              <Field
                icon={Smartphone}
                label="WhatsApp"
                value={whatsapp_number || "N/A"}
              />
            </div>
          </Section>

          {/* Address Section */}
          <Section title="Address Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <Field icon={MapPin} label="Address" value={address || "N/A"} />
              <Field icon={Building2} label="City" value={city || "N/A"} />
              <Field icon={Building2} label="State" value={state || "N/A"} />
              <Field
                icon={Building2}
                label="Country"
                value={country || "N/A"}
              />
            </div>
          </Section>

          {/* Bank Section */}
          <Section title="Bank Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <Field
                icon={Banknote}
                label="Bank Name"
                value={bank_name || "N/A"}
              />
              <Field icon={Hash} label="IFSC Code" value={ifsc_code || "N/A"} />
              <Field
                icon={Banknote}
                label="Account Number"
                value={account_number || "N/A"}
              />
              <Field
                icon={FileText}
                label="PAN Number"
                value={pan_number || "N/A"}
              />
              <Field
                icon={FileText}
                label="UAN Number"
                value={uan_number || "N/A"}
              />
            </div>
          </Section>

          {/* Description */}
          <Section title="Description">
            <div className="bg-gray-50 p-4 rounded-lg border text-gray-700 whitespace-pre-wrap leading-relaxed">
              {description || "No description available."}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t bg-gradient-to-t from-gray-100 to-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- Reusable Components --- */

const Section = ({ title, children }) => (
  <div className="border border-gray-200 rounded-xl p-5 bg-white hover:bg-gray-50 shadow-sm  transition">
    <h4 className="text-base font-semibold text-red-800 mb-3 border-b pb-2 flex items-center gap-2">
      {title}
    </h4>
    {children}
  </div>
);

const Field = ({ icon: Icon, label, value }) => (
  <p className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border">
    <Icon size={16} className="text-black font-bold shrink-0" />
    <span className="text-gray-500 font-semibold">{label}:</span>
    <span className="text-gray-900">{value}</span>
  </p>
);

export default ViewSystemUserModal;
