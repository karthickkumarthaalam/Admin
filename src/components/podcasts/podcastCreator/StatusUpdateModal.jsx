import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";

const StatusUpdateModal = ({ creator, onClose, onSuccess }) => {
  const [status, setStatus] = useState(creator.status);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (status === "rejected" && !reason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    setLoading(true);
    try {
      await apiCall(`/creator/${creator.id}/status`, "PATCH", {
        status,
        rejection_reason: status === "rejected" ? reason : null,
      });

      toast.success("Status updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Update Creator Status
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {status === "rejected" && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Rejection Reason
              </label>
              <textarea
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="Enter rejection reason"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-600"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;
