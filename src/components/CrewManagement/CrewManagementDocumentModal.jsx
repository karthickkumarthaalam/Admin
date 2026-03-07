import React, { useEffect, useState, useRef } from "react";
import { Upload, X, Loader2, Trash2, FileText } from "lucide-react";
import { apiCall } from "../../utils/apiCall";
import { toast } from "react-toastify";

const documentTypes = [
  { key: "invitation_letter", label: "Invitation Letter" },
  { key: "covering_letter", label: "Covering Letter" },
  { key: "crew_list", label: "Crew List" },
  { key: "flyer", label: "Flyer" },
  { key: "thaalam_profile", label: "Thaalam Profile" },
  { key: "hotel_itinerary", label: "Hotel Itinerary" },
  { key: "switzerland_residence_id", label: "Swiss Residence ID" },
  { key: "company_registration", label: "Company Registration" },
  { key: "passport", label: "Passport" },
];

const CrewManagementDocumentModal = ({
  isOpen,
  onClose,
  crew,
  selectedType,
}) => {
  const [documents, setDocuments] = useState([]);
  const [loadingType, setLoadingType] = useState(null);
  const [dragType, setDragType] = useState(null);

  const fileRefs = useRef({});
  const sectionRefs = useRef({});

  const fetchDocs = async () => {
    if (!crew) return;

    try {
      const res = await apiCall(`/crew-management-document/${crew.id}`);
      setDocuments(res.data || []);
    } catch {
      toast.error("Failed to load documents");
    }
  };

  useEffect(() => {
    if (isOpen && selectedType && sectionRefs.current[selectedType]) {
      sectionRefs.current[selectedType].scrollIntoView({
        behaviour: "smooth",
        block: "center",
      });
    }
  }, [isOpen, selectedType]);

  useEffect(() => {
    if (isOpen) {
      fetchDocs();
    }
  }, [isOpen]);

  const handleUpload = async (type, files) => {
    if (!files.length) return;

    const formData = new FormData();
    formData.append("crew_management_id", crew.id);
    formData.append("document_type", type);

    [...files].forEach((file) => formData.append("files", file));

    try {
      setLoadingType(type);

      await apiCall(
        "/crew-management-document/upload-multiple",
        "POST",
        formData,
        true,
      );

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
      await apiCall(`/crew-management-document/${id}`, "DELETE");
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
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-6 bg-gray-800 border-b border-gray-200">
          <div>
            <h2 className="text-xl text-gray-100 font-semibold">
              {crew?.title || "Crew Management"}
            </h2>
            <p className="text-blue-300 text-sm">Documents</p>
          </div>

          <button onClick={onClose}>
            <X className="text-gray-100" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-auto px-10 py-8 bg-gradient-to-br from-slate-50 to-gray-100 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {documentTypes.map((type) => (
              <div
                key={type.key}
                ref={(el) => (sectionRefs.current[type.key] = el)}
                className={`relative bg-white/90 backdrop-blur border rounded-3xl p-6 
    shadow-sm transition-all duration-300 group
    ${
      selectedType === type.key
        ? "ring-2 ring-indigo-500 border-indigo-400 shadow-xl scale-[1.02]"
        : "border-gray-200 hover:shadow-2xl"
    }`}
              >
                {/* TITLE */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 text-[15px]">
                    {type.label}
                  </h4>

                  <span className="text-[13px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold">
                    {groupedDocs[type.key]?.length || 0} uploaded
                  </span>
                </div>

                {/* DROP ZONE */}
                <div
                  onClick={() => fileRefs.current[type.key]?.click()}
                  onDrop={(e) => handleDrop(e, type.key)}
                  onDragOver={(e) => handleDragOver(e, type.key)}
                  onDragLeave={handleDragLeave}
                  className={`cursor-pointer border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-10 px-4
                  ${
                    dragType === type.key
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/40"
                  }`}
                >
                  {loadingType === type.key ? (
                    <>
                      <Loader2
                        className="animate-spin text-indigo-600 mb-2"
                        size={26}
                      />
                      <p className="text-sm text-indigo-600 font-semibold">
                        Uploading...
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={26} className="text-indigo-600 mb-2" />

                      <p className="text-sm font-semibold text-gray-700">
                        Click or Drag files
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, PDF
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
                <div className="mt-4 space-y-2 max-h-[200px] overflow-auto">
                  {groupedDocs[type.key]?.map((doc) => {
                    const isImage = doc.file_url?.match(
                      /\.(jpg|jpeg|png|webp)$/i,
                    );

                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between bg-gray-50 border rounded-xl px-3 py-2"
                      >
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 truncate"
                        >
                          {isImage ? (
                            <img
                              src={doc.file_url}
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <FileText size={18} className="text-indigo-600" />
                          )}

                          <span className="text-sm truncate max-w-[160px]">
                            {doc.file_name || "View File"}
                          </span>
                        </a>

                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    );
                  })}

                  {groupedDocs[type.key]?.length === 0 && (
                    <div className="text-center py-6 text-xs text-gray-400">
                      No documents uploaded
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

export default CrewManagementDocumentModal;
