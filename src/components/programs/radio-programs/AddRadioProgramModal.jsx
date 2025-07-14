import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const AddRadioProgramModal = ({
  isOpen,
  onClose,
  onSuccess,
  editProgramData,
}) => {
  const [form, setForm] = useState(initialFormState());
  const [errors, setErrors] = useState({});
  const [programCategories, setProgramCategories] = useState([]);
  const [radioStations, setRadioStations] = useState([]);
  const [rjUsers, setRjUsers] = useState([]);

  function initialFormState() {
    return {
      program_category_id: "",
      rj_id: "",
      country: "",
      radio_station_id: "",
      broadcast_days: "",
      status: "active",
      show_host_name: true,
      show_program_name: true,
      show_timing: true,
      show_host_profile: true,
    };
  }

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
      editProgramData ? populateForm(editProgramData) : resetForm();
    }
  }, [isOpen, editProgramData]);

  const fetchDropdownData = async () => {
    try {
      const [categories, stations, users] = await Promise.all([
        apiCall("/program-category?limit=100&status=active", "GET"),
        apiCall("/radio-station?limit=100&status=active", "GET"),
        apiCall("/system-user?limit=100&status=active", "GET"),
      ]);
      setProgramCategories(categories.data);
      setRadioStations(stations.data);
      setRjUsers(users.data);
    } catch (err) {
      toast.error("Failed to fetch dropdown data.");
    }
  };

  const resetForm = () => {
    setForm(initialFormState());
    setErrors({});
  };

  const populateForm = (data) => {
    setForm({
      program_category_id: data.program_category_id || "",
      rj_id: data.rj_id || "",
      country: data.country || "",
      radio_station_id: data.radio_station_id || "",
      broadcast_days: data.broadcast_days || "",
      status: data.status || "active",
      show_host_name: data.show_host_name ?? true,
      show_program_name: data.show_program_name ?? true,
      show_timing: data.show_timing ?? true,
      show_host_profile: data.show_host_profile ?? true,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      if (editProgramData) {
        await apiCall(`/radio-program/${editProgramData.id}`, "PATCH", form);
        toast.success("Radio program updated successfully!");
      } else {
        await apiCall("/radio-program", "POST", form);
        toast.success("Radio program created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save radio program.");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.program_category_id)
      newErrors.program_category_id = "Program category is required.";
    if (!form.rj_id) newErrors.rj_id = "RJ is required.";
    if (!form.radio_station_id)
      newErrors.radio_station_id = "Radio station is required.";
    if (!form.broadcast_days)
      newErrors.broadcast_days = "Select at least one broadcast day.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDayToggle = (day) => {
    const selectedDays = form.broadcast_days
      ? form.broadcast_days.split(",")
      : [];
    let updatedDays = [...selectedDays];
    if (updatedDays.includes(day)) {
      updatedDays = updatedDays.filter((d) => d !== day);
    } else {
      updatedDays.push(day);
    }
    setForm((prev) => ({ ...prev, broadcast_days: updatedDays.join(",") }));
    setErrors((prev) => ({ ...prev, broadcast_days: "" }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 relative overflow-auto max-h-[95vh]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold text-red-600 mb-6">
          {editProgramData ? "Edit Radio Program" : "Add Radio Program"}
        </h2>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {renderSelectInput(
            "Program Category",
            "program_category_id",
            form.program_category_id,
            handleChange,
            programCategories.map((c) => ({
              label: c.category,
              value: c.id,
            })),
            errors.program_category_id
          )}

          {renderSelectInput(
            "RJ / Host",
            "rj_id",
            form.rj_id,
            handleChange,
            rjUsers.map((rj) => ({ label: rj.name, value: rj.id })),
            errors.rj_id
          )}

          {renderSelectInput(
            "Radio Station",
            "radio_station_id",
            form.radio_station_id,
            handleChange,
            radioStations.map((s) => ({ label: s.station_name, value: s.id })),
            errors.radio_station_id
          )}

          {renderSelectInput("Country", "country", form.country, handleChange, [
            {
              label: "Switzerland",
              value: "switzerland",
            },
          ])}
        </div>

        {/* Broadcast Days */}
        <div className="mt-6">{renderBroadcastDays()}</div>

        {/* Settings Checkboxes */}
        {editProgramData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t pt-4">
            <h3 className="col-span-full font-medium text-base text-gray-700 mb-2">
              Program Display Settings
            </h3>
            {renderBooleanCheckbox(
              "Show Host Name",
              "show_host_name",
              form.show_host_name
            )}
            {renderBooleanCheckbox(
              "Show Program Name",
              "show_program_name",
              form.show_program_name
            )}
            {renderBooleanCheckbox(
              "Show Timing",
              "show_timing",
              form.show_timing
            )}
            {renderBooleanCheckbox(
              "Show Host Profile",
              "show_host_profile",
              form.show_host_profile
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
          >
            {editProgramData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  // Helper Render Functions

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
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  function renderBroadcastDays() {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const selectedDays = form.broadcast_days
      ? form.broadcast_days.split(",")
      : [];

    return (
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-sm">Broadcast Days</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {days.map((day) => (
            <label key={day} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                value={day}
                checked={selectedDays.includes(day)}
                onChange={() => handleDayToggle(day)}
              />
              {day}
            </label>
          ))}
        </div>
        {errors.broadcast_days && (
          <p className="text-xs text-red-500 mt-1">{errors.broadcast_days}</p>
        )}
      </div>
    );
  }

  function renderBooleanCheckbox(label, name, value) {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value}
          onChange={() => setForm((prev) => ({ ...prev, [name]: !prev[name] }))}
        />
        {label}
      </label>
    );
  }
};

export default AddRadioProgramModal;
