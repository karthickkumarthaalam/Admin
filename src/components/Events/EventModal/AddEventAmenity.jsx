import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ClipboardList,
  Image as ImageIcon,
  X,
  CircleX,
  CheckCircle,
} from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const EventAmenityTab = ({ eventId }) => {
  const [amenities, setAmenities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialFormState());
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  function initialFormState() {
    return {
      name: "",
      description: "",
      amenity_image: null,
    };
  }

  useEffect(() => {
    if (eventId) fetchAmenities();
  }, [eventId]);

  const fetchAmenities = async () => {
    try {
      const res = await apiCall(`/event-amenity/event/${eventId}`, "GET");
      setAmenities(res.data || []);
    } catch {
      toast.error("Failed to fetch amenities");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      setForm((prev) => ({ ...prev, amenity_image: file }));
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm(initialFormState());
    setEditingId(null);
    setShowForm(false);
    setPreviewImage(null);
  };

  const validateForm = () => {
    if (!form.name.trim()) return toast.error("Amenity name is required");
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
      formData.append("description", form.description);
      if (form.amenity_image instanceof File)
        formData.append("amenity_image", form.amenity_image);

      if (editingId) {
        await apiCall(`/event-amenity/${editingId}`, "PUT", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Amenity updated successfully");
      } else {
        await apiCall(`/event-amenity`, "POST", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Amenity added successfully");
      }

      fetchAmenities();
      resetForm();
    } catch {
      toast.error("Failed to save amenity");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description || "",
      amenity_image: null,
    });
    setPreviewImage(item.image || null);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this amenity?"))
      return;
    setDeletingId(id);
    try {
      await apiCall(`/event-amenity/${id}`, "DELETE");
      setAmenities((prev) => prev.filter((a) => a.id !== id));
      toast.success("Amenity deleted successfully");
    } catch {
      toast.error("Failed to delete amenity");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdatestatus = async (id, newStatus) => {
    if (
      !window.confirm("Are you sure, you want to update status this Amenity? ")
    )
      return;
    try {
      await apiCall(`/event-amenity/status/${id}`, "PATCH", {
        status: newStatus,
      });

      setAmenities((prev) =>
        prev.map((amenity) =>
          amenity.id === id ? { ...amenity, status: newStatus } : amenity
        )
      );
      toast.success("Amenities Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (!eventId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <ClipboardList size={48} className="mb-4 " />
        <p className="text-lg font-bold">Please save event first</p>
        <p className="text-sm mt-2">Add amenities after saving the event</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Event Amenities
          </h2>
          <p className="hidden md:block text-sm text-gray-600 mt-1">
            Manage amenities available for this event
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={18} />
          Add Amenity
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="p-8">
            <div className="flex justify-between items-center mb-5 border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardList className="text-blue-600" size={20} />
                {editingId ? "Edit Amenity" : "Add Amenity"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              encType="multipart/form-data"
            >
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <TextInput
                    label="Name *"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Free Parking, WiFi"
                  />
                  <TextArea
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter a short description of the amenity..."
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium text-sm text-gray-700 mb-2">
                    Amenity Image
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center justify-center w-80 h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-contain rounded-xl"
                        />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <ImageIcon size={32} />
                          <span className="text-xs mt-2">Upload Image</span>
                        </div>
                      )}
                      <input
                        type="file"
                        name="amenity_image"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                    {previewImage && (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(null)}
                        className=" text-red-600  hover:bg-red-200 p-2 rounded-md"
                      >
                        <Trash2 size={24} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Upload */}

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : editingId ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Amenity List */}
      {amenities.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {amenities.map((amenity) => (
            <AmenityCard
              key={amenity.id}
              amenity={amenity}
              onEdit={() => handleEdit(amenity)}
              onUpdateStatus={handleUpdatestatus}
              onDelete={() => handleDelete(amenity.id)}
              deleting={deletingId === amenity.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10 italic">
          No amenities added yet.
        </div>
      )}
    </div>
  );
};

/* ---------------- Components ---------------- */
const AmenityCard = ({
  amenity,
  onEdit,
  onDelete,
  onUpdateStatus,
  deleting,
}) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between relative">
    {amenity.image && (
      <img
        src={amenity.image}
        alt={amenity.name}
        className="w-full h-48 object-cover rounded-lg mb-3"
      />
    )}
    <div>
      <h4 className="text-lg font-semibold text-gray-900 mb-1">
        {amenity.name}
      </h4>
      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
        {amenity.description || "No description provided."}
      </p>
    </div>

    <div className="flex justify-between items-center">
      <button
        onClick={() =>
          onUpdateStatus(
            amenity.id,
            amenity.status === "active" ? "inactive" : "active"
          )
        }
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
          amenity.status === "active"
            ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
            : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
        }`}
      >
        {amenity.status === "active" ? (
          <>
            <CheckCircle size={16} className="text-green-600" />
            Active
          </>
        ) : (
          <>
            <CircleX size={16} className="text-red-500" />
            Inactive
          </>
        )}
      </button>
      <div className="flex justify-end gap-2 mt-auto">
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
        >
          {deleting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
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
      rows={4}
      className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
    />
  </div>
);

export default EventAmenityTab;
