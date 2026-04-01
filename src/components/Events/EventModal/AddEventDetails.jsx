import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import {
  Calendar,
  Clock,
  Globe,
  MapPin,
  Upload,
  Type,
  CheckCircle,
  Paperclip,
} from "lucide-react";
import "react-quill-new/dist/quill.snow.css";

const AddEventDetails = ({ onSuccess, editEventData }) => {
  const initialState = useMemo(
    () => ({
      title: "",
      description: "",
      venue: "",
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      country: "",
      state: "",
      city: "",
      status: "planning",
      ticketing_type: "internal",
      ticket_url: "",
      ticket_embed_code: "",
    }),
    [],
  );

  const [eventData, setEventData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [logoImage, setLogoImage] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  /* ----------------------------- Load Edit Data ---------------------------- */
  useEffect(() => {
    if (editEventData) {
      setEventData({
        title: editEventData.title || "",
        description: editEventData.description || "",
        venue: editEventData.venue || "",
        start_date: editEventData.start_date || "",
        end_date: editEventData.end_date || "",
        start_time: editEventData.start_time || "",
        end_time: editEventData.end_time || "",
        country: editEventData.country || "",
        state: editEventData.state || "",
        city: editEventData.city || "",
        status: editEventData.status || "planning",
        ticketing_type: editEventData.ticketing_type || "internal",
        ticket_url: editEventData.ticket_url || "",
        ticket_embed_code: editEventData.ticket_embed_code || "",
      });

      if (editEventData.logo_image) setLogoPreview(editEventData.logo_image);

      if (editEventData.country) {
        fetchStates(editEventData.country);
        if (editEventData.state) {
          fetchCities(editEventData.country, editEventData.state);
        }
      }
    } else {
      setEventData(initialState);
      setLogoPreview("");
      setLogoImage(null);
      setStates([]);
      setCities([]);
    }
  }, [editEventData, initialState]);

  /* ----------------------------- Fetch Locations ---------------------------- */
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = useCallback(async () => {
    try {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/");
      const data = await res.json();
      setCountries(data.data || []);
    } catch {
      toast.error("Failed to load countries");
    }
  }, []);

  const fetchStates = useCallback(async (country) => {
    try {
      const res = await fetch(
        "https://countriesnow.space/api/v0.1/countries/states",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country }),
        },
      );
      const data = await res.json();
      setStates(data.data?.states || []);
    } catch {
      toast.error("Failed to fetch states");
    }
  }, []);

  const fetchCities = useCallback(async (country, state) => {
    try {
      const res = await fetch(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country, state }),
        },
      );
      const data = await res.json();
      setCities(data.data || []);
    } catch {
      toast.error("Failed to fetch cities");
    }
  }, []);

  /* ----------------------------- Input Handlers ---------------------------- */
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setEventData((prev) => {
        const updated = { ...prev, [name]: value };
        if (name === "country") {
          fetchStates(value);
          return { ...updated, state: "", city: "" };
        }
        if (name === "state") fetchCities(updated.country, value);
        return updated;
      });
    },
    [fetchStates, fetchCities],
  );

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File must be less than 5MB");
        return;
      }
      setLogoImage(file);

      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result);
      };

      reader.onerror = () => {
        console.error("File reading failer");
      };

      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !eventData.title.trim() ||
      !eventData.venue.trim() ||
      !eventData.start_date
    ) {
      toast.error("Title, Venue and Start Date are required!");
      return;
    }

    if (eventData.ticketing_type === "external") {
      if (!eventData.ticket_url && !eventData.ticket_embed_code) {
        toast.error("Provide ticket URL or embed code for external ticketing");
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(eventData).forEach(([k, v]) =>
        formData.append(k, v || ""),
      );
      if (logoImage) formData.append("logo", logoImage);

      if (editEventData) {
        await apiCall(`/event/${editEventData.id}`, "PUT", formData, {
          "Content-Type": "multipart/form-data",
        });
        toast.success("Event updated successfully!");
      } else {
        await apiCall("/event", "POST", formData, {
          "Content-Type": "multipart/form-data",
        });
        toast.success("Event created successfully!");
      }

      setEventData(initialState);
      setLogoPreview("");
      setLogoImage(null);
      onSuccess?.();
    } catch {
      toast.error("Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    setEventData(initialState);
    setLogoPreview("");
    setLogoImage(null);
    setStates([]);
    setCities([]);
  }, [initialState]);

  /* ------------------------------ Form Layout ------------------------------ */
  return (
    <form onSubmit={handleSubmit} className=" space-y-8">
      {/* Basic Information Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Type size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Basic Information
              </h2>
              <p className="text-sm text-gray-500">
                Provide core details about your event
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-7">
          {/* Title + Venue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              label="Event Title"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              placeholder="e.g. Music Festival 2026"
              required
            />
            <TextInput
              label="Venue"
              name="venue"
              value={eventData.venue}
              onChange={handleChange}
              placeholder="e.g. Chennai Trade Centre"
              icon={<MapPin size={16} />}
              required
            />
          </div>

          {/* Description */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <TextAreaInput
              label="Description"
              name="description"
              value={eventData.description}
              onChange={handleChange}
              placeholder="Describe your event, agenda, highlights..."
            />
          </div>

          {/* Status + Logo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Status */}
            <div className="flex flex-col">
              <label className="font-semibold text-sm text-gray-700 mb-2">
                Event Status
              </label>
              <select
                name="status"
                value={eventData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:border-blue-400 transition-all"
              >
                {[
                  "planning",
                  "upcoming",
                  "ongoing",
                  "completed",
                  "postponed",
                  "cancelled",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>

              {/* Status Badge Preview */}
              <span className="mt-3 inline-block text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-600 w-fit capitalize">
                {eventData.status}
              </span>
            </div>

            {/* Logo Upload */}
            <div className="flex flex-col">
              <label className="font-semibold text-sm text-gray-700 mb-2">
                Event Logo
              </label>

              <div className="flex items-center gap-4">
                <div className="relative w-28 h-28 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 hover:border-blue-400 transition-all cursor-pointer overflow-hidden group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />

                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Upload
                      size={22}
                      className="text-gray-400 group-hover:text-blue-500 transition"
                    />
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  <p className="font-medium text-gray-700">Upload Logo</p>
                  <p>PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-2 mb-6 text-gray-800 font-bold text-lg">
          <Calendar size={20} className="text-green-600" />
          <span>Schedule</span>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DateInput
              label="Start Date"
              name="start_date"
              value={eventData.start_date}
              onChange={handleChange}
              required
            />
            <DateInput
              label="End Date"
              name="end_date"
              value={eventData.end_date}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              label="Start Time"
              name="start_time"
              value={eventData.start_time}
              onChange={handleChange}
              placeholder="10:00 AM"
              icon={<Clock size={16} />}
            />
            <TextInput
              label="End Time"
              name="end_time"
              value={eventData.end_time}
              onChange={handleChange}
              placeholder="5:00 PM"
              icon={<Clock size={16} />}
            />
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-2 mb-6 text-gray-800 font-bold text-lg">
          <Globe size={20} className="text-orange-600" />
          <span>Location</span>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectInput
              label="Country"
              name="country"
              value={eventData.country}
              onChange={handleChange}
              options={countries.map((c) => c.country)}
            />
            <SelectInput
              label="State / Province"
              name="state"
              value={eventData.state}
              onChange={handleChange}
              options={states.map((s) => s.name)}
              disabled={!eventData.country}
            />
            <SelectInput
              label="City"
              name="city"
              value={eventData.city}
              onChange={handleChange}
              options={cities}
              disabled={!eventData.state}
            />
          </div>
        </div>
      </div>

      {/* Ticketing Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle size={20} className="text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            Ticketing Configuration
          </h2>
        </div>

        <div className="space-y-6">
          {/* Ticket Type */}
          <div>
            <label className="font-semibold text-sm text-gray-700 mb-2 block">
              Ticketing Type
            </label>

            <div className="flex gap-4">
              {["internal", "external"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setEventData((prev) => ({
                      ...prev,
                      ticketing_type: type,
                      ticket_embed_code: "", // reset embed if switching
                    }))
                  }
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition
              ${
                eventData.ticketing_type === type
                  ? "bg-purple-100 border-purple-500 text-purple-700"
                  : "bg-white border-gray-300 hover:border-purple-400"
              }`}
                >
                  {type === "internal" ? "Internal" : "External"}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket URL (COMMON for both) */}
          <TextInput
            label="Ticket URL"
            name="ticket_url"
            value={eventData.ticket_url}
            onChange={handleChange}
            placeholder={
              eventData.ticketing_type === "internal"
                ? "/tickets/123"
                : "https://tickets.com/event"
            }
          />

          {/* Embed ONLY for External */}
          {eventData.ticketing_type === "external" && (
            <TextAreaInput
              label="Embed Code (Optional)"
              name="ticket_embed_code"
              value={eventData.ticket_embed_code}
              onChange={handleChange}
              placeholder="<iframe ...> or Zoho widget"
            />
          )}
        </div>
      </div>
      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {editEventData ? "Updating..." : "Saving..."}
            </>
          ) : editEventData ? (
            "Update Event"
          ) : (
            "Create Event"
          )}
        </button>
      </div>
    </form>
  );
};

/* -------------------------- Reusable Components -------------------------- */
const TextInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
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
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
          icon ? "pl-11" : "pl-4"
        }`}
      />
    </div>
  </div>
);

const TextAreaInput = ({ label, name, value, onChange, placeholder }) => (
  <div className="flex flex-col h-full">
    <label className="font-semibold text-sm text-gray-700 mb-2">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={5}
      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none h-full"
    />
  </div>
);

const SelectInput = ({ label, name, value, onChange, options, disabled }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-700 mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
        disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""
      }`}
    >
      <option value="">Select {label}</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const DateInput = ({ label, name, value, onChange }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-700 mb-2">{label}</label>
    <input
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    />
  </div>
);

const SmallFileInput = ({ label, onChange, preview }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-sm text-gray-700 mb-2">{label}</label>
    <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 hover:border-blue-400 transition-all cursor-pointer overflow-hidden">
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      {preview ? (
        <img
          src={preview}
          alt="Logo"
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <Upload size={22} className="text-gray-400" />
      )}
    </div>
  </div>
);

export default AddEventDetails;
