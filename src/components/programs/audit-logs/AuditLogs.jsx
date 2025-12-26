import React, { useEffect, useState } from "react";
import { Loader2, Clock, User, FileEdit } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import BreadCrumb from "../../BreadCrum";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const pageSize = 100;

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/audit-log?page=${currentPage}&limit=${pageSize}`,
        "GET"
      );

      setLogs(response.data || []);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage]);

  const totalPages = Math.ceil(totalRecords / pageSize);

  // Safely parse JSON string
  const parseChanges = (changes) => {
    try {
      const parsed = JSON.parse(changes);

      if (!parsed || typeof parsed !== "object") {
        return "No field changes";
      }

      // Fields to ignore in audit UI
      const IGNORE_FIELDS = ["updatedAt", "createdAt"];

      const filteredEntries = Object.entries(parsed).filter(
        ([key]) => !IGNORE_FIELDS.includes(key)
      );

      if (filteredEntries.length === 0) {
        return "No meaningful changes";
      }

      return filteredEntries.map(([key, value]) => (
        <div key={key} className="text-xs text-gray-700">
          <span className="font-semibold">{key}</span>:{" "}
          <span className="text-red-600">
            {value?.old !== undefined ? String(value.old) : "—"}
          </span>{" "}
          →{" "}
          <span className="text-green-600">
            {value?.new !== undefined ? String(value.new) : "—"}
          </span>
        </div>
      ));
    } catch {
      return "Invalid change data";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <BreadCrumb title={"Audit Logs"} paths={["System", "Audit Logs"]} />

        <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              System Audit Logs
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 size={32} className="animate-spin text-red-600" />
            </div>
          ) : (
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b">Entity</th>
                    <th className="py-3 px-4 border-b">Action</th>
                    <th className="py-3 px-4 border-b">Changes</th>
                    <th className="py-3 px-4 border-b">User</th>
                    <th className="py-3 px-4 border-b">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-6 px-4 border text-center text-gray-500"
                      >
                        No audit logs found.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, index) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 border-b font-semibold">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>

                        <td className="py-4 px-4 border-b">
                          <div className="flex items-center gap-2">
                            <FileEdit size={16} className="text-blue-600" />
                            <span className="font-semibold text-gray-800">
                              {log.entity_type}
                            </span>
                            <span className="text-xs text-gray-500">
                              #{log.entity_id}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 border-b">
                          <span className="px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {log.action}
                          </span>
                        </td>

                        <td className="py-4 px-4 border-b max-w-md">
                          <div className="space-y-1">
                            {parseChanges(log.changes)}
                          </div>
                        </td>

                        <td className="py-4 px-4 border-b">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-gray-600" />
                            <div>
                              <p className="font-semibold text-gray-800">
                                {log.user?.name || "Admin"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {log.user?.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 border-b">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock size={14} />
                            <span className="text-xs">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </td>
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

export default AuditLogs;
