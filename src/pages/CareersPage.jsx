import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../utils/apiCall";
import debounce from "lodash.debounce";
import BreadCrumb from "../components/BreadCrum";
import { Search, Loader2, FileUser } from "lucide-react";

const CareersPage = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const pageSize = 50;

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/careers?page=${currentPage}&search=${searchQuery}`,
        "GET"
      );
      setApplicants(response.data);
      setTotalRecords(response.pagination?.totalRecords);
    } catch (error) {
      toast.error("Failed to list applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [searchQuery, currentPage]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <>
      <BreadCrumb title="Careers List" paths={["Career Management"]} />
      <div className="mt-4 rounded shadow-md px-4 mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
          <p className="text-sm sm:text-lg font-semibold text-gray-800">
            Careers List
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
            <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm ">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-700 text-white">
                  <tr className="text-left">
                    <th className="py-3 px-4 border-b">SI</th>
                    <th className="py-3 px-4 border-b">Name</th>
                    <th className="py-3 px-4 border-b">Email</th>
                    <th className="py-3 px-4 border-b">Mobile</th>
                    <th className="py-3 px-4 border-b">Country</th>
                    <th className="py-3 px-4 border-b">Experience</th>
                    <th className="py-3 px-4 border-b whitespace-nowrap">
                      Current Job
                    </th>
                    <th className="py-3 px-4 border-b text-center">Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-6 text-gray-500"
                      >
                        No Members available
                      </td>
                    </tr>
                  ) : (
                    applicants.map((app, index) => (
                      <tr key={app.id}>
                        <td className="py-3 px-4 border-b">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td
                          className="py-3 px-4 border-b text-blue-500 hover:cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedApplicant(app);
                            setOpenModal(true);
                          }}
                        >
                          {app.name}
                        </td>
                        <td className="py-3 px-4 border-b">{app.email}</td>
                        <td className="py-3 px-4 border-b">{app.mobile}</td>
                        <td className="py-3 px-4 border-b">{app.country}</td>
                        <td className="py-3 px-4 border-b">
                          {app.is_experienced}
                        </td>
                        <td className="py-3 px-4 border-b">
                          {app.current_job}
                        </td>
                        <td className="py-3 px-4 border-b flex justify-center">
                          {
                            <a
                              href={app.document}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View PDF"
                            >
                              <FileUser
                                className="text-blue-500 cursor-pointer"
                                size={18}
                              />
                            </a>
                          }
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
        <ViewApplicantModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          applicantData={selectedApplicant}
        />
      </div>
    </>
  );
};

const ViewApplicantModal = ({ isOpen, onClose, applicantData }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-xl p-6 overflow-y-auto max-h-[90vh] shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b border-dashed pb-2 border-gray-500">
          <h2 className="text-xl font-semibold text-gray-800">
            Member Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl font-bold focus:outline-none"
          >
            &times;
          </button>
        </div>

        <div className="text-md space-y-4 text-gray-700">
          <div>
            <span className="font-semibold">Name:</span> {applicantData.name}
          </div>
          <div>
            <span className="font-semibold">Gender:</span>{" "}
            {applicantData.gender[0].toUpperCase() +
              applicantData.gender?.slice(1)}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {applicantData.email}
          </div>
          <div>
            <span className="font-semibold">Mobile:</span>{" "}
            {applicantData.mobile}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Country:</span>{" "}
              {applicantData.country || "-"}
            </div>
            <div>
              <span className="font-semibold">State:</span>{" "}
              {applicantData.state || "-"}
            </div>
            <div>
              <span className="font-semibold">City:</span>{" "}
              {applicantData.city || "-"}
            </div>
            <div>
              <span className="font-semibold">Experience:</span>{" "}
              {applicantData.is_experienced || "No"}
            </div>
            <div>
              <span className="font-semibold">Job Type:</span>{" "}
              {applicantData.job_type || "-"}
            </div>

            <div>
              <span className="font-semibold">Description:</span>{" "}
              {applicantData.experience || "-"}
            </div>
          </div>
          <div>
            <span className="font-semibold">Reason:</span>{" "}
            {applicantData.application_reason || "-"}
          </div>
          <div>
            <a
              href={applicantData.document}
              target="_blank"
              rel="noopener noreferrer"
              title="View PDF"
              className="text-blue-500 hover:underline"
            >
              Resume
            </a>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-5 py-2 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
