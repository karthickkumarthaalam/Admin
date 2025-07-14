import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AddRadioStationModal = ({
  isOpen,
  onClose,
  editStationData,
  onSuccess,
}) => {
  const [form, setForm] = useState(initialFormState());
  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);

  function initialFormState() {
    return {
      station_name: "",
      radio_stream_url: "",
      country: "",
      play_type: "",
      redirect_url: "",
      logo: null,
    };
  }

  useEffect(() => {
    if (isOpen) {
      editStationData ? populateForm(editStationData) : resetForm();
    }
  }, [isOpen, editStationData]);

  const resetForm = () => {
    setForm(initialFormState());
    setErrors({});
    setLogoPreview(null);
  };

  const populateForm = (data) => {
    setForm({
      station_name: data.station_name || "",
      radio_stream_url: data.radio_stream_url || "",
      country: data.country || "",
      play_type: data.play_type || "",
      redirect_url: data.redirect_url || "",
      logo: null,
    });
    setLogoPreview(
      data.logo ? `${BASE_URL}/${data.logo.replace(/\\/g, "/")}` : null
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, logo: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.station_name)
      newErrors.station_name = "Station name is required.";
    if (!form.radio_stream_url)
      newErrors.radio_stream_url = "Stream URL is required.";
    if (!form.country) newErrors.country = "Country is required.";
    if (!form.logo && !editStationData) newErrors.logo = "Logo is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const payload = new FormData();
      for (const key in form) {
        if (key === "logo" && form.logo) {
          payload.append("logo", form.logo);
        } else {
          payload.append(key, form[key]);
        }
      }

      if (editStationData) {
        await apiCall(`/radio-station/${editStationData.id}`, "PUT", payload);
        toast.success("Radio station updated successfully!");
      } else {
        await apiCall("/radio-station/create", "POST", payload);
        toast.success("Radio station created successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save radio station.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 relative overflow-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {editStationData ? "Edit Radio Station" : "Add Radio Station"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {renderTextInput(
            "Station Name",
            "station_name",
            form.station_name,
            handleChange,
            errors.station_name
          )}
          {renderTextInput(
            "Stream URL",
            "radio_stream_url",
            form.radio_stream_url,
            handleChange,
            errors.radio_stream_url
          )}
          {renderSelectInput(
            "Country",
            "country",
            form.country,
            handleChange,
            ["Switzerland"],
            errors.country
          )}
          {renderSelectInput(
            "Play Type",
            "play_type",
            form.play_type,
            handleChange,
            ["Play within site", "Play with another tab"],
            errors.play_type
          )}
          {renderTextInput(
            "Redirect URL",
            "redirect_url",
            form.redirect_url,
            handleChange
          )}
        </div>

        {renderFileInput(
          "Logo",
          "logo",
          handleFileChange,
          logoPreview,
          errors.logo
        )}

        <div className="flex justify-end gap-3 mt-6">
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
            {editStationData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  function renderTextInput(label, name, value, onChange, error) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  function renderSelectInput(label, name, value, onChange, options, error) {
    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  function renderFileInput(label, name, onChange, preview, error) {
    return (
      <div className="mt-4 flex flex-col">
        <label className="font-semibold mb-1 text-sm">{label}</label>
        <input type="file" accept="image/*" onChange={onChange} />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-2 w-full max-h-60 object-contain rounded"
          />
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
};

export default AddRadioStationModal;
