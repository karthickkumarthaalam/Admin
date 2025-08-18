import React, { useState } from "react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";
import { X } from "lucide-react";

const ViewEnquiryModal = ({ isOpen, onClose, enquiry, onSuccess }) => {
  const [comment, setComment] = useState(enquiry?.comment || "");

  if (!isOpen || !enquiry) return null;

  const handleSaveComment = async () => {
    try {
      await apiCall(`/enquiry/${enquiry.id}/comment`, "PATCH", { comment });
      toast.success("Comment updated");
      onSuccess();
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4 border-b border-dashed pb-2 border-gray-500">
          <h2 className="text-xl font-semibold text-gray-800">
            Enquiry Message
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800  font-bold focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {enquiry.subject}
            </h3>
          </div>

          <div className=" border-gray-200 text-sm text-gray-700 leading-relaxed">
            {enquiry.message}
          </div>

          <div>
            <label className="block text-sm font-medium text-red-500 mb-1">
              Add a Comment
            </label>
            <textarea
              className="border border-gray-300 w-full rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Write your comment here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              onClick={handleSaveComment}
            >
              Save Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEnquiryModal;
