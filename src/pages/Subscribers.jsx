import React, { useState, useEffect } from "react";
import BreadCrumb from "../components/BreadCrum";
import { Search, Loader2 } from "lucide-react";
import { apiCall } from "../utils/apiCall";
import debounce from "lodash.debounce";

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 20;

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/memberPackage?page=${currentPage}&search=${searchQuery}`,
        "GET"
      );
      setSubscribers(response.data);
      setTotalRecords(response.pagination.totalRecords);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <>
      <BreadCrumb
        title={"Subscribers"}
        paths={["Members", "Subscribers List"]}
      />

      <div className="mt-4 rounded-sm shadow-md px-6 py-4 mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
          <p className="text-sm sm:text-lg font-semibold text-gray-800">
            Subscribers List
          </p>
        </div>

        <div className="flex justify-center sm:justify-end mt-4">
          <div className="relative w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search Subscribers..."
              onChange={(e) => handleSearch(e.target.value)}
              className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-8 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-red-500" size={32} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm ">
                <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      Member ID
                    </th>
                    <th className="py-3 px-4 border-b">Name</th>
                    <th className="py-3 px-4 border-b">Email</th>
                    <th className="py-3 px-4 border-b">Mobile</th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      Package Name
                    </th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      Start Date
                    </th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      End Date
                    </th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      Purchase Date
                    </th>
                    <th className="py-3 px-4 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="10"
                        className="text-center py-6 text-gray-500"
                      >
                        No subscribers available.
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((subscriber, index) => (
                      <tr key={subscriber.id}>
                        <td className="py-3 px-4 border-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {subscriber.member.member_id}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {subscriber.member.name}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {subscriber.member.email}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {subscriber.member.phone}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {subscriber.package.package_name}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {new Date(subscriber.start_date).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {new Date(subscriber.end_date).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {new Date(
                            subscriber.purchase_date
                          ).toLocaleDateString("en-GB")}
                        </td>
                        <td className="py-3 px-4 border-b">
                          <span
                            className={`cursor-pointer px-2 py-1 text-xs rounded font-semibold ${
                              subscriber.status === "active"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {subscriber.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
          </>
        )}
      </div>
    </>
  );
};

export default Subscribers;
