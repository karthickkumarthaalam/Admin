import React, { useEffect, useState } from "react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const QuestionResultsModal = ({ isOpen, onClose, question_id }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("results");

  const fetchQuestionResults = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/program-question/question/${question_id}`,
        "GET",
      );
      setData(response.data);
    } catch (error) {
      toast.error("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchQuestionResults();
  }, [isOpen, question_id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {data?.question || "Question Details"}
            </h2>

            {data && (
              <div className="flex gap-3 mt-2 flex-wrap text-xs">
                <span
                  className={`px-2 py-1 rounded-full font-medium ${
                    data.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {data.status}
                </span>

                <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                  {data.total_votes} votes
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse text-gray-500">
                Loading results...
              </div>
            </div>
          ) : !data ? (
            <div className="text-center text-gray-500 py-10">
              No data available
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("results")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    activeTab === "results"
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Results
                </button>

                {data.feedback_count > 0 && (
                  <button
                    onClick={() => setActiveTab("feedback")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      activeTab === "feedback"
                        ? "bg-blue-600 text-white shadow"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Feedbacks ({data.feedback_count})
                  </button>
                )}
              </div>

              {/* RESULTS */}
              {activeTab === "results" && (
                <div className="space-y-4">
                  {data.options.map((option) => (
                    <div
                      key={option.id}
                      className="p-4 border rounded-xl bg-gray-50 hover:shadow-sm transition"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-800">
                          {option.option_text}
                        </h3>
                        <span className="text-sm font-semibold text-blue-600">
                          {option.percentage}%
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${option.percentage}%` }}
                        />
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        {option.vote_count} votes
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* FEEDBACK */}
              {activeTab === "feedback" && (
                <div className="space-y-4">
                  {data.feedbacks?.length > 0 ? (
                    data.feedbacks.map((f) => (
                      <div
                        key={f.id}
                        className="p-4 border rounded-xl bg-gray-50"
                      >
                        <p className="text-gray-800">{f.answer_text}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(f.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      No feedbacks available
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionResultsModal;
