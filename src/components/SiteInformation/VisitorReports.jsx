import React, { useEffect, useState } from "react";
import { Loader2, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../utils/apiCall";
import BreadCrumb from "../../components/BreadCrum";

const VisitorReport = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [expandedDates, setExpandedDates] = useState([]);

  const pageSize = 20;

  // Fetch visitor report data
  const fetchReport = async (page = currentPage, fromFilter = false) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (startDate) query.append("startDate", startDate);
      if (endDate) query.append("endDate", endDate);
      query.append("page", page);
      query.append("limit", pageSize);

      const res = await apiCall(`/visit/report?${query.toString()}`, "GET");

      setReport(res.data || []);
      setTotalRecords(res.pagination?.totalRecords || 0);

      if (fromFilter) {
        toast.success("Report filtered successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch visitor report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [currentPage]);

  const handleFilter = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }
    setCurrentPage(1);
    fetchReport(1, true);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    fetchReport(1);
  };

  const toggleExpand = (date) => {
    setExpandedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb
          title="Visitor Report"
          paths={["Visitors", "Visitor Report"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center border-b border-dashed border-gray-300 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-2 py-1 rounded text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-2 py-1 rounded text-sm"
              />
            </div>

            <button
              onClick={handleFilter}
              disabled={loading}
              className="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 disabled:opacity-50"
            >
              Filter
            </button>

            <button
              onClick={handleReset}
              disabled={loading}
              className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
            >
              Reset
            </button>
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-red-500" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-600 text-white text-left">
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-300">SI</th>
                    <th className="py-3 px-4 border-b border-gray-300">Date</th>
                    <th className="py-3 px-4 border-b border-gray-300">
                      Total Visits
                    </th>
                    <th className="py-3 px-4 border-b border-gray-300">
                      Unique Visitors
                    </th>
                    <th className="py-3 px-4 border-b border-gray-300">
                      Expand
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-6 px-4 text-center text-gray-500"
                      >
                        No data available.
                      </td>
                    </tr>
                  ) : (
                    report.map((r, index) => {
                      const isExpanded = expandedDates.includes(r.date);
                      return (
                        <React.Fragment key={r.date}>
                          {/* Main Row */}
                          <tr
                            className="hover:bg-gray-50 cursor-pointer font-semibold"
                            onClick={() => toggleExpand(r.date)}
                          >
                            <td className="py-3 px-4 border-b">
                              {(currentPage - 1) * pageSize + index + 1}
                            </td>
                            <td className="py-3 px-4 border-b">
                              {new Date(r.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 border-b">
                              {r.total_visits}
                            </td>
                            <td className="py-3 px-4 border-b">
                              {r.unique_visitors}
                            </td>
                            <td className="py-3 px-4 border-b text-center">
                              {isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </td>
                          </tr>

                          {/* Expanded Rows */}
                          {isExpanded &&
                            r.countries?.map((c, idx) => (
                              <tr
                                key={idx}
                                className="bg-slate-50 border-t border-gray-200 font-semibold"
                              >
                                <td className="py-2 px-4 border-b"></td>
                                <td className="py-2 px-4 border-b pl-8 text-gray-700 ">
                                  {c.country || "Unknown"}
                                </td>
                                <td className="py-2 px-4 border-b text-gray-600">
                                  {c.total_visits}
                                </td>
                                <td className="py-2 px-4 border-b text-gray-600">
                                  {c.unique_visitors}
                                </td>
                                <td className="py-2 px-4 border-b"></td>
                              </tr>
                            ))}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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

export default VisitorReport;
