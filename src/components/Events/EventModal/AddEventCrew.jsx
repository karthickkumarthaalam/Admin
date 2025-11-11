import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  UserRound,
  Link2,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const EventCrewTab = ({ eventId }) => {
  const [crewList, setCrewList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(initialFormState());
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  function initialFormState() {
    return {
      name: "",
      role: "",
      description: "",
      social_links: [""],
      status: "inactive",
    };
  }

  /* ---------------- Fetch Crew ---------------- */
  useEffect(() => {
    if (eventId) fetchCrewList();
  }, [eventId]);

  const fetchCrewList = async () => {
    try {
      const res = await apiCall(`/event-crew/event/${eventId}`, "GET");
      setCrewList(res.data || []);
    } catch {
      toast.error("Failed to fetch crew members");
    }
  };

  /* ---------------- Form Controls ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (index, value) => {
    setForm((prev) => {
      const updated = [...prev.social_links];
      updated[index] = value;
      return { ...prev, social_links: updated };
    });
  };

  const addSocialLink = () => {
    setForm((prev) => ({
      ...prev,
      social_links: [...prev.social_links, ""],
    }));
  };

  const removeSocialLink = (index) => {
    setForm((prev) => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image file");
    }
  };

  const resetForm = () => {
    setForm(initialFormState());
    setEditingId(null);
    setShowForm(false);
    setImageFile(null);
    setImagePreview("");
  };

  const validateForm = () => {
    if (!form.name.trim()) return toast.error("Crew name is required");
    if (!form.role.trim()) return toast.error("Role is required");
    return true;
  };

  /* ---------------- Save / Update ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("event_id", eventId);
      formData.append("name", form.name);
      formData.append("role", form.role);
      formData.append("description", form.description);
      formData.append("status", form.status);
      form.social_links.forEach((link) =>
        formData.append("social_links", link)
      );
      if (imageFile) formData.append("image", imageFile);

      if (editingId) {
        await apiCall(`/event-crew/${editingId}`, "PUT", formData, {
          "Content-Type": "multipart/form-data",
        });
        toast.success("Crew member updated successfully");
      } else {
        await apiCall(`/event-crew`, "POST", formData, {
          "Content-Type": "multipart/form-data",
        });
        toast.success("Crew member added successfully");
      }

      fetchCrewList();
      resetForm();
    } catch {
      toast.error("Failed to save crew member");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Edit ---------------- */
  const handleEdit = (crew) => {
    setForm({
      name: crew.name || "",
      role: crew.role || "",
      description: crew.description || "",
      social_links: crew.social_links?.length ? crew.social_links : [""],
      status: crew.status || "inactive",
    });
    setImagePreview(crew.image || "");
    setEditingId(crew.id);
    setShowForm(true);
  };

  /* ---------------- Delete ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this crew member?"))
      return;

    setDeletingId(id);
    try {
      await apiCall(`/event-crew/${id}`, "DELETE");
      setCrewList((prev) => prev.filter((c) => c.id !== id));
      toast.success("Crew member deleted successfully");
    } catch {
      toast.error("Failed to delete crew member");
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------------- Toggle Status ---------------- */
  const toggleStatus = async (crew) => {
    const newStatus = crew.status === "active" ? "inactive" : "active";
    try {
      await apiCall(`/event-crew/${crew.id}`, "PUT", { status: newStatus });
      setCrewList((prev) =>
        prev.map((c) => (c.id === crew.id ? { ...c, status: newStatus } : c))
      );
      toast.success(`Status changed to ${newStatus}`);
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  if (!eventId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <UserRound size={48} className="mb-4 " />
        <p className="text-lg font-bold">Please save event first</p>
        <p className="text-sm mt-2">Add crew members after saving the event</p>
      </div>
    );
  }

  /* ---------------- UI Layout ---------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Event Crew</h2>
          <p className="text-sm text-gray-600 mt-1 hidden md:block">
            Manage event crew members and their details
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={18} />
          Add Crew Member
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="p-8">
            <div className="flex justify-between items-center mb-5 border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserRound className="text-blue-600" size={20} />
                {editingId ? "Edit Crew Member" : "Add Crew Member"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput
                  label="Name *"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                />
                <TextInput
                  label="Role *"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="e.g., DJ, Host, Coordinator"
                />
              </div>

              <TextArea
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe crew member responsibilities..."
              />

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                    <Link2 size={16} className="text-blue-600" />
                    Social Links
                  </label>
                  {form.social_links.map((link, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => handleSocialChange(i, e.target.value)}
                        placeholder="https://instagram.com/example"
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      {form.social_links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSocialLink(i)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="text-blue-600 text-sm font-medium hover:underline mt-1"
                  >
                    + Add another link
                  </button>
                </div>
              </div>

              {/* Image Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <label className="flex flex-col items-center justify-center w-44 h-44 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-pointer hover:border-blue-400 transition-all">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <>
                      <Upload size={28} className="text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">
                        Upload Image
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Status
                </span>
                <div
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      status: prev.status === "active" ? "inactive" : "active",
                    }))
                  }
                  className={`w-12 h-6 flex items-center rounded-full cursor-pointer transition ${
                    form.status === "active" ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
                      form.status === "active"
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  ></div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update Crew"
                  ) : (
                    "Save Crew"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crew Cards Row */}
      {crewList.length > 0 && (
        <div className="flex gap-6 ">
          {crewList.map((crew) => (
            <div key={crew.id} className="flex-shrink-0 w-full ">
              <CrewCard
                crew={crew}
                onEdit={() => handleEdit(crew)}
                onDelete={() => handleDelete(crew.id)}
                onToggle={() => toggleStatus(crew)}
                deleting={deletingId === crew.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CrewCard = ({ crew, onEdit, onDelete, onToggle, deleting }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-all duration-200">
    {/* Left: Image Section */}
    <div className="relative  bg-gray-50 flex items-center justify-center">
      <img
        src={crew.image || "https://via.placeholder.com/600x400?text=No+Image"}
        alt={crew.name}
        className="w-full h-64 md:h-full object-cover"
      />

      {/* Action Buttons (desktop view only) */}
      <div className="absolute top-3 right-3 hidden md:flex flex-col gap-2">
        <button
          onClick={onEdit}
          className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm hover:bg-blue-100 transition"
          title="Edit"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg shadow-sm transition ${
            crew.status === "active"
              ? "bg-green-50 text-green-600 hover:bg-green-100"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          title={crew.status === "active" ? "Deactivate" : "Activate"}
        >
          <CheckCircle size={16} />
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="p-2 bg-red-50 text-red-600 rounded-lg shadow-sm hover:bg-red-100 transition"
          title="Delete"
        >
          {deleting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    </div>

    {/* Right: Crew Details */}
    <div className="flex-1 p-5 md:p-8 flex flex-col gap-4">
      {/* Name & Role + Status (desktop alignment) */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{crew.name}</h3>
          <p className="text-blue-600 font-medium text-sm uppercase tracking-wide mt-0.5">
            {crew.role}
          </p>
        </div>

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-md shadow-sm w-fit sm:hidden md:block ${
            crew.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {crew.status}
        </span>
      </div>

      {/* Description */}
      {crew.description && (
        <div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            {crew.description}
          </p>
        </div>
      )}

      {/* Social Links */}
      {crew.social_links?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {crew.social_links.map(
            (link, i) =>
              link && (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition"
                >
                  <Link2 size={14} />
                  {new URL(link).hostname.replace("www.", "")}
                </a>
              )
          )}
        </div>
      )}

      {/* Mobile Action Buttons */}
      <div className="flex md:hidden justify-between items-center pt-4 mt-3 border-t border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onToggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              crew.status === "active"
                ? "bg-green-50 text-green-600 hover:bg-green-100"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {crew.status === "active" ? "Deactivate" : "Activate"}
          </button>
        </div>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
        >
          {deleting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    </div>
  </div>
);

const TextInput = ({ label, name, value, onChange, placeholder }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-700 mb-2">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>
);

const TextArea = ({ label, name, value, onChange, placeholder }) => (
  <div className="flex flex-col">
    <label className="font-medium text-sm text-gray-700 mb-2">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={6}
      className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
    />
  </div>
);

export default EventCrewTab;
