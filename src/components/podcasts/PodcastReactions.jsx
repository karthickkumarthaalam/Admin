import React, { useState, useEffect } from "react";
import BreadCrumb from "../BreadCrum";
import { Loader2 } from "lucide-react";
import { apiCall } from "../../utils/apiCall";

const PodcastReactionStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 50;

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await apiCall(
        `/podcasts/reaction-stats?page=${currentPage}&limit=${pageSize}`,
        "GET"
      );
      setStats(res.data);
      setTotalRecords(res.data.totalRecords);
    } catch (err) {
      console.error("Failed to fetch reaction stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentPage]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title={"Podcast Reactions Summary"}
          paths={["Podcasts", "Reaction Overview"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <p className="text-sm sm:text-lg font-semibold text-gray-800 mb-3 border-b border-dashed border-gray-300 pb-2">
            Podcast Reactions
          </p>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-red-500" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="py-2 px-4 border">SI</th>
                    <th className="py-2 px-4 border">Podcast Title</th>
                    <th className="py-2 px-4 border">RJ Name</th>
                    <th className="py-2 px-4 border">Likes</th>
                    <th className="py-2 px-4 border">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-6 px-4 border text-center text-gray-500 text-sm"
                      >
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    stats.map((item, index) => (
                      <tr key={item.id}>
                        <td className="py-2 px-4 border">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-2 px-4 border">{item.title}</td>
                        <td className="py-2 px-4 border">{item.rjname}</td>
                        <td className="py-2 px-4 border">{item.likes}</td>
                        <td className="py-2 px-4 border">{item.comments}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-sm px-3 py-1.5 rounded border hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="text-sm px-3 py-1.5 rounded border hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PodcastReactionStats;
