import React, { useEffect, useState } from "react";
import { X, UploadCloud, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";

import { apiCall } from "../../../utils/apiCall";

const AddAdvertisementModal = ({
  isOpen,
  onClose,
  onSuccess,
  editAdvertisementData,
}) => {
  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState("");

  const [formData, setFormData] = useState({
    headline: "",
    tag: "",
    sub: "",
    cta: "",
    redirect_link: "",
    is_active: true,
    start_date: "",
    end_date: "",
    size: "small",
  });

  const [image, setImage] = useState(null);

  // ─────────────────────────────────────────────
  // Format Date
  // ─────────────────────────────────────────────
  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // ─────────────────────────────────────────────
  // Edit Mode
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (editAdvertisementData) {
      setFormData({
        headline: editAdvertisementData.headline || "",
        tag: editAdvertisementData.tag || "",
        sub: editAdvertisementData.sub || "",
        cta: editAdvertisementData.cta || "",
        redirect_link: editAdvertisementData.redirect_link || "",
        is_active: editAdvertisementData.is_active ?? true,
        start_date: editAdvertisementData.start_date
          ? formatDate(editAdvertisementData.start_date)
          : "",
        end_date: editAdvertisementData.end_date
          ? formatDate(editAdvertisementData.end_date)
          : "",
        size: editAdvertisementData.size || "small",
      });

      setPreview(editAdvertisementData.image_url || "");
    } else {
      setFormData({
        headline: "",
        tag: "",
        sub: "",
        cta: "",
        redirect_link: "",
        is_active: true,
        start_date: "",
        end_date: "",
        size: "small",
      });

      setPreview("");
      setImage(null);
    }
  }, [editAdvertisementData]);

  // ─────────────────────────────────────────────
  // Handle Change
  // ─────────────────────────────────────────────
  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ─────────────────────────────────────────────
  // Handle Image
  // ─────────────────────────────────────────────
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);

    setPreview(URL.createObjectURL(file));
  };

  // ─────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (image) {
        payload.append("image", image);
      }

      if (editAdvertisementData) {
        await apiCall(
          `/news-advertisement/${editAdvertisementData.id}`,
          "PUT",
          payload,
          true,
        );

        toast.success("Advertisement updated successfully");
      } else {
        await apiCall("/news-advertisement", "POST", payload, true);

        toast.success("Advertisement created successfully");
      }

      onSuccess();
    } catch (error) {
      toast.error("Failed to save advertisement");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl border border-gray-100 flex flex-col">
        {" "}
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-slate-100 rounded-t-2xl border-gray-100 p-6">
          {" "}
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {editAdvertisementData
                ? "Edit Advertisement"
                : "Add Advertisement"}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Manage advertisement details and schedule
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
        >
          <div className="flex-1   space-y-6  p-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Advertisement Image
              </label>

              <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 cursor-pointer hover:border-blue-400 transition">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-56 object-cover rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <UploadCloud size={36} />

                    <p className="mt-2 text-sm font-medium">
                      Click to upload image
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImage}
                />
              </label>
            </div>

            {/* Headline + Tag */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Headline
                </label>

                <input
                  type="text"
                  required
                  value={formData.headline}
                  onChange={(e) => handleChange("headline", e.target.value)}
                  placeholder="Enter headline"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tag
                </label>

                <input
                  type="text"
                  required
                  value={formData.tag}
                  onChange={(e) => handleChange("tag", e.target.value)}
                  placeholder="Sponsored"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Sub */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>

              <textarea
                rows={3}
                value={formData.sub}
                onChange={(e) => handleChange("sub", e.target.value)}
                placeholder="Advertisement description..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* CTA + URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CTA Button Text
                </label>

                <input
                  type="text"
                  value={formData.cta}
                  onChange={(e) => handleChange("cta", e.target.value)}
                  placeholder="Shop Now"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Redirect URL
                </label>

                <input
                  type="url"
                  value={formData.redirect_link}
                  onChange={(e) =>
                    handleChange("redirect_link", e.target.value)
                  }
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Date + Size */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>

                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>

                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Advertisement Size
                </label>

                <select
                  value={formData.size}
                  onChange={(e) => handleChange("size", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="small">Small</option>
                  <option value="big">Big</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange("is_active", e.target.checked)}
                className="w-5 h-5 accent-blue-600"
              />

              <label className="text-sm font-medium text-gray-700">
                Active Advertisement
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 z-20 flex justify-end gap-3 border-t border-gray-200 bg-slate-100 backdrop-blur-md px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-500/20"
            >
              {loading
                ? "Saving..."
                : editAdvertisementData
                  ? "Update Advertisement"
                  : "Create Advertisement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdvertisementModal;
