import React, { useEffect, useState } from "react";
import { apiCall } from "../../../../utils/apiCall";
import { toast } from "react-toastify";
import { X, Paperclip, Trash2, Loader2 } from "lucide-react";

const AddExpenseBill = ({
  isOpen,
  onClose,
  editData,
  financialYearId,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    title: "",
    vendor: "",
    start_date: "",
    end_date: "",
    type: "expense",
  });
  const [merchants, setMerchants] = useState([]);
  const [files, setFiles] = useState([]);
  const [existingBills, setExistingBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoadingMap, setDeleteLoadingMap] = useState({});

  // Fetch merchants for dropdown
  const fetchMerchants = async () => {
    try {
      const res = await apiCall("/merchant", "GET");
      setMerchants(res.data || []);
    } catch {
      toast.error("Failed to load merchants");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMerchants();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        vendor: editData.vendor || "",
        start_date: editData.start_date || "",
        end_date: editData.end_date || "",
        type: editData.type || "expense",
      });
      setFiles([]); // reset new files
      setExistingBills(editData.bills || []); // load existing bills
    } else {
      setForm({
        title: "",
        vendor: "",
        start_date: "",
        end_date: "",
        type: "expense",
      });
      setFiles([]);
      setExistingBills([]);
    }
  }, [editData, isOpen]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeNewFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingBill = async (billId) => {
    // Set loading only for this bill
    setDeleteLoadingMap((prev) => ({ ...prev, [billId]: true }));
    try {
      await apiCall(`/expense-bills/delete-bill-item/${billId}`, "DELETE");
      setExistingBills((prev) => prev.filter((b) => b.id !== billId));
      toast.success("Bill removed successfully");
    } catch (err) {
      toast.error("Failed to remove bill");
    } finally {
      setDeleteLoadingMap((prev) => ({ ...prev, [billId]: false }));
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.vendor || !form.start_date || !form.end_date) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("vendor", form.vendor);
      formData.append("start_date", form.start_date);
      formData.append("end_date", form.end_date);
      formData.append("type", form.type);
      formData.append("financial_year_id", financialYearId);

      files.forEach((file) => formData.append("bills", file));

      if (editData) {
        await apiCall(`/expense-bills/${editData.id}`, "PUT", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Expense Bill updated successfully");
      } else {
        await apiCall(`/expense-bills`, "POST", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Expense Bill created successfully");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save expense bill");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 relative overflow-auto max-h-[90vh] shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {editData ? "Edit Expense Bill" : "Add Expense Bill"}
        </h2>

        <div className="grid gap-3">
          {/* Vendor */}
          <label className="font-semibold text-gray-800">Vendor</label>
          <select
            value={form.vendor}
            onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            className="border rounded px-3 py-2 focus:ring focus:ring-red-300 outline-none"
          >
            <option value="">Select Vendor</option>
            {merchants.map((m) => (
              <option key={m.id} value={m.merchant_name}>
                {m.merchant_name}
              </option>
            ))}
          </select>

          {/* Title */}
          <label className="font-semibold text-gray-700">Bill Title</label>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border rounded px-3 py-2 focus:ring focus:ring-red-300 outline-none"
          />

          {/* Dates */}
          <label className="font-semibold text-gray-700">Billing Periods</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="border rounded px-3 py-2 w-full focus:ring focus:ring-red-300 outline-none"
            />
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="border rounded px-3 py-2 w-full focus:ring focus:ring-red-300 outline-none"
            />
          </div>

          {/* Type */}
          <label className="font-semibold text-gray-700">Bill Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border rounded px-3 py-2 focus:ring focus:ring-red-300 outline-none"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          {/* Upload new files */}
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-red-400 transition">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <Paperclip className="text-gray-500 mb-1" />
            <span className="text-sm text-gray-500">
              {files.length > 0
                ? `${files.length} new file(s) selected`
                : "Upload new files"}
            </span>
          </label>

          {/* Existing bills */}
          {existingBills.length > 0 && (
            <div>
              <h4 className="font-medium mt-2 mb-1 text-gray-700">
                Existing Bills
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {existingBills.map((bill) => (
                  <li
                    key={bill.id}
                    className="flex justify-between items-center bg-gray-100 rounded px-2 py-1"
                  >
                    <a
                      href={bill.bill_address}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-blue-600 hover:underline"
                    >
                      {bill.bill_address.split("/").pop()}
                    </a>
                    <button
                      onClick={() => removeExistingBill(bill.id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                      disabled={deleteLoadingMap[bill.id]}
                    >
                      <Trash2 size={14} /> Delete
                      {deleteLoadingMap[bill.id] && (
                        <Loader2
                          className="text-red-500 animate-spin"
                          size={14}
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* New files */}
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-100 rounded px-2 py-1"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    onClick={() => removeNewFile(index)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded bg-red-500 text-white flex items-center gap-2 hover:bg-red-600"
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {editData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseBill;
