import React, { useEffect, useState } from "react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";
import {
  X,
  BarChart3,
  CheckCircle2,
  Clock3,
  Vote,
  Loader2,
} from "lucide-react";

const NewsPollResult = ({ isOpen, onClose, poll_id }) => {
  const [loading, setLoading] = useState(false);
  const [poll, setPoll] = useState(null);

  const fetchPollResults = async () => {
    setLoading(true);

    try {
      const response = await apiCall(`/news-poll/${poll_id}/results`, "GET");

      setPoll(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch poll results",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && poll_id) {
      fetchPollResults();
    }
  }, [isOpen, poll_id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="w-full h-full flex items-end sm:items-center justify-center">
        <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-gray-100 transition"
            >
              <X size={22} className="text-gray-500" />
            </button>

            <div className="flex items-start gap-3 sm:gap-4 pr-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <BarChart3 className="text-blue-600" size={24} />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 leading-snug line-clamp-3">
                  {poll?.question || "Poll Results"}
                </h2>

                {poll && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <div
                      className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold ${
                        poll.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {poll.is_active ? "Active" : "Closed"}
                    </div>

                    <div className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-gray-100 text-gray-700 flex items-center gap-1">
                      <Vote size={13} />
                      {poll.total_votes || 0} Votes
                    </div>

                    {poll.end_date && (
                      <div className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
                        <Clock3 size={13} />
                        Ends {new Date(poll.end_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="flex items-center gap-3 text-blue-600 font-medium">
                  <Loader2 className="animate-spin" size={22} />
                  Loading results...
                </div>
              </div>
            ) : !poll ? (
              <div className="h-64 flex items-center justify-center text-sm text-gray-500">
                No poll data available
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                {poll.results?.map((option, index) => (
                  <div
                    key={option.id || index}
                    className="border border-gray-200 rounded-2xl p-4 sm:p-5 bg-gray-50"
                  >
                    {/* Top */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Left */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + index)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug break-words">
                            {option.option_text}
                          </h3>

                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {option.votes || 0} votes
                          </p>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="text-right shrink-0">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                          {option.percentage || 0}%
                        </div>

                        {option.is_winner && (
                          <div className="flex items-center justify-end gap-1 text-green-600 text-[11px] sm:text-xs font-semibold mt-1">
                            <CheckCircle2 size={13} />
                            Leading
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="w-full h-2.5 sm:h-3 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                        style={{
                          width: `${option.percentage || 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-5">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPollResult;
