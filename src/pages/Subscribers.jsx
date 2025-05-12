import React, { useState, useEffect } from "react";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import BreadCrumb from "../components/BreadCrum";
import { Search, Loader2 } from "lucide-react";
import { apiCall } from "../utils/apiCall";
import debounce from "lodash.debounce";
import CopyrightFooter from "../components/CopyRightsComponent";

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <BreadCrumb title={"Subscribers"} paths={["Programs", "Users List"]} />

        <div className="mt-4 rounded-sm shadow-md px-6 py-4 mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Users List
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
              <div className="overflow-x-auto mt-4 max-w-full">
                <table className="w-full sm:min-w-[800px] border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="py-2 px-4 border">SI</th>
                      <th className="py-2 px-4 border">Member ID</th>
                      <th className="py-2 px-4 border">Name</th>
                      <th className="py-2 px-4 border">Email</th>
                      <th className="py-2 px-4 border">Mobile</th>
                      <th className="py-2 px-4 border">Package ID</th>
                      <th className="py-2 px-4 border">Start Date</th>
                      <th className="py-2 px-4 border">End Date</th>
                      <th className="py-2 px-4 border">Purchase Date</th>
                      <th className="py-2 px-4 border">Status</th>
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
                          <td className="py-2 px-4 border">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                          <td className="py-2 px-4 border">
                            {subscriber.member.member_id}
                          </td>
                          <td className="py-2 px-4 border">
                            {subscriber.member.name}
                          </td>
                          <td className="py-2 px-4 border">
                            {subscriber.member.email}
                          </td>
                          <td className="py-2 px-4 border">
                            {subscriber.member.phone}
                          </td>
                          <td className="py-2 px-4 border">
                            {subscriber.package.package_id}
                          </td>
                          <td className="py-2 px-4 border">
                            {new Date(subscriber.start_date).toLocaleDateString(
                              "en-GB"
                            )}
                          </td>
                          <td className="py-2 px-4 border">
                            {new Date(subscriber.end_date).toLocaleDateString(
                              "en-GB"
                            )}
                          </td>
                          <td className="py-2 px-4 border">
                            {new Date(
                              subscriber.purchase_date
                            ).toLocaleDateString("en-GB")}
                          </td>
                          <td className="py-2 px-4 border">
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
        <CopyrightFooter />
      </div>
    </div>
  );
};

export default Subscribers;
