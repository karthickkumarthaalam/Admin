import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";

export const AddExperience = ({
  isOpen,
  onClose,
  onSuccess,
  editExperienceData,
}) => {
  const initialState = {
    user_id: "",
    joining_date: "",
    relieving_date: "",
    employment_type: "",
    performance_summary: "",
    issued_date: new Date().toISOString().split("T")[0],
    remarks: "",
  };

  const [form, setForm] = useState(initialState);
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const performanceOptions = [
    "Excellent",
    "Good",
    "Satisfactory",
    "Needs Improvement",
    "Poor",
  ];

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await apiCall("/system-user", "GET");
      setEmployeesList(res.data);
    } catch (error) {
      toast.error("Failed to fetch employees");
    }
  };

  // Reset modal state on close
  useEffect(() => {
    if (!isOpen) {
      setForm(initialState);
    }
  }, [isOpen]);

  // Prefill form if editing
  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && editExperienceData && employeesList.length) {
      setForm({
        user_id: editExperienceData.user_id,
        joining_date: editExperienceData.joining_date,
        relieving_date: editExperienceData.relieving_date,
        employment_type: editExperienceData.employment_type,
        performance_summary: editExperienceData.performance_summary || "",
        issued_date: editExperienceData.issued_date,
        remarks: editExperienceData.remarks || "",
      });
    }
  }, [editExperienceData, employeesList, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    const emp = employeesList.find((u) => u.id === userId);
    setForm((prev) => ({
      ...prev,
      user_id: userId,
      joining_date: emp?.date_of_joining?.split("T")[0] || "",
    }));
  };

  const handleSubmit = async () => {
    if (
      !form.user_id ||
      !form.joining_date ||
      !form.relieving_date ||
      !form.employment_type
    ) {
      toast.error(
        "Employee, Joining Date, Relieving Date, and Employment Type are required"
      );
      return;
    }

    setLoading(true);
    try {
      const endpoint = editExperienceData
        ? `/experience-letter/${editExperienceData.id}`
        : "/experience-letter";
      const method = editExperienceData ? "PUT" : "POST";

      await apiCall(endpoint, method, form);
      toast.success(
        editExperienceData
          ? "Experience updated successfully"
          : "Experience added successfully"
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save experience");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-50 rounded-2xl shadow-xl w-full h-full flex flex-col animate-fadeIn overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-red-600">
            {editExperienceData
              ? "Edit Experience Letter"
              : "Add Experience Letter"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <X size={28} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2 text-gray-800">
                Employee
              </label>
              <select
                name="user_id"
                value={form.user_id}
                onChange={handleUserChange}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-400 focus:outline-none shadow-sm"
              >
                <option value="">Select Employee</option>
                {employeesList.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Employment Type */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2 text-gray-800">
                Employment Type
              </label>
              <select
                name="employment_type"
                value={form.employment_type}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-400 focus:outline-none shadow-sm"
              >
                <option value="">Select Type</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Intern">Intern</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          {/* Dates & Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2 text-gray-800">
                Joining Date
              </label>
              <input
                type="date"
                name="joining_date"
                value={form.joining_date}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-400 focus:outline-none shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2 text-gray-800">
                Relieving Date
              </label>
              <input
                type="date"
                name="relieving_date"
                value={form.relieving_date}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-400 focus:outline-none shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2 text-gray-800">
                Issued Date
              </label>
              <input
                type="date"
                name="issued_date"
                value={form.issued_date}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-400 focus:outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Performance Summary */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2 text-gray-800">
              Performance Summary
            </label>
            <select
              name="performance_summary"
              value={form.performance_summary}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-400 focus:outline-none shadow-sm"
            >
              <option value="">Select Performance</option>
              {performanceOptions.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2 text-gray-800">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-400 focus:outline-none shadow-sm"
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-4 border-t bg-slate-100">
          <button
            onClick={onClose}
            className="border px-5 py-2 rounded-lg bg-white hover:bg-gray-100 transition shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition shadow-md"
          >
            {loading ? "Saving..." : editExperienceData ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};
