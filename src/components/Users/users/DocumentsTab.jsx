import React, { useState, useEffect } from "react";
import {
  Plus,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Upload,
  X,
  Shield,
  AlertCircle,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const DocumentsTab = ({ userId, idType = "system_user" }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [form, setForm] = useState(initialFormState());

  const documentTypes = [
    { value: "aadhaar", label: "Aadhaar Card", icon: "🆔" },
    { value: "pan", label: "PAN Card", icon: "💳" },
    { value: "experience_letter", label: "Experience Letter", icon: "📄" },
    { value: "bank_passbook", label: "Bank Passbook", icon: "🏦" },
    { value: "offer_letter", label: "Offer Letter", icon: "📝" },
    { value: "relieving_letter", label: "Relieving Letter", icon: "📑" },
    {
      value: "education_certificate",
      label: "Education Certificate",
      icon: "🎓",
    },
    { value: "other", label: "Other Document", icon: "📎" },
  ];

  function initialFormState() {
    return {
      doc_type: "",
      file: null,
      notes: "",
    };
  }

  useEffect(() => {
    if (userId) {
      fetchDocuments();
    }
  }, [userId]);

  const fetchDocuments = async () => {
    try {
      const params = idType === "user" ? "user_id" : "system_user_id";
      const res = await apiCall(
        `/employee-documents?${params}=${userId}`,
        "GET"
      );
      setDocuments(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch documents");
    }
  };

  const resetForm = () => {
    setForm(initialFormState());
    setShowUploadForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Check file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload PDF, JPG, PNG, or Word documents only");
        return;
      }

      setForm((prev) => ({ ...prev, file }));
    }
  };

  const validateForm = () => {
    if (!form.doc_type) {
      toast.error("Please select document type");
      return false;
    }
    if (!form.file) {
      toast.error("Please select a file to upload");
      return false;
    }
    return true;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", form.file);
      const idField = idType === "user" ? "user_id" : "system_user_id";
      formData.append(idField, userId);
      formData.append("doc_type", form.doc_type);
      if (form.notes) {
        formData.append("notes", form.notes);
      }

      await apiCall("/employee-documents", "POST", formData, true);
      toast.success("Document uploaded successfully");

      resetForm();
      fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (docId) => {
    try {
      await apiCall(`/employee-documents/verify/${docId}`, "PUT");
      toast.success("Document verified successfully");
      fetchDocuments();
    } catch (error) {
      toast.error("Failed to verify document");
    }
  };

  const handleDelete = async (docId, fileName) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await apiCall(`/employee-documents/${docId}`, "DELETE");
      toast.success("Document deleted successfully");
      fetchDocuments();
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  const handleView = (document) => {
    // Open document in new tab for viewing
    window.open(document.file_url, "_blank");
  };

  const getDocumentTypeInfo = (docType) => {
    return (
      documentTypes.find((doc) => doc.value === docType) || {
        label: docType,
        icon: "📎",
      }
    );
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["pdf"].includes(ext)) return "📄";
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "🖼️";
    if (["doc", "docx"].includes(ext)) return "📝";
    return "📎";
  };

  const getFileSize = (file) => {
    if (!file) return "";
    const sizeInKB = Math.round(file.size / 1024);
    if (sizeInKB < 1024) return `${sizeInKB} KB`;
    return `${(sizeInKB / 1024).toFixed(1)} MB`;
  };

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <FileText size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">Please save user details first</p>
        <p className="text-sm mt-2">Upload documents after saving the user</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Employee Documents
          </h2>
          <p className="hidden md:block text-sm text-gray-600 mt-1">
            Manage and verify employee documents
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex text-xs md:text-sm items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Upload Document
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload New Document
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SelectInput
                  label="Document Type *"
                  name="doc_type"
                  value={form.doc_type}
                  onChange={handleChange}
                  options={documentTypes}
                />

                <FileInput
                  label="Document File *"
                  file={form.file}
                  onChange={handleFileChange}
                  getFileIcon={getFileIcon}
                  getFileSize={getFileSize}
                />
              </div>

              <TextArea
                label="Notes (Optional)"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Add any notes about this document..."
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    uploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <Upload size={16} />
                  {uploading ? "Uploading..." : "Upload Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No documents uploaded
            </h3>
            <p className="text-gray-600 mb-4">
              Upload documents to get started
            </p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Upload First Document
            </button>
          </div>
        ) : (
          documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onVerify={() => handleVerify(document.id)}
              onDelete={() => handleDelete(document.id, document.file_name)}
              onView={() => handleView(document)}
              getDocumentTypeInfo={getDocumentTypeInfo}
              getFileIcon={getFileIcon}
            />
          ))
        )}
      </div>
    </div>
  );
};

/* ----------------------------- */
/* Reusable Components           */
/* ----------------------------- */
const DocumentCard = ({
  document,
  onVerify,
  onDelete,
  onView,
  getDocumentTypeInfo,
  getFileIcon,
}) => {
  const docTypeInfo = getDocumentTypeInfo(document.doc_type);

  return (
    <div
      className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow ${
        document.verified ? "border-green-200" : "border-gray-200"
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{docTypeInfo.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {docTypeInfo.label}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {document.verified ? (
              <div
                className="flex items-center gap-1 text-green-600"
                title="Verified"
              >
                <CheckCircle size={16} />
              </div>
            ) : (
              <div
                className="flex items-center gap-1 text-yellow-600"
                title="Pending Verification"
              >
                <AlertCircle size={16} />
              </div>
            )}
          </div>
        </div>

        {/* File Info */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-3">
          <span className="text-sm">{getFileIcon(document.file_name)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {document.file_name}
            </p>
          </div>
        </div>

        {/* Notes */}
        {document.notes && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 line-clamp-2">
              {document.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex gap-1">
            <button
              onClick={onView}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="View"
            >
              <Download size={14} />
            </button>
          </div>

          <div className="flex gap-1">
            {!document.verified && (
              <button
                onClick={onVerify}
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Verify Document"
              >
                <Shield size={14} />
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SelectInput = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-700 mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    >
      <option value="">Select Document Type</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.icon} {option.label}
        </option>
      ))}
    </select>
  </div>
);

const FileInput = ({ label, file, onChange, getFileIcon, getFileSize }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-700 mb-2">{label}</label>

    {file ? (
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="text-xl">{getFileIcon(file.name)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">{getFileSize(file)}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ target: { files: [null] } })}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
        <Upload size={24} className="text-gray-400" />
        <div className="text-center">
          <span className="text-sm font-medium text-gray-600">
            Click to upload
          </span>
          <p className="text-xs text-gray-500 mt-1">
            PDF, JPG, PNG, DOC (max 5MB)
          </p>
        </div>
        <input
          type="file"
          onChange={onChange}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
      </label>
    )}
  </div>
);

const TextArea = ({ label, name, value, onChange, rows = 3, placeholder }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-700 mb-2">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
    />
  </div>
);

export default DocumentsTab;
