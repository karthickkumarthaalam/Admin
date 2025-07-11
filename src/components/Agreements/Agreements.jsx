import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../utils/apiCall";
import debounce from "lodash.debounce";
import BreadCrumb from "../BreadCrum";
import {
  BadgePlus,
  Loader2,
  Search,
  Download,
  UploadCloud,
  Edit2,
  Trash2,
} from "lucide-react";
import AddAgreementModal from "./AddAgreementModal";

const Agreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editAgreementData, setEditAgreementData] = useState(null);
  const [uploadingPdfId, setUploadingPdfId] = useState(null);
  const [uploadingSignedPdfId, setUploadingSignedPdfId] = useState(null);

  //   const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const pageSize = 20;

  const fetchAgreements = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/agreements/list?page=${currentPage}&search=${searchQuery}`
      );
      setAgreements(response?.data);
      setTotalRecords(response?.pagination?.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch agreements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, [currentPage, searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleAgreementPdfUpload = async (id, file) => {
    setUploadingPdfId(id);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      await apiCall(
        `/agreements/upload-agreement-pdf/${id}`,
        "POST",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("PDF uploaded successfully");
      fetchAgreements();
    } catch (error) {
      toast.error("Failed to upload the PDF");
    } finally {
      setUploadingPdfId(null);
    }
  };

  const handleSignedPdfUpload = async (id, file) => {
    setUploadingSignedPdfId(id);
    try {
      const formData = new FormData();
      formData.append("signed_pdf", file);
      await apiCall(`/agreements/upload-signed-pdf/${id}`, "POST", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Signed PDF uploaded successfully");
      fetchAgreements();
    } catch (error) {
      toast.error("Failed to upload the signed PDF");
    } finally {
      setUploadingSignedPdfId(null);
    }
  };

  const handleDeletePdf = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    if (type === "pdf") {
      setUploadingPdfId(id);
    } else {
      setUploadingSignedPdfId(id);
    }
    try {
      await apiCall(`/agreements/delete-pdf/${id}/${type}`, "DELETE");
      toast.success("File deleted successfully");
      fetchAgreements();
    } catch (error) {
      toast.error("Failed to delete the file");
    } finally {
      if (type === "pdf") {
        setUploadingPdfId(null);
      } else {
        setUploadingSignedPdfId(null);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agreeement?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/agreements/delete/${id}`, "DELETE");
      fetchAgreements();
      toast.success("Agreement Deleted Successfully");
    } catch (error) {
      toast.error("Failed to Delete Agreement");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb title={"Agreement Management"} paths={["Agreement"]} />

      <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thumb-gray-300">
        <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
          <p className="text-sm sm:text-lg font-semibold text-gray-800">
            Agreement List
          </p>
          <button
            onClick={() => {
              setEditAgreementData(null);
              setIsAddModalOpen(true);
            }}
            className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
          >
            <BadgePlus size={16} />
            <span>Add Agreements</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-4 gap-2 md:gap-4">
          <div className="relative w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search agreements..."
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
                    <th className="py-2 px-4 border">Title</th>
                    <th className="py-2 px-4 border">Document No</th>
                    <th className="py-2 px-4 border">Category</th>
                    <th className="py-2 px-4 border">Date</th>
                    <th className="py-2 px-4 border text-center">PDF</th>
                    <th className="py-2 px-4 border text-center">Signed PDF</th>
                    <th className="py-2 px-4 border text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {agreements.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center p-6">
                        No Agreements Found
                      </td>
                    </tr>
                  ) : (
                    agreements.map((agreement, index) => (
                      <tr key={agreement.id} className="border-t">
                        <td className="py-2 px-4 border">
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="py-2 px-4 border">{agreement.title}</td>
                        <td className="py-2 px-4 border">
                          {agreement.document_number}
                        </td>
                        <td className="py-2 px-4 border">
                          {agreement.category}
                        </td>
                        <td className="py-2 px-4 border">
                          {agreement.date?.slice(0, 10)}
                        </td>
                        <td className="py-2 px-4 border text-center">
                          {uploadingPdfId === agreement.id ? (
                            <Loader2
                              className="animate-spin text-red-500 mx-auto"
                              size={20}
                            />
                          ) : agreement.pdf_drive_link ? (
                            <div className="flex gap-2 justify-center">
                              <a
                                href={agreement.pdf_drive_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View PDF"
                              >
                                <Download
                                  className="text-green-500 cursor-pointer"
                                  size={18}
                                />
                              </a>

                              <label
                                className="cursor-pointer text-blue-500 flex items-center gap-1"
                                title="Replace PDF"
                              >
                                <UploadCloud size={18} />
                                <input
                                  type="file"
                                  accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                  onChange={(e) =>
                                    handleAgreementPdfUpload(
                                      agreement.id,
                                      e.target.files[0]
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>

                              <button
                                onClick={() =>
                                  handleDeletePdf(agreement.id, "pdf")
                                }
                                className="text-red-600"
                                title="Delete PDF"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : (
                            <label
                              className="cursor-pointer text-blue-500 flex justify-center gap-1"
                              title="Upload PDF"
                            >
                              <UploadCloud size={18} />
                              <input
                                type="file"
                                accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(e) =>
                                  handleAgreementPdfUpload(
                                    agreement.id,
                                    e.target.files[0]
                                  )
                                }
                                className="hidden"
                              />
                            </label>
                          )}
                        </td>

                        <td className="py-2 px-4 border text-center">
                          {uploadingSignedPdfId === agreement.id ? (
                            <Loader2
                              className="animate-spin text-green-500 mx-auto"
                              size={20}
                            />
                          ) : agreement.signed_pdf_drive_link ? (
                            <div className="flex gap-2 justify-center">
                              <a
                                href={agreement.signed_pdf_drive_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View Signed PDF"
                              >
                                <Download
                                  className="text-green-600 cursor-pointer"
                                  size={18}
                                />
                              </a>

                              <label
                                className="cursor-pointer text-blue-500 flex items-center gap-1"
                                title="Replace Signed PDF"
                              >
                                <UploadCloud size={18} />
                                <input
                                  type="file"
                                  accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                  onChange={(e) =>
                                    handleSignedPdfUpload(
                                      agreement.id,
                                      e.target.files[0]
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>

                              <button
                                onClick={() =>
                                  handleDeletePdf(agreement.id, "signed_pdf")
                                }
                                className="text-red-600"
                                title="Delete Signed PDF"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : (
                            <label
                              className="cursor-pointer text-blue-500 flex justify-center gap-1"
                              title="Upload Signed PDF"
                            >
                              <UploadCloud size={18} />
                              <input
                                type="file"
                                accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(e) =>
                                  handleSignedPdfUpload(
                                    agreement.id,
                                    e.target.files[0]
                                  )
                                }
                                className="hidden"
                              />
                            </label>
                          )}
                        </td>

                        <td className="py-2 px-4 border">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditAgreementData(agreement);
                                setIsAddModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(agreement.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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

      <AddAgreementModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchAgreements();
          setIsAddModalOpen(false);
        }}
        editAgreementData={editAgreementData}
      />
    </div>
  );
};

export default Agreements;
