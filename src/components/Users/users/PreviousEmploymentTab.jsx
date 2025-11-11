import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Briefcase,
  Phone,
  User,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const PreviousEmploymentTab = ({ userId }) => {
  const [employments, setEmployments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialFormState());

  function initialFormState() {
    return {
      company_name: "",
      designation: "",
      from_date: "",
      to_date: "",
      responsibilities: "",
      reason_for_leaving: "",
      reference_name: "",
      reference_contact: "",
    };
  }

  useEffect(() => {
    if (userId) {
      fetchEmployments();
    }
  }, [userId]);

  const fetchEmployments = async () => {
    try {
      const res = await apiCall(
        `/previous-employment?system_user_id=${userId}`,
        "GET"
      );
      setEmployments(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch previous employment records");
    }
  };

  const resetForm = () => {
    setForm(initialFormState());
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.company_name.trim()) {
      toast.error("Company name is required");
      return false;
    }
    if (!form.designation.trim()) {
      toast.error("Designation is required");
      return false;
    }
    if (!form.from_date) {
      toast.error("From date is required");
      return false;
    }
    if (form.to_date && new Date(form.to_date) < new Date(form.from_date)) {
      toast.error("To date cannot be before from date");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        system_user_id: userId,
      };

      if (editingId) {
        await apiCall(`/previous-employment/${editingId}`, "PUT", payload);
        toast.success("Employment record updated successfully");
      } else {
        await apiCall("/previous-employment", "POST", payload);
        toast.success("Employment record added successfully");
      }

      resetForm();
      fetchEmployments();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save employment record"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employment) => {
    setForm({
      company_name: employment.company_name || "",
      designation: employment.designation || "",
      from_date: employment.from_date ? employment.from_date.split("T")[0] : "",
      to_date: employment.to_date ? employment.to_date.split("T")[0] : "",
      responsibilities: employment.responsibilities || "",
      reason_for_leaving: employment.reason_for_leaving || "",
      reference_name: employment.reference_name || "",
      reference_contact: employment.reference_contact || "",
    });
    setEditingId(employment.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await apiCall(`/previous-employment/${id}`, "DELETE");
      toast.success("Employment record deleted successfully");
      fetchEmployments();
    } catch (error) {
      toast.error("Failed to delete employment record");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const getDuration = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = toDate ? new Date(toDate) : new Date();

    const months =
      (to.getFullYear() - from.getFullYear()) * 12 +
      (to.getMonth() - from.getMonth());

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0)
      return `${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
    if (remainingMonths === 0) return `${years} year${years !== 1 ? "s" : ""}`;

    return `${years} year${years !== 1 ? "s" : ""} ${remainingMonths} month${
      remainingMonths !== 1 ? "s" : ""
    }`;
  };

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Briefcase size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">Please save user details first</p>
        <p className="text-sm mt-2">
          Add previous employment records after saving the user
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Previous Employment
          </h2>
          <p className="hidden md:block text-sm text-gray-600 mt-1">
            Manage previous employment records for this user
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex text-xs md:text-sm items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Employment
        </button>
      </div>

      {/* Employment Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Employment Record" : "Add Employment Record"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TextInput
                  label="Company Name *"
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  placeholder="Enter company name"
                />
                <TextInput
                  label="Designation *"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="Enter job title"
                />
                <DateInput
                  label="From Date *"
                  name="from_date"
                  value={form.from_date}
                  onChange={handleChange}
                />
                <DateInput
                  label="To Date"
                  name="to_date"
                  value={form.to_date}
                  onChange={handleChange}
                  helpText="Leave empty if currently working"
                />
                <TextInput
                  label="Reference Name"
                  name="reference_name"
                  value={form.reference_name}
                  onChange={handleChange}
                  placeholder="Reference contact person"
                />
                <TextInput
                  label="Reference Contact"
                  name="reference_contact"
                  value={form.reference_contact}
                  onChange={handleChange}
                  placeholder="Phone or email"
                />
              </div>

              <TextArea
                label="Responsibilities"
                name="responsibilities"
                value={form.responsibilities}
                onChange={handleChange}
                rows={3}
                placeholder="Describe key responsibilities and achievements..."
              />

              <TextArea
                label="Reason for Leaving"
                name="reason_for_leaving"
                value={form.reason_for_leaving}
                onChange={handleChange}
                rows={2}
                placeholder="Reason for leaving the company..."
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
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <Save size={16} />
                  {loading
                    ? "Saving..."
                    : editingId
                    ? "Update Record"
                    : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employment List */}
      <div className="space-y-4">
        {employments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No employment records
            </h3>
            <p className="text-gray-600 mb-4">
              Add previous employment records to get started
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add First Record
            </button>
          </div>
        ) : (
          employments.map((employment) => (
            <EmploymentCard
              key={employment.id}
              employment={employment}
              onEdit={() => handleEdit(employment)}
              onDelete={() => handleDelete(employment.id)}
              formatDate={formatDate}
              getDuration={getDuration}
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
const EmploymentCard = ({
  employment,
  onEdit,
  onDelete,
  formatDate,
  getDuration,
}) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {employment.designation}
              </h3>
              <p className="text-blue-600 font-medium mt-1">
                {employment.company_name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatDate(employment.from_date)} -{" "}
                {formatDate(employment.to_date)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {getDuration(employment.from_date, employment.to_date)}
              </p>
            </div>
          </div>

          {employment.responsibilities && (
            <div className="mt-4">
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {employment.responsibilities}
              </p>
            </div>
          )}

          {(employment.reason_for_leaving || employment.reference_name) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              {employment.reason_for_leaving && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Reason for Leaving
                  </p>
                  <p className="text-sm text-gray-600">
                    {employment.reason_for_leaving}
                  </p>
                </div>
              )}
              {employment.reference_name && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Reference
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} />
                    <span>{employment.reference_name}</span>
                    {employment.reference_contact && (
                      <>
                        <span>•</span>
                        <Phone size={14} />
                        <span>{employment.reference_contact}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const TextInput = ({ label, name, value, onChange, placeholder, helpText }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-700 mb-2">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    />
    {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
  </div>
);

const DateInput = ({ label, name, value, onChange, helpText }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-700 mb-2">{label}</label>
    <input
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    />
    {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
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
      className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
    />
  </div>
);

export default PreviousEmploymentTab;
