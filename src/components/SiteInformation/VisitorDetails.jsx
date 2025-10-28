import React, { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import { apiCall } from "../../utils/apiCall";
import BreadCrumb from "../../components/BreadCrum";

const VisitorDetails = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const pageSize = 100;

  // Fetch visitors list
  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await apiCall(
        `/visit/all?page=${currentPage}&limit=${pageSize}`,
        "GET"
      );
      setVisitors(res.data);
      setTotalRecords(res.pagination?.totalRecords || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [currentPage, searchQuery]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Breadcrumb */}
        <BreadCrumb
          title="Visitor Management"
          paths={["Visitors", "Visitor Management"]}
        />

        {/* Container */}
        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {/* Header + Search */}
          <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Site Visitors
            </p>
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-red-500" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-700 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b">Visitor ID</th>
                    <th className="py-3 px-4 border-b">IP</th>
                    <th className="py-3 px-4 border-b">Country</th>
                    <th className="py-3 px-4 border-b">Region</th>
                    <th className="py-3 px-4 border-b">City</th>
                    <th className="py-3 px-4 border-b">Page</th>
                    <th className="py-3 px-4 border-b">Visited At</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-6 px-4 border text-center text-gray-500 text-sm"
                      >
                        No visitors found.
                      </td>
                    </tr>
                  ) : (
                    visitors.map((v, index) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 border-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-3 px-4 border-b">{v.visitor_id}</td>
                        <td className="py-3 px-4 border-b">{v.ip}</td>
                        <td className="py-3 px-4 border-b text-blue-600 font-bold">
                          {v.country}
                        </td>
                        <td className="py-3 px-4 border-b text-teal-700 font-bold">
                          {v.region}
                        </td>
                        <td className="py-3 px-4 border-b text-slate-600 font-bold">
                          {v.city}
                        </td>
                        <td className="py-3 px-4 border-b">{v.page}</td>
                        <td className="py-3 px-4 border-b text-slate-900">
                          {v.created_at
                            ? new Date(v.created_at).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "—"}
                        </td>
                      </tr>
                    ))
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

export default VisitorDetails;
