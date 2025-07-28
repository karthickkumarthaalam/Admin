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
} from "lucide-react";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ViewSystemUserModal = ({ isOpen, onClose, userData }) => {
  if (!isOpen || !userData) return null;

  const {
    name,
    email,
    gender,
    date_of_birth,
    phone_number,
    whatsapp_number,
    address,
    description,
    image_url,
    status,
    department,
  } = userData;

  const imageSrc = image_url
    ? `${BASE_URL}/${image_url.replace(/\\/g, "/")}`
    : "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[70vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
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
        <div className="overflow-y-auto p-6 flex-1 space-y-5">
          {/* Profile Image */}
          <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
            <img
              src={imageSrc}
              alt="User Profile"
              className="w-40 h-40 rounded-lg object-center border"
            />
            <div className="space-y-2 text-sm flex-1">
              <h3 className="text-2xl font-bold text-gray-800">{name}</h3>
              <p className="flex items-center gap-2 text-gray-700">
                <User size={18} className="text-red-500" />
                <strong className="text-gray-600">Gender:</strong>{" "}
                {gender || "N/A"}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Calendar size={18} className="text-red-500" />
                <strong className="text-gray-600">DOB:</strong>{" "}
                {date_of_birth
                  ? new Date(date_of_birth).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Mail size={18} className="text-red-500" />
                <strong className="text-gray-600">Email:</strong> {email}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Phone size={18} className="text-red-500" />
                <strong className="text-gray-600">Phone:</strong>{" "}
                {phone_number || "N/A"}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Smartphone size={18} className="text-red-500" />
                <strong className="text-gray-600">WhatsApp:</strong>{" "}
                {whatsapp_number || "N/A"}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <MapPin size={18} className="text-red-500" />
                <strong className="text-gray-600">Address:</strong>{" "}
                {address || "N/A"}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Briefcase size={18} className="text-red-500" />
                <strong className="text-gray-600">Department:</strong>{" "}
                {department?.department_name || "N/A"}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <UserCircle size={18} className="text-red-500" />
                <strong className="text-gray-600">Status:</strong> {status}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Info size={20} className="text-red-500" />
              Description
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg border text-gray-700 whitespace-pre-wrap leading-relaxed">
              {description || "No description available."}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSystemUserModal;
