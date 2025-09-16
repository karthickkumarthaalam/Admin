import React, { useEffect, useState, useMemo } from "react";
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
  ArrowLeft,
} from "lucide-react";
import AddAgreementModal from "./AddAgreementModal";
import { usePermission } from "../../context/PermissionContext";
import { useAuth } from "../../context/AuthContext";

const Agreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editAgreementData, setEditAgreementData] = useState(null);
  const [uploadingPdfId, setUploadingPdfId] = useState(null);
  const [uploadingSignedPdfId, setUploadingSignedPdfId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { hasPermission } = usePermission();
  const { user } = useAuth();

  const fetchAgreements = async () => {
    setLoading(true);
    try {
      const response = await apiCall(`/agreements/list?search=${searchQuery}`);
      setAgreements(response?.data || []);
    } catch (error) {
      toast.error("Failed to fetch agreements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, [searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const groupedCategories = useMemo(() => {
    const groups = {};
    agreements.forEach((ag) => {
      const category = ag.category || "Uncategorized";
      if (!groups[category]) groups[category] = [];
      groups[category].push(ag);
    });
    return groups;
  }, [agreements]);

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

    type === "pdf" ? setUploadingPdfId(id) : setUploadingSignedPdfId(id);
    try {
      await apiCall(`/agreements/delete-pdf/${id}/${type}`, "DELETE");
      toast.success("File deleted successfully");
      fetchAgreements();
    } catch (error) {
      toast.error("Failed to delete the file");
    } finally {
      type === "pdf" ? setUploadingPdfId(null) : setUploadingSignedPdfId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agreement?"))
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

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb
        title={"Agreement Management"}
        paths={
          selectedCategory ? ["Agreements", selectedCategory] : ["Agreements"]
        }
      />

      <div className="mt-4 rounded-sm shadow-md px-2 py-1 md:px-6 md:py-4 md:mx-4 bg-white flex-1 overflow-y-auto scrollbar-thumb-gray-300">
        {/* Header */}
        <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
          <div className="flex flex-col gap-2">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              {selectedCategory
                ? `Agreements in ${selectedCategory}`
                : "Agreements"}
            </p>

            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-1 text-md text-gray-600 hover:underline"
              >
                <ArrowLeft size={16} /> Back to Categories
              </button>
            )}
          </div>

          {hasPermission("Agreements", "create") && (
            <button
              onClick={() => {
                setEditAgreementData(null);
                setIsAddModalOpen(true);
              }}
              className="rounded-md bg-red-500 font-medium text-xs sm:text-sm text-white px-2 py-1.5 sm:px-3 sm:py-2 flex gap-2 items-center hover:bg-red-600 transition duration-300"
            >
              <BadgePlus size={16} />
              <span>Add Agreement</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex justify-end mt-4">
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

        {/* Category Table */}
        {!selectedCategory && (
          <table className="w-full border text-sm mt-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">SI</th>
                <th className="border px-3 py-2 text-left">Category</th>
                <th className="border px-3 py-2 text-left">
                  No. of Agreements
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-6">
                    <Loader2 className="mx-auto animate-spin text-red-500" />
                  </td>
                </tr>
              ) : Object.keys(groupedCategories).length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6">
                    No categories found.
                  </td>
                </tr>
              ) : (
                Object.entries(groupedCategories).map(([cat, items], idx) => (
                  <tr
                    key={cat}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <td className="border px-3 py-2">{idx + 1}</td>
                    <td className="border px-3 py-2 text-blue-600 hover:underline">
                      {cat}
                    </td>
                    <td className="border px-3 py-2 ">{items.length}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Agreement List for Selected Category */}
        {selectedCategory && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full sm:min-w-[800px] border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border text-left">SI</th>
                  <th className="py-2 px-4 border text-left">Title</th>
                  <th className="py-2 px-4 border text-left whitespace-nowrap">
                    Document No
                  </th>
                  <th className="py-2 px-4 border text-left">Date</th>
                  {user.role === "admin" && (
                    <th className="px-4 py-2 border whitespace-nowrap text-left">
                      Created By
                    </th>
                  )}
                  <th className="py-2 px-4 border text-center">PDF</th>
                  <th className="py-2 px-4 border text-center whitespace-nowrap">
                    Signed PDF
                  </th>
                  <th className="py-2 px-4 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {groupedCategories[selectedCategory]?.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-6">
                      No Agreements Found
                    </td>
                  </tr>
                ) : (
                  groupedCategories[selectedCategory]?.map(
                    (agreement, index) => (
                      <tr
                        key={agreement.id}
                        className="border-t hover:bg-gray-50 text-left"
                      >
                        <td className="py-2 px-4 border">{index + 1}</td>
                        <td className="py-2 px-4 border">{agreement.title}</td>
                        <td className="py-2 px-4 border">
                          {agreement.document_number}
                        </td>
                        <td className="py-2 px-4 border">
                          {agreement.date?.slice(0, 10)}
                        </td>
                        {user.role === "admin" && (
                          <td className="py-2 px-4 border">
                            {agreement?.creator?.name || "Admin"}
                          </td>
                        )}
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

                              {hasPermission("Agreements", "update") && (
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
                              )}

                              {hasPermission("Agreements", "delete") && (
                                <button
                                  onClick={() =>
                                    handleDeletePdf(agreement.id, "pdf")
                                  }
                                  className="text-red-600"
                                  title="Delete PDF"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
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

                              {hasPermission("Agreements", "update") && (
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
                              )}
                              {hasPermission("Agreements", "delete") && (
                                <button
                                  onClick={() =>
                                    handleDeletePdf(agreement.id, "signed_pdf")
                                  }
                                  className="text-red-600"
                                  title="Delete Signed PDF"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
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
                            {hasPermission("Agreements", "update") && (
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
                            )}
                            {hasPermission("Agreements", "delete") && (
                              <button
                                onClick={() => handleDelete(agreement.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
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
