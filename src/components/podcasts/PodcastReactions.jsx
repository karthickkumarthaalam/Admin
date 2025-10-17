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
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm ">
                <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      Podcast Title
                    </th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      RJ Name
                    </th>
                    <th className="py-3 px-4 border-b">Likes</th>
                    <th className="py-3 px-4 border-b">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-6 px-4 border-b text-center text-gray-500 text-sm"
                      >
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    stats.map((item, index) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4 border-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-3 px-4 border-b">{item.title}</td>
                        <td className="py-3 px-4 border-b">{item.rjname}</td>
                        <td className="py-3 px-4 border-b">{item.likes}</td>
                        <td className="py-3 px-4 border-b">{item.comments}</td>
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
