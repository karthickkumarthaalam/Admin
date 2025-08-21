import React from "react";

const ViewMemberModal = ({ isOpen, onClose, memberData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh] shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b border-dashed pb-2 border-gray-500">
          <h2 className="text-xl font-semibold text-gray-800">
            Member Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl font-bold focus:outline-none"
          >
            &times;
          </button>
        </div>

        <div className="text-sm space-y-4 text-gray-700">
          <div>
            <span className="font-semibold">Name:</span> {memberData.name}
          </div>
          <div>
            <span className="font-semibold">Member ID:</span>{" "}
            {memberData.member_id}
          </div>
          <div>
            <span className="font-semibold">Gender:</span> {memberData.gender}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {memberData.email}
          </div>
          <div>
            <span className="font-semibold">Phone:</span> {memberData.phone}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Address 1:</span>{" "}
              {memberData.address1 || "-"}
            </div>
            <div>
              <span className="font-semibold">Address 2:</span>{" "}
              {memberData.address2 || "-"}
            </div>
            <div>
              <span className="font-semibold">Country:</span>{" "}
              {memberData.country || "-"}
            </div>
            <div>
              <span className="font-semibold">State:</span>{" "}
              {memberData.state || "-"}
            </div>
            <div>
              <span className="font-semibold">City:</span>{" "}
              {memberData.city || "-"}
            </div>
          </div>

          <div>
            <span className="font-semibold">Registered On:</span>{" "}
            {new Date(memberData.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-5 py-2 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMemberModal;
