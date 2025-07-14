import React, { useEffect, useState } from "react";
import {
  X,
  Clock3,
  Globe,
  CalendarDays,
  Activity,
  User,
  Radio,
  Eye,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const ViewRadioProgramModal = ({ isOpen, onClose, programId }) => {
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && programId) {
      fetchProgramDetails();
    }
  }, [isOpen, programId]);

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);
      const res = await apiCall(`/radio-program/${programId}`, "GET");
      setProgramData(res.data);
    } catch (error) {
      toast.error("Failed to fetch program details.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl overflow-hidden shadow-xl animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            📻 Radio Program Details
          </h2>
          <button
            onClick={onClose}
            className="text-white bg-red-500 hover:bg-red-600 rounded-full p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1 text-sm space-y-5">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : programData ? (
            <>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800">
                  {programData.program_category?.category || "--"}
                </h3>
              </div>

              {/* Info Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderInfo(User, "RJ", programData.system_users?.name)}
                {renderInfo(
                  Radio,
                  "Radio Station",
                  programData.radio_station?.station_name
                )}
                {renderInfo(
                  Clock3,
                  "Start Time",
                  programData.program_category?.start_time
                )}
                {renderInfo(
                  Clock3,
                  "End Time",
                  programData.program_category?.end_time
                )}
                {renderInfo(Globe, "Country", programData.country)}

                {renderStatus(programData.status)}
              </div>

              {/* Broadcast Days */}
              <div className="border-t pt-4 mt-3">
                <h4 className="text-base font-semibold text-gray-700 mb-2">
                  Broadcast Days
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {programData.broadcast_days ? (
                    programData.broadcast_days.split(",").map((day, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-center border border-gray-200 rounded px-3 py-1 text-gray-700 text-sm font-medium bg-gray-50"
                      >
                        {day}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 col-span-3 text-center">
                      Not Assigned
                    </div>
                  )}
                </div>
              </div>

              {/* Display Settings */}
              <div className="border-t pt-4 mt-2">
                <h4 className="text-base font-semibold text-gray-700 mb-3">
                  Display Settings
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {renderDisplayOption(
                    "Show Host Name",
                    programData.show_host_name
                  )}
                  {renderDisplayOption(
                    "Show Program Name",
                    programData.show_program_name
                  )}
                  {renderDisplayOption("Show Timing", programData.show_timing)}
                  {renderDisplayOption(
                    "Show Host Profile",
                    programData.show_host_profile
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">No data available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t bg-gray-100">
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

  function renderInfo(Icon, label, value) {
    return (
      <div className="flex items-center gap-2 text-gray-700">
        <Icon size={18} className="text-red-500" />
        <strong>{label}:</strong>{" "}
        <span className="text-gray-800">{value || "--"}</span>
      </div>
    );
  }

  function renderStatus(status) {
    return (
      <div className="flex items-center gap-2 text-gray-700">
        <Activity size={18} className="text-red-500" />
        <strong>Status:</strong>{" "}
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            status === "active"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {status}
        </span>
      </div>
    );
  }

  function renderDisplayOption(label, value) {
    return (
      <div className="flex items-center gap-2 text-gray-700 text-sm">
        <strong>{label}:</strong>{" "}
        <span
          className={`text-xs font-medium ${
            value ? "text-green-600" : "text-gray-400"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      </div>
    );
  }
};

export default ViewRadioProgramModal;
