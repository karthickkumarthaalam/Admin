import React, { useState, useEffect } from "react";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import BreadCrumb from "../components/BreadCrum";
import { Loader2, Search } from "lucide-react";
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import { apiCall } from "../utils/apiCall";
import CopyrightFooter from "../components/CopyRightsComponent";
import ViewMemberModal from "../components/ViewMemberModal";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const pageSize = 20;

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/members?page=${currentPage}&search=${searchQuery}`,
        "GET"
      );
      setMembers(response.data);
      setTotalRecords(response.pagination.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch members details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
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
        <BreadCrumb title={"Members"} paths={["Programs", "Members List"]} />

        <div className="mt-4 rounded-sm shadow-md px-6 py-4 mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Members List
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
                placeholder="Search Members..."
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
                      <th className="py-2 px-4 border">Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-6 text-gray-500"
                        >
                          No Members available
                        </td>
                      </tr>
                    ) : (
                      members.map((member, index) => (
                        <tr key={member.id}>
                          <td className="py-2 px-4 border">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                          <td
                            className="py-2 px-4 border text-blue-600 cursor-pointer hover:underline"
                            onClick={() => {
                              setSelectedMember(member);
                              setIsViewModalOpen(true);
                            }}
                          >
                            {member.member_id}
                          </td>
                          <td className="py-2 px-4 border">{member.name}</td>
                          <td className="py-2 px-4 border">{member.email}</td>
                          <td className="py-2 px-4 border">{member.phone}</td>
                          <td className="py-2 px-4 border">{member.country}</td>
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
          <ViewMemberModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            memberData={selectedMember}
          />
        </div>
        <CopyrightFooter />
      </div>
    </div>
  );
};

export default Members;
