import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiCall } from "../../utils/apiCall";
import { toast } from "react-toastify";

const LANGUAGES = ["English", "Tamil", "French", "German"];
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AddPopupBannerModal = ({
  isOpen,
  onClose,
  existingBanner,
  onSuccess,
}) => {
  const [form, setForm] = useState(initialFormState());
  const [errors, setErrors] = useState({});
  const [websitePreview, setWebsitePreview] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(null);

  function initialFormState() {
    return {
      website_image: null,
      mobile_image: null,
      status: "active",
      language: [],
    };
  }

  useEffect(() => {
    if (isOpen) {
      existingBanner ? populateForm(existingBanner) : resetForm();
    }
  }, [isOpen, existingBanner]);

  const resetForm = () => {
    setForm(initialFormState());
    setErrors({});
    setWebsitePreview(null);
    setMobilePreview(null);
  };

  const populateForm = (data) => {
    setForm({
      website_image: null,
      mobile_image: null,
      status: data.status,
      language: data.language || [],
    });

    setWebsitePreview(
      data.website_image
        ? `${BASE_URL}/${data.website_image.replace(/\\/g, "/")}`
        : null
    );
    setMobilePreview(
      data.mobile_image
        ? `${BASE_URL}/${data.mobile_image.replace(/\\/g, "/")}`
        : null
    );
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startswith("image/")) {
      setErrors((prev) => ({
        ...prev,
        [type]: "Please upload a valid image file",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [type]: "Image Size must be less than 15MB",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [type]: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "website_image") setWebsitePreview(reader.result);
      if (type === "mobile_image") setMobilePreview(reader.result);
    };

    reader.onerror = () => {
      console.error("File reading failed");
    };

    reader.readAsDataURL(file);

    setErrors((prev) => ({ ...prev, [type]: "" }));
  };

  const handleStatusChange = (e) => {
    setForm((prev) => ({ ...prev, status: e.target.value }));
    setErrors((prev) => ({ ...prev, status: "" }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      language: checked
        ? [...prev.language, value]
        : prev.language.filter((lang) => lang !== value),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!existingBanner && !form.website_image)
      newErrors.website_image = "Website image is required.";
    if (!form.status) newErrors.status = "Status is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = new FormData();
      payload.append("status", form.status);
      payload.append("language", JSON.stringify(form.language));
      if (form.website_image)
        payload.append("website_image", form.website_image);
      if (form.mobile_image) payload.append("mobile_image", form.mobile_image);

      if (existingBanner) {
        await apiCall("/popup-banner/create", "POST", payload);
        toast.success("Popup banner updated successfully!");
      } else {
        await apiCall("/popup-banner/create", "POST", payload);
        toast.success("Popup banner created successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save popup banner");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 relative overflow-auto max-h-[90vh] sm:max-h-[80vh]">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {existingBanner ? "Edit Popup Banner" : "Add Popup Banner"}
        </h2>

        <div className="space-y-4">
          {renderFileInput(
            "Website Image",
            "website_image",
            handleFileChange,
            websitePreview,
            errors.website_image
          )}
          {renderFileInput(
            "Mobile Image",
            "mobile_image",
            handleFileChange,
            mobilePreview,
            errors.mobile_image
          )}
          {renderSelectInput(
            "Status",
            "status",
            form.status,
            handleStatusChange,
            errors.status
          )}
          {renderLanguageCheckboxes()}
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
            className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
          >
            {existingBanner ? "Update" : "Save"}
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
          accept="image/*"
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

  function renderSelectInput(label, name, value, onChange, error) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          <option value="">Select {label}</option>
          <option value="active">Active</option>
          <option value="in-active">In-Active</option>
        </select>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  function renderLanguageCheckboxes() {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">Languages</label>
        <div className="flex gap-4 flex-wrap">
          {LANGUAGES.map((lang) => (
            <label key={lang} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                value={lang}
                checked={form.language.includes(lang)}
                onChange={handleCheckboxChange}
              />
              {lang}
            </label>
          ))}
        </div>
      </div>
    );
  }
};

export default AddPopupBannerModal;
