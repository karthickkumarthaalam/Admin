import React, { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";

import {
  FolderOpen,
  Clock3,
  Image as ImageIcon,
  Upload,
  FileText,
  Globe,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export const AddCategoryDetails = ({
  onSuccess,
  onClose,
  editCategoryData,
}) => {
  const initialState = useMemo(
    () => ({
      category: "",
      start_time: "",
      end_time: "",
      country: "Switzerland",
      description: "",
      status: "in-active",
      image_url: null,
      mobile_image_url: null,
    }),
    [],
  );

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");

  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                                Populate Form                               */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (editCategoryData) {
      setForm({
        category: editCategoryData.category || "",
        start_time: editCategoryData.start_time || "",
        end_time: editCategoryData.end_time || "",
        country: editCategoryData.country || "Switzerland",
        description: editCategoryData.description || "",
        status: editCategoryData.status || "in-active",
        image_url: editCategoryData.image_url || null,
        mobile_image_url: editCategoryData.mobile_image_url || null,
      });

      setDesktopPreview(editCategoryData.image_url || "");
      setMobilePreview(editCategoryData.mobile_image_url || "");
    } else {
      setForm(initialState);
      setDesktopPreview("");
      setMobilePreview("");
    }
  }, [editCategoryData, initialState]);

  /* -------------------------------------------------------------------------- */
  /*                                   Inputs                                   */
  /* -------------------------------------------------------------------------- */

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                              Desktop Banner                                */
  /* -------------------------------------------------------------------------- */

  const handleDesktopImage = (file) => {
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      image_url: file,
    }));

    const reader = new FileReader();

    reader.onload = () => {
      setDesktopPreview(reader.result);
    };

    reader.readAsDataURL(file);

    setErrors((prev) => ({
      ...prev,
      image_url: "",
    }));
  };

  /* -------------------------------------------------------------------------- */
  /*                               Mobile Banner                                */
  /* -------------------------------------------------------------------------- */

  const handleMobileImage = (file) => {
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      mobile_image_url: file,
    }));

    const reader = new FileReader();

    reader.onload = () => {
      setMobilePreview(reader.result);
    };

    reader.readAsDataURL(file);

    setErrors((prev) => ({
      ...prev,
      mobile_image_url: "",
    }));
  };

  /* -------------------------------------------------------------------------- */
  /*                               Remove Images                                */
  /* -------------------------------------------------------------------------- */

  const removeDesktopImage = () => {
    setForm((prev) => ({
      ...prev,
      image_url: null,
    }));

    setDesktopPreview("");
  };

  const removeMobileImage = () => {
    setForm((prev) => ({
      ...prev,
      mobile_image_url: null,
    }));

    setMobilePreview("");
  };

  /* -------------------------------------------------------------------------- */
  /*                                 Validation                                 */
  /* -------------------------------------------------------------------------- */

  const validate = () => {
    const e = {};

    if (!form.category.trim()) {
      e.category = "Category is required";
    }

    if (!form.start_time) {
      e.start_time = "Start time is required";
    }

    if (!form.end_time) {
      e.end_time = "End time is required";
    }

    if (!form.country) {
      e.country = "Country is required";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Submit                                    */
  /* -------------------------------------------------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const fd = new FormData();

      fd.append("category", form.category);
      fd.append("start_time", form.start_time);
      fd.append("end_time", form.end_time);
      fd.append("country", form.country);
      fd.append("description", form.description);
      fd.append("status", form.status);

      if (form.image_url instanceof File) {
        fd.append("image", form.image_url);
      } else if (form.image_url === null && editCategoryData?.image_url) {
        fd.append("remove_image", "true");
      }

      if (form.mobile_image_url instanceof File) {
        fd.append("mobile_image", form.mobile_image_url);
      } else if (
        form.mobile_image_url === null &&
        editCategoryData?.mobile_image_url
      ) {
        fd.append("remove_mobile_image", "true");
      }

      if (editCategoryData) {
        await apiCall(`/program-category/${editCategoryData.id}`, "PUT", fd);

        toast.success("Category updated successfully.");
      } else {
        await apiCall("/program-category/create", "POST", fd);

        toast.success("Category created successfully.");
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error("Failed to save category.");
    } finally {
      setLoading(false);
    }

    /* -------------------------------------------------------------------------- */
    /*                                    UI                                      */
    /* -------------------------------------------------------------------------- */
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ---------------------------------------------------------------------- */}
      {/* Category Information                                                   */}
      {/* ---------------------------------------------------------------------- */}

      <SectionCard
        icon={<FolderOpen className="text-blue-600" />}
        title="Category Information"
        description="Basic information about the program category."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TextInput
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Enter category name"
            error={errors.category}
          />

          <SelectInput
            label="Country"
            name="country"
            value={form.country}
            onChange={handleChange}
            icon={<Globe size={16} />}
            options={[
              {
                value: "Switzerland",
                label: "Switzerland",
              },
            ]}
            error={errors.country}
          />

          <SelectInput
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            icon={<CheckCircle2 size={16} />}
            options={[
              {
                value: "active",
                label: "Active",
              },
              {
                value: "in-active",
                label: "Inactive",
              },
            ]}
          />

          <div className="lg:col-span-3">
            <TextAreaInput
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter category description..."
            />
          </div>
        </div>
      </SectionCard>

      {/* ---------------------------------------------------------------------- */}
      {/* Schedule                                                               */}
      {/* ---------------------------------------------------------------------- */}

      <SectionCard
        icon={<Clock3 className="text-green-600" />}
        title="Broadcast Schedule"
        description="Configure the timing of this category."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimeInput
            label="Start Time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            error={errors.start_time}
          />

          <TimeInput
            label="End Time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            error={errors.end_time}
          />
        </div>
      </SectionCard>

      {/* ---------------------------------------------------------------------- */}
      {/* Images                                                                 */}
      {/* ---------------------------------------------------------------------- */}

      <SectionCard
        icon={<ImageIcon className="text-orange-600" />}
        title="Category Images"
        description="Upload desktop and mobile banners."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UploadCard
            title="Desktop Banner"
            preview={desktopPreview}
            onUpload={handleDesktopImage}
            onRemove={removeDesktopImage}
          />

          <UploadCard
            title="Mobile Banner"
            preview={mobilePreview}
            onUpload={handleMobileImage}
            onRemove={removeMobileImage}
          />
        </div>
      </SectionCard>

      {/* ---------------------------------------------------------------------- */}
      {/* Footer                                                                 */}
      {/* ---------------------------------------------------------------------- */}

      <div className="flex justify-end gap-4 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition disabled:opacity-60"
        >
          {loading
            ? "Saving..."
            : editCategoryData
              ? "Update Category"
              : "Create Category"}
        </button>
      </div>
    </form>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Helper Components                             */
/* -------------------------------------------------------------------------- */

const SectionCard = ({ icon, title, description, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
    <div className="border-b border-gray-100 px-6 py-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>

          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>

    <div className="p-6">{children}</div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                Text Input                                  */
/* -------------------------------------------------------------------------- */

const TextInput = ({ label, name, value, onChange, placeholder, error }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-700 mb-2">{label}</label>

    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-xl border px-4 py-3 outline-none transition
      ${
        error
          ? "border-red-400"
          : "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      }`}
    />

    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                              TextArea Input                                */
/* -------------------------------------------------------------------------- */

const TextAreaInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
}) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-700 mb-2">{label}</label>

    <textarea
      rows={5}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-xl border px-4 py-3 resize-none outline-none transition
      ${
        error
          ? "border-red-400"
          : "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      }`}
    />

    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                Time Input                                  */
/* -------------------------------------------------------------------------- */

const TimeInput = ({ label, name, value, onChange, error }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-700 mb-2">{label}</label>

    <input
      type="time"
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full rounded-xl border px-4 py-3 outline-none transition
      ${
        error
          ? "border-red-400"
          : "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      }`}
    />

    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                               Select Input                                 */
/* -------------------------------------------------------------------------- */

const SelectInput = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  icon,
}) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-700 mb-2">{label}</label>

    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border py-3 pr-4 ${
          icon ? "pl-11" : "px-4"
        } outline-none transition
        ${
          error
            ? "border-red-400"
            : "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        }`}
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>

    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                Upload Card                                 */
/* -------------------------------------------------------------------------- */

const UploadCard = ({ title, preview, onUpload, onRemove }) => (
  <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition hover:border-blue-400 hover:bg-blue-50">
    <h4 className="font-semibold text-gray-800 mb-4">{title}</h4>

    {preview ? (
      <div className="relative">
        <img
          src={preview}
          alt={title}
          className="w-full h-64 rounded-xl object-cover border"
        />

        <button
          type="button"
          onClick={onRemove}
          className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ) : (
      <label className="cursor-pointer flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 transition bg-white">
        <Upload size={34} className="text-gray-400 mb-4" />

        <p className="font-semibold text-gray-700">Click to Upload</p>

        <p className="text-xs text-gray-500 mt-2">PNG, JPG or WEBP</p>

        <input
          hidden
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files?.length && onUpload(e.target.files[0])
          }
        />
      </label>
    )}
  </div>
);
