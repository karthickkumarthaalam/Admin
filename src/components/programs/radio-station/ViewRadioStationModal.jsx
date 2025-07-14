import React from "react";
import {
  X,
  Radio,
  Globe,
  Link2,
  PlaySquare,
  MonitorPlay,
  Activity,
} from "lucide-react";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ViewRadioStationModal = ({ isOpen, onClose, stationData }) => {
  if (!isOpen || !stationData) return null;

  const {
    station_name,
    radio_stream_url,
    country,
    logo,
    play_type,
    redirect_url,
    status,
  } = stationData;

  const imageSrc = logo
    ? `${BASE_URL}/${logo.replace(/\\/g, "/")}`
    : "https://via.placeholder.com/300x300?text=No+Logo";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[70vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            📻 Radio Station Details
          </h2>
          <button
            onClick={onClose}
            className="text-white bg-red-500 hover:bg-red-600 rounded-full p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-5">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src={imageSrc}
              alt="Radio Station Logo"
              className="w-36 h-36 object-contain rounded-lg border shadow"
            />
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <h3 className="text-2xl font-bold text-gray-800 text-center">
              {station_name}
            </h3>

            <p className="flex items-center gap-2 text-gray-700">
              <Radio size={18} className="text-red-500" />
              <strong className="text-gray-600">Stream URL:</strong>{" "}
              <a
                href={radio_stream_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-words"
              >
                {radio_stream_url}
              </a>
            </p>

            <p className="flex items-center gap-2 text-gray-700">
              <Globe size={18} className="text-red-500" />
              <strong className="text-gray-600">Country:</strong> {country}
            </p>

            <p className="flex items-center gap-2 text-gray-700">
              <MonitorPlay size={18} className="text-red-500" />
              <strong className="text-gray-600">Play Type:</strong> {play_type}
            </p>

            {redirect_url && (
              <p className="flex items-center gap-2 text-gray-700">
                <Link2 size={18} className="text-red-500" />
                <strong className="text-gray-600">Redirect URL:</strong>{" "}
                <a
                  href={redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-words"
                >
                  {redirect_url}
                </a>
              </p>
            )}

            <p className="flex items-center gap-2 text-gray-700">
              <Activity size={18} className="text-red-500" />
              <strong className="text-gray-600">Status:</strong>{" "}
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  status === "active"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {status}
              </span>
            </p>
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

export default ViewRadioStationModal;
