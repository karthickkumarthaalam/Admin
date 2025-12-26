import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AddFestivalGifModal = ({ isOpen, onClose, existingGif, onSuccess }) => {
  const [form, setForm] = useState(initialFormState());
  const [errors, setErrors] = useState({});
  const [leftPreview, setLeftPreview] = useState(null);
  const [rightPreview, setRightPreview] = useState(null);

  function initialFormState() {
    return {
      left_side_image: null,
      right_side_image: null,
      status: true, // true = active, false = inactive
    };
  }

  useEffect(() => {
    if (isOpen) {
      existingGif ? populateForm(existingGif) : resetForm();
    }
  }, [isOpen, existingGif]);

  const resetForm = () => {
    setForm(initialFormState());
    setErrors({});
    setLeftPreview(null);
    setRightPreview(null);
  };

  const populateForm = (data) => {
    setForm({
      left_side_image: null,
      right_side_image: null,
      status: data.status,
    });
    setLeftPreview(
      data.left_side_image
        ? `${BASE_URL}/${data.left_side_image.replace(/\\/g, "/")}`
        : null
    );
    setRightPreview(
      data.right_side_image
        ? `${BASE_URL}/${data.right_side_image.replace(/\\/g, "/")}`
        : null
    );
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: size check (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [type]: "Image size must be less than 5MB",
      }));
      return;
    }

    // Store file in form state
    setForm((prev) => ({ ...prev, [type]: file }));

    // Read preview safely
    const reader = new FileReader();

    reader.onloadend = () => {
      if (type === "left_side_image") setLeftPreview(reader.result);

      if (type === "right_side_image") setRightPreview(reader.result);
    };

    reader.onerror = () => {
      console.error("File reading failed");
    };

    reader.readAsDataURL(file);

    // Clear error
    setErrors((prev) => ({ ...prev, [type]: "" }));
  };

  const handleStatusChange = (e) => {
    setForm((prev) => ({ ...prev, status: e.target.value === "true" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!existingGif && !form.left_side_image)
      newErrors.left_side_image = "Left GIF is required.";
    if (!existingGif && !form.right_side_image)
      newErrors.right_side_image = "Right GIF is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = new FormData();
      payload.append("status", form.status);
      if (form.left_side_image)
        payload.append("left_side_image", form.left_side_image);
      if (form.right_side_image)
        payload.append("right_side_image", form.right_side_image);

      if (existingGif) {
        await apiCall(`/festival-gif`, "POST", payload);
        toast.success("Festival GIF updated successfully!");
      } else {
        await apiCall(`/festival-gif`, "POST", payload);
        toast.success("Festival GIF created successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save Festival GIF");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative overflow-auto max-h-[90vh] sm:max-h-[80vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {existingGif ? "Edit Festival GIF" : "Add Festival GIF"}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderFileInput(
              "Left Side GIF",
              "left_side_image",
              handleFileChange,
              leftPreview,
              errors.left_side_image
            )}
            {renderFileInput(
              "Right Side GIF",
              "right_side_image",
              handleFileChange,
              rightPreview,
              errors.right_side_image
            )}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-sm">Status</label>
            <select
              value={form.status}
              onChange={handleStatusChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
          >
            {existingGif ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  // Helper renderers
  function renderFileInput(label, type, onChange, preview, error) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <input
          type="file"
          accept="image/gif"
          onChange={(e) => onChange(e, type)}
        />
        {preview && (
          <img
            src={preview}
            alt={`${label} Preview`}
            className="mt-2 w-full max-h-60 object-contain rounded"
          />
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
};

export default AddFestivalGifModal;
