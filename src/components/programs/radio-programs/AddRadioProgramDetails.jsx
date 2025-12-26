import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import {
  Radio,
  Upload,
  Image as ImageIcon,
  Calendar,
  User,
  MapPin,
  Layers,
  Text,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                Main Component                              */
/* -------------------------------------------------------------------------- */
const AddRadioProgramDetails = ({ onSuccess, editProgramData }) => {
  const initialState = useMemo(
    () => ({
      program_category_id: "",
      rj_id: "",
      radio_station_id: "",
      country: "",
      broadcast_days: "",
      status: "active",
      show_host_name: true,
      show_program_name: true,
      show_timing: true,
      show_host_profile: true,
    }),
    []
  );

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [programCategories, setProgramCategories] = useState([]);
  const [radioStations, setRadioStations] = useState([]);
  const [rjUsers, setRjUsers] = useState([]);
  const [bannerPreview, setBannerPreview] = useState("");
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ----------------------------- Populate Edit ----------------------------- */
  useEffect(() => {
    if (editProgramData) {
      setForm({
        program_category_id: editProgramData.program_category_id || "",
        rj_id: editProgramData.rj_id || "",
        radio_station_id: editProgramData.radio_station_id || "",
        country: editProgramData.country || "",
        broadcast_days: editProgramData.broadcast_days || "",
        status: editProgramData.status || "active",
        show_host_name: editProgramData.show_host_name ?? true,
        show_program_name: editProgramData.show_program_name ?? true,
        show_timing: editProgramData.show_timing ?? true,
        show_host_profile: editProgramData.show_host_profile ?? true,
      });

      setBannerPreview(editProgramData.program_category?.image_url || "");
    } else {
      setForm(initialState);
      setBannerPreview("");
    }
  }, [editProgramData, initialState]);

  /* ------------------------------ Fetch Data ------------------------------ */
  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [categories, stations, users] = await Promise.all([
        apiCall("/program-category?limit=100&status=active", "GET"),
        apiCall("/radio-station?limit=100&status=active", "GET"),
        apiCall("/system-user?limit=100&status=active", "GET"),
      ]);

      setProgramCategories(categories.data || []);
      setRadioStations(stations.data || []);
      setRjUsers(users.data || []);
    } catch {
      toast.error("Failed to load dropdown data");
    }
  };

  /* ----------------------------- Handlers ----------------------------- */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }, []);

  const handleBannerUpload = async (file) => {
    if (!form.program_category_id) {
      toast.error("Select program category first");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB allowed");
      return;
    }

    setIsUploadingBanner(true);
    try {
      const fd = new FormData();
      fd.append("image", file);

      await apiCall(
        `/program-category/${form.program_category_id}/image`,
        "PATCH",
        fd
      );

      toast.success("Banner updated");

      const fileReader = new FileReader();

      fileReader.onload = () => {
        setBannerPreview(fileReader.result);
      };

      fileReader.onerror = () => {
        console.error("File reading failed");
      };

      fileReader.readAsDataURL(file);
    } catch {
      toast.error("Banner upload failed");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const validateForm = () => {
    const e = {};
    if (!form.program_category_id) e.program_category_id = "Required";
    if (!form.rj_id) e.rj_id = "Required";
    if (!form.radio_station_id) e.radio_station_id = "Required";
    if (!form.broadcast_days) e.broadcast_days = "Select days";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editProgramData) {
        await apiCall(`/radio-program/${editProgramData.id}`, "PATCH", form);
        toast.success("Program updated");
      } else {
        await apiCall("/radio-program", "POST", form);
        toast.success("Program created");
      }

      setForm(initialState);
      setBannerPreview("");
      onSuccess?.();
    } catch {
      toast.error("Failed to save program");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------ UI ------------------------------ */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* BASIC INFO */}
      <SectionCard
        icon={<Text className="text-blue-600" />}
        title="Program Information"
        description="Basic radio program details"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SelectInput
            label="Program Category"
            name="program_category_id"
            value={form.program_category_id}
            onChange={handleChange}
            options={programCategories.map((c) => ({
              value: c.id,
              label: c.category,
            }))}
            error={errors.program_category_id}
            icon={<Layers size={16} />}
          />

          <SelectInput
            label="RJ / Host"
            name="rj_id"
            value={form.rj_id}
            onChange={handleChange}
            options={rjUsers.map((u) => ({
              value: u.id,
              label: u.name,
            }))}
            error={errors.rj_id}
            icon={<User size={16} />}
          />

          <SelectInput
            label="Radio Station"
            name="radio_station_id"
            value={form.radio_station_id}
            onChange={handleChange}
            options={radioStations.map((s) => ({
              value: s.id,
              label: s.station_name,
            }))}
            error={errors.radio_station_id}
            icon={<Radio size={16} />}
          />

          <SelectInput
            label="Country"
            name="country"
            value={form.country}
            onChange={handleChange}
            options={[{ value: "switzerland", label: "Switzerland" }]}
            icon={<MapPin size={16} />}
          />
        </div>
      </SectionCard>

      {/* BROADCAST DAYS */}
      <SectionCard
        icon={<Calendar className="text-green-600" />}
        title="Broadcast Schedule"
        description="Select broadcast days"
      >
        {renderBroadcastDays(form, setForm)}
        {errors.broadcast_days && (
          <p className="text-xs text-red-500 mt-3">{errors.broadcast_days}</p>
        )}
      </SectionCard>

      {/* BANNER */}
      <SectionCard
        icon={<ImageIcon className="text-orange-600" />}
        title="Program Banner"
        description="Upload or update banner image"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="border-2 border-dashed rounded-2xl p-8 cursor-pointer text-center hover:border-blue-400">
            <Upload className="mx-auto mb-3 text-gray-400" />
            <p className="text-sm font-semibold">Click to upload</p>
            <input
              type="file"
              hidden
              accept="image/*"
              disabled={isUploadingBanner}
              onChange={(e) =>
                e.target.files && handleBannerUpload(e.target.files[0])
              }
            />
          </label>

          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Banner"
              className="rounded-2xl border object-cover max-h-64"
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              No banner preview
            </div>
          )}
        </div>
      </SectionCard>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-2"
        >
          {loading
            ? "Saving..."
            : editProgramData
            ? "Update Program"
            : "Create Program"}
        </button>
      </div>
    </form>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Helper Components                             */
/* -------------------------------------------------------------------------- */
const SectionCard = ({ icon, title, description, children }) => (
  <div className="bg-white/80 rounded-2xl shadow-sm border p-5">
    <div className="flex items-start gap-4 mb-6">
      <div className="p-2 bg-gray-100 rounded-xl">{icon}</div>
      <div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

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
    <label className="font-semibold text-sm mb-2">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full border rounded-xl px-4 py-3 ${icon ? "pl-11" : ""}`}
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

/* -------------------------- Broadcast Days -------------------------- */
const renderBroadcastDays = (form, setForm) => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const selected = form.broadcast_days ? form.broadcast_days.split(",") : [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {days.map((d) => {
        const active = selected.includes(d);
        return (
          <button
            key={d}
            type="button"
            onClick={() =>
              setForm((p) => ({
                ...p,
                broadcast_days: active
                  ? selected.filter((x) => x !== d).join(",")
                  : [...selected, d].join(","),
              }))
            }
            className={`px-4 py-4 rounded-xl border ${
              active
                ? "bg-blue-50 border-blue-600 text-blue-700"
                : "bg-white border-gray-200"
            }`}
          >
            {d.slice(0, 3)}
          </button>
        );
      })}
    </div>
  );
};

export default AddRadioProgramDetails;
