import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  X,
  Loader2,
  Plus,
  FileText,
  Upload,
  Globe,
  Calendar,
  ShieldCheck,
  Edit2,
  Trash2,
  Eye,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const AddCrewVisaModal = ({ isOpen, onClose, crewMember }) => {
  const [visas, setVisas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = useMemo(
    () => ({
      visa_type: "tourist",
      visa_number: "",
      country: "",
      date_of_issue: "",
      date_of_expiry: "",
      visa_verified: false,
      remarks: "",
      newVisaFile: null,
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  // ================= FETCH =================
  const fetchVisas = useCallback(async () => {
    if (!crewMember?.id) return;

    try {
      setLoading(true);
      const res = await apiCall(`/crew-visa/${crewMember.id}`, "GET");
      setVisas(res.data || []);
    } catch {
      toast.error("Failed to fetch visas");
    } finally {
      setLoading(false);
    }
  }, [crewMember?.id]);

  useEffect(() => {
    if (isOpen) fetchVisas();
  }, [isOpen, fetchVisas]);

  // ================= SAVE =================
  const saveVisa = async () => {
    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("crew_list_id", crewMember.id);

      Object.keys(form).forEach((k) => {
        if (k !== "newVisaFile") fd.append(k, form[k] || "");
      });

      if (form.newVisaFile) fd.append("visa_file", form.newVisaFile);

      if (editingId) {
        await apiCall(`/crew-visa/update/${editingId}`, "PUT", fd, true);
        toast.success("Visa updated");
      } else {
        await apiCall("/crew-visa/create", "POST", fd, true);
        toast.success("Visa added");
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchVisas();
    } catch {
      toast.error("Failed to save visa");
    } finally {
      setSaving(false);
    }
  };

  // ================= DELETE =================
  const deleteVisa = async (id) => {
    if (!window.confirm("Delete this visa?")) return;

    try {
      await apiCall(`/crew-visa/delete/${id}`, "DELETE");
      toast.success("Visa deleted");
      fetchVisas();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= EDIT =================
  const startEdit = (v) => {
    setEditingId(v.id);
    setForm({ ...v, newVisaFile: null });
    setShowForm(true);
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full h-full rounded-lg shadow-xl flex flex-col overflow-hidden animate-slideUp">
        {/* HEADER (same as flight modal) */}
        <div className="p-4 border-b bg-gradient-to-r from-gray-800 to-gray-800 text-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6" />
              Visa Management
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Managing visas for:{" "}
              <span className="font-semibold">
                {crewMember?.given_name} {crewMember?.sur_name}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* ADD BUTTON */}
          <div className="flex justify-end">
            {!showForm && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setShowForm(true);
                }}
                className="whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg shadow-md bg-gradient-to-r  from-blue-600 hover:from-blue-700 to-blue-700 hover:to-blue-800 text-white text-sm "
              >
                <Plus className="h-4 w-4" />
                Add Visa
              </button>
            )}
          </div>

          {showForm && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                {editingId ? "Edit Visa" : "Add New Visa"}
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* VISA TYPE */}
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">
                    Visa Type *
                  </label>
                  <select
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-sm
          transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                    value={form.visa_type}
                    onChange={(e) =>
                      setForm({ ...form, visa_type: e.target.value })
                    }
                  >
                    <option value="">Select Type</option>
                    <option value="tourist">Tourist</option>
                    <option value="business">Business</option>
                    <option value="work">Work</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                {/* VISA NUMBER */}
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">
                    Visa Number
                  </label>
                  <input
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-sm
          transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                    placeholder="Enter visa number"
                    value={form.visa_number}
                    onChange={(e) =>
                      setForm({ ...form, visa_number: e.target.value })
                    }
                  />
                </div>

                {/* COUNTRY */}
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">
                    Country *
                  </label>
                  <input
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-sm
          transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                    placeholder="e.g., USA, UK"
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                  />
                </div>

                {/* ISSUE DATE */}
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-sm
          transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                    value={form.date_of_issue}
                    onChange={(e) =>
                      setForm({ ...form, date_of_issue: e.target.value })
                    }
                  />
                </div>

                {/* EXPIRY DATE */}
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 font-medium">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-sm
          transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                    value={form.date_of_expiry}
                    onChange={(e) =>
                      setForm({ ...form, date_of_expiry: e.target.value })
                    }
                  />
                </div>

                {/* VERIFIED */}
                <div className="space-y-1 flex items-center gap-3 mt-6">
                  <input
                    type="checkbox"
                    checked={form.visa_verified}
                    onChange={(e) =>
                      setForm({ ...form, visa_verified: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <label className="text-sm text-gray-700 font-medium">
                    Visa Verified
                  </label>
                </div>

                {/* REMARKS */}
                <div className="space-y-1 lg:col-span-2">
                  <label className="text-sm text-gray-700 font-medium">
                    Remarks
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 shadow-sm
          transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                    rows="2"
                    placeholder="Add remarks..."
                    value={form.remarks}
                    onChange={(e) =>
                      setForm({ ...form, remarks: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* FILE + BUTTON */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
                {/* FILE */}
                <label className="flex w-full max-w-md items-center gap-2 bg-white border-2 border-dashed border-gray-300 px-4 py-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {form.newVisaFile
                      ? form.newVisaFile.name
                      : "Upload Visa Document"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      setForm({ ...form, newVisaFile: e.target.files[0] })
                    }
                  />
                </label>

                {/* BUTTONS */}
                <div className="flex gap-2 items-center">
                  <button
                    onClick={saveVisa}
                    disabled={saving}
                    className="whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg shadow-md bg-gradient-to-r  from-blue-600 hover:from-blue-700 to-blue-700 hover:to-blue-800 text-white text-sm "
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {editingId ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        {editingId ? "Update Visa" : "Add Visa"}
                      </>
                    )}
                  </button>

                  <button
                    onClick={cancelForm}
                    className="px-5 py-2 border bg-white rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LIST */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : visas.length === 0 && !showForm ? (
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-12 text-center shadow-sm">
              {/* Background glow */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_60%)]"></div>

              <div className="relative z-10 flex flex-col items-center">
                {/* ICON */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-lg mb-5 animate-float">
                  <ShieldCheck className="h-10 w-10 text-white" />
                </div>

                {/* TITLE */}
                <h3 className="text-xl font-semibold text-gray-800 tracking-tight">
                  No Visas Added Yet
                </h3>

                {/* DESCRIPTION */}
                <p className="text-gray-500 mt-2 max-w-sm">
                  Start managing crew travel documentation by adding visa
                  details. All saved visas will appear here.
                </p>

                {/* CTA */}
                <div className="mt-6 flex items-center gap-2 text-sm text-blue-600 bg-blue-100 px-4 py-2 rounded-full">
                  <span className="animate-pulse">🛂</span>
                  Click <span className="font-semibold">"Add Visa"</span> to
                  begin
                </div>
              </div>

              {/* Floating animation */}
              <style>{`
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
        100% { transform: translateY(0px); }
      }
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
    `}</style>
            </div>
          ) : (
            <div className="space-y-4">
              {visas.map((v) => (
                <div
                  key={v.id}
                  className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-[2px]"
                >
                  {/* LEFT BORDER ACCENT */}
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-white via-blue-500 to-white rounded-l-2xl opacity-80 group-hover:opacity-100"></div>

                  <div className="flex flex-wrap justify-between gap-6">
                    {/* ================= LEFT CONTENT ================= */}
                    <div className="flex-1 min-w-[260px]">
                      {/* HEADER */}
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-md">
                          <ShieldCheck className="h-5 w-5 text-white" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 tracking-tight">
                            {v.country || "Country not set"}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                            <span className="font-semibold text-gray-700 capitalize">
                              {v.visa_type}
                            </span>

                            {v.visa_number && (
                              <>
                                <span>•</span>
                                <span>#{v.visa_number}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* DATE SECTION */}
                      <div className="grid sm:grid-cols-2 gap-6 mt-5">
                        {/* ISSUE */}
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Issue Date</p>
                            <p className="text-sm font-semibold text-gray-800">
                              {v.date_of_issue
                                ? new Date(v.date_of_issue).toLocaleDateString()
                                : "-"}
                            </p>
                          </div>
                        </div>

                        {/* EXPIRY */}
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Expiry Date</p>
                            <p className="text-sm font-semibold text-gray-800">
                              {v.date_of_expiry
                                ? new Date(
                                    v.date_of_expiry,
                                  ).toLocaleDateString()
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* STATUS */}
                      <div className="flex items-center gap-3 mt-5 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide
          ${
            v.visa_verified
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
                        >
                          {v.visa_verified ? "VERIFIED" : "NOT VERIFIED"}
                        </span>

                        {/* expiry badge */}
                        {v.date_of_expiry && (
                          <span
                            className={`text-xs px-3 py-1 rounded-full
            ${
              new Date(v.date_of_expiry) < new Date()
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-700"
            }`}
                          >
                            {new Date(v.date_of_expiry) < new Date()
                              ? "Expired"
                              : "Active"}
                          </span>
                        )}
                      </div>

                      {/* REMARKS */}
                      {v.remarks && (
                        <div className="mt-3">
                          <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p>{v.remarks}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ================= RIGHT ACTIONS ================= */}
                    <div className="flex flex-col items-end justify-between gap-3">
                      {/* ACTION BUTTONS */}
                      <div className="flex gap-2">
                        {v.visa_file_url && (
                          <a
                            href={v.visa_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="View Visa"
                          >
                            View Document
                          </a>
                        )}

                        <button
                          onClick={() => startEdit(v)}
                          className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                          title="Edit Visa"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() => deleteVisa(v.id)}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Delete Visa"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* MINI COUNTRY */}
                      <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-400">
                        <Globe size={12} />
                        {v.country}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCrewVisaModal;
