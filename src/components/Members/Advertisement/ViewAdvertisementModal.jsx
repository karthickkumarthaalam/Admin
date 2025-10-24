import React from "react";
import { X } from "lucide-react";

const ViewAdvertisementModal = ({
  isOpen,
  onClose,
  advertisement,
  onSuccess,
}) => {
  if (!isOpen || !advertisement) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-500">
          Advertisement Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500">Company Name</p>
            <p className="text-sm">{advertisement.company_name}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500">Contact Person</p>
            <p className="text-sm">{advertisement.contact_person}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500">Email</p>
            <p className="text-sm">{advertisement.email}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500">Phone</p>
            <p className="text-sm">{advertisement.phone || "-"}</p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-gray-500">Site Address</p>
            <p className="text-sm">{advertisement.site_address || "-"}</p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-gray-500">Requirement</p>
            <p className="text-sm whitespace-pre-line">
              {advertisement.requirement || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500">Status</p>
            <span
              className={`inline-block px-2 py-1 text-xs rounded-full font-semibold
                ${
                  advertisement.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : advertisement.status === "resolved"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-200 text-gray-700"
                }`}
            >
              {advertisement.status}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAdvertisementModal;
