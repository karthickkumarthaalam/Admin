import React, { useEffect, useState, useRef } from "react";
import {
  Upload,
  X,
  Loader2,
  Trash2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const documentTypes = [
  { key: "photo", label: "Photo", color: "from-pink-500 to-rose-500" },
  { key: "passport", label: "Passport", color: "from-blue-500 to-indigo-600" },
  {
    key: "previous_visa",
    label: "Previous Visa",
  },
  {
    key: "aadhar_card",
    label: "Aadhar Card",
  },
  {
    key: "income_revenue",
    label: "Income Revenue",
  },
  {
    key: "bank_statement",
    label: "Bank Statement",
  },
];

const CrewDocumentsModal = ({ isOpen, onClose, crewMember }) => {
  const [documents, setDocuments] = useState([]);
  const [loadingType, setLoadingType] = useState(null);
  const [dragType, setDragType] = useState(null);
  const fileRefs = useRef({});

  const fetchDocs = async () => {
    if (!crewMember) return;
    try {
      const res = await apiCall(`/crew-document/${crewMember.id}`);
      setDocuments(res.data || []);
    } catch {
      toast.error("Failed to load documents");
    }
  };

  useEffect(() => {
    if (isOpen) fetchDocs();
  }, [isOpen]);

  const handleUpload = async (type, files) => {
    if (!files.length) return;

    const formData = new FormData();
    formData.append("crew_list_id", crewMember.id);
    formData.append("document_type", type);

    [...files].forEach((file) => formData.append("files", file));

    try {
      setLoadingType(type);
      await apiCall("/crew-document/upload-multiple", "POST", formData, true);
      toast.success("Uploaded");
      fetchDocs();
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoadingType(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete document?")) return;
    try {
      await apiCall(`/crew-document/${id}`, "DELETE");
      toast.success("Deleted");
      fetchDocs();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragType(null);
    const files = e.dataTransfer.files;
    if (files?.length) handleUpload(type, files);
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setDragType(type);
  };

  const handleDragLeave = () => setDragType(null);

  const groupedDocs = documentTypes.reduce((acc, type) => {
    acc[type.key] = documents.filter((doc) => doc.document_type === type.key);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full h-full bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* 🌈 COLORFUL HEADER */}
        <div className="relative overflow-hidden">
          <div className="relative flex justify-between items-center px-8 py-6 bg-gray-800 border-b  border-gray-200">
            <div>
              <h2 className="text-xl text-gray-100 font-semibold tracking-wide">
                {crewMember?.given_name} {crewMember?.sur_name}
              </h2>
              <p className="text-blue-300 text-sm">Documents</p>
            </div>

            <button onClick={onClose} className="p-1 rounded-xl transition">
              <X className="text-gray-100 " />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-auto px-10 py-8 bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {documentTypes.map((type) => (
              <div
                key={type.key}
                className="relative bg-white/90 backdrop-blur border border-gray-200 
  rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 group"
              >
                {/* TITLE */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 text-[15px] tracking-wide">
                    {type.label}
                  </h4>

                  {/* small badge */}
                  <span className="text-[14px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold">
                    {groupedDocs[type.key]?.length || 0} uploaded
                  </span>
                </div>

                {/* DROP ZONE */}
                <div
                  onClick={() => fileRefs.current[type.key]?.click()}
                  onDrop={(e) => handleDrop(e, type.key)}
                  onDragOver={(e) => handleDragOver(e, type.key)}
                  onDragLeave={handleDragLeave}
                  className={`cursor-pointer border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-12 px-4
    transition-all duration-300 relative overflow-hidden
    ${
      dragType === type.key
        ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 scale-[1.02] shadow-inner"
        : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/40"
    }`}
                >
                  {/* glowing background on drag */}
                  {dragType === type.key && (
                    <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
                  )}

                  {loadingType === type.key ? (
                    <>
                      <Loader2
                        className="animate-spin text-indigo-600 mb-2"
                        size={30}
                      />
                      <p className="text-sm text-indigo-600 font-semibold">
                        Uploading...
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-indigo-100 mb-3">
                        <Upload size={26} className="text-indigo-600" />
                      </div>

                      <p className="text-sm font-semibold text-gray-700">
                        Click or Drag files here
                      </p>

                      <p className="text-xs text-gray-400 mt-1 text-center">
                        Upload {type.label} • PNG, JPG, PDF
                      </p>
                    </>
                  )}

                  <input
                    ref={(el) => (fileRefs.current[type.key] = el)}
                    type="file"
                    multiple
                    hidden
                    onChange={(e) => {
                      handleUpload(type.key, e.target.files);
                      e.target.value = null;
                    }}
                  />
                </div>

                {/* FILE LIST */}
                <div className="mt-5 space-y-3 max-h-[240px] overflow-auto pr-1 custom-scroll">
                  {groupedDocs[type.key]?.map((doc) => {
                    const isImage = doc.file_url?.match(
                      /\.(jpg|jpeg|png|webp)$/i,
                    );

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between bg-gray-50 hover:bg-indigo-50 
          border border-gray-200 rounded-xl px-3 py-2.5 transition-all duration-200 group/file"
                      >
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 truncate"
                        >
                          {isImage ? (
                            <img
                              src={doc.file_url}
                              className="w-9 h-9 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <FileText size={18} className="text-indigo-600" />
                            </div>
                          )}

                          <span className="text-sm text-gray-700 truncate max-w-[170px] group-hover/file:text-indigo-600 transition">
                            {doc.file_name || "View File"}
                          </span>
                        </a>

                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 transition"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    );
                  })}

                  {groupedDocs[type.key]?.length === 0 && (
                    <div className="text-center py-6">
                      <Upload
                        size={20}
                        className="mx-auto text-gray-300 mb-2"
                      />
                      <p className="text-xs text-gray-400">
                        No documents uploaded yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-4 border-t bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2 text-sm font-semibold bg-gray-200 rounded-xl hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrewDocumentsModal;
