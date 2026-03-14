import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import { X } from "lucide-react";

const AddCrewMembers = ({
  isOpen,
  onClose,
  editCrewMember,
  onSuccess,
  crewManagement,
}) => {
  const isEdit = !!editCrewMember;

  const initialState = {
    given_name: "",
    sur_name: "",
    contact_number: "",
    email_id: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
    designation: "",
    passport_number: "",
    date_of_issue: "",
    date_of_expiry: "",
    food_preference: "",
    flight_class: "",
    room_preference: "",
    boarding_from: "",
    returning_to: "",
    remarks: "",
  };

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [roomCategory, setRoomCategory] = useState([]);
  const [flightCategory, setFlightCategory] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (editCrewMember) {
        setForm({ ...initialState, ...editCrewMember });
      } else {
        setForm(initialState);
      }
      fetchCategories();
    }
  }, [isOpen, editCrewMember]);

  const fetchCategories = async () => {
    try {
      const res = await apiCall(`/crew-merchant/all-categories`, "GET");

      const categories = res.data || [];

      const flight = categories.find((item) => item.type === "flight");
      const room = categories.find((item) => item.type === "room");

      setFlightCategory(flight ? flight.categories : []);
      setRoomCategory(room ? room.categories : []);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      ...form,
      crew_management_id: crewManagement?.id,
    };

    try {
      setLoading(true);

      if (isEdit) {
        await apiCall(`/crew-member/${editCrewMember.id}`, "PUT", payload);
        toast.success("Crew member updated successfully");
      } else {
        await apiCall(`/crew-member`, "POST", payload);
        toast.success("Crew member added successfully");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to save crew member");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-6">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-full bg-white rounded-2xl shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b bg-gray-800  flex justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-100">
              {isEdit ? "Edit Crew Member" : "Add Crew Member"}
            </h2>
            <p className="text-sm text-gray-300">Manage crew member details</p>
          </div>
          <button onClick={onClose}>
            <X size={24} className="text-gray-200" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8 scrollbar-thin">
          {/* 👤 BASIC INFO */}
          <Section title="Basic Information">
            <FormInput
              label="Given Name *"
              name="given_name"
              value={form.given_name}
              onChange={handleChange}
              error={errors.given_name}
            />
            <FormInput
              label="Surname *"
              name="sur_name"
              value={form.sur_name}
              onChange={handleChange}
              error={errors.sur_name}
            />
            <FormInput
              label="Designation"
              name="designation"
              value={form.designation}
              onChange={handleChange}
            />
            <FormSelect
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </FormSelect>
            <FormInput
              type="date"
              label="Date of Birth"
              name="date_of_birth"
              value={form.date_of_birth}
              onChange={handleChange}
            />
            <FormInput
              label="Nationality"
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
            />
            <FormInput
              label="Contact Number"
              name="contact_number"
              value={form.contact_number}
              onChange={handleChange}
            />
            <FormInput
              label="Email"
              name="email_id"
              value={form.email_id}
              onChange={handleChange}
            />
          </Section>

          {/* ✈️ TRAVEL */}
          <Section title="Travel & Stay">
            <FormInput
              label="Boarding From"
              name="boarding_from"
              value={form.boarding_from}
              onChange={handleChange}
            />

            <FormInput
              label="Return Departure"
              name="returning_to"
              value={form.returning_to}
              onChange={handleChange}
            />
            <FormSelect
              label="Food Preference"
              name="food_preference"
              value={form.food_preference}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="veg">Veg</option>
              <option value="non_veg">Non Veg</option>
              <option value="vegan">Vegan</option>
              <option value="jain">Jain</option>
              <option value="halal">Halal</option>
              <option value="eggitarian">Eggitarian</option>
            </FormSelect>

            <FormSelect
              label="Flight Class *"
              name="flight_class"
              value={form.flight_class}
              onChange={handleChange}
              error={errors.flight_class}
            >
              <option value="">Select</option>

              {flightCategory.map((item, index) => (
                <option key={index} value={item}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </option>
              ))}
            </FormSelect>

            <FormSelect
              label="Room Sharing"
              name="room_preference"
              value={form.room_preference}
              onChange={handleChange}
            >
              <option value="">Select</option>

              {roomCategory.map((item, index) => (
                <option key={index} value={item}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </option>
              ))}
            </FormSelect>
          </Section>

          {/* 🛂 PASSPORT */}
          <Section title="Passport Details">
            <FormInput
              label="Passport Number *"
              name="passport_number"
              value={form.passport_number}
              onChange={handleChange}
              error={errors.passport_number}
            />
            <FormInput
              type="date"
              label="Passport Issue"
              name="date_of_issue"
              value={form.date_of_issue}
              onChange={handleChange}
            />
            <FormInput
              type="date"
              label="Passport Expiry"
              name="date_of_expiry"
              value={form.date_of_expiry}
              onChange={handleChange}
            />
          </Section>

          {/* 📝 REMARKS */}
          <Section title="Remarks">
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-none focus:outline-none"
              rows={3}
            />
          </Section>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t bg-slate-50 flex justify-end gap-4 rounded-2xl">
          <button onClick={onClose} className="px-6 py-2 border rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
          >
            {loading ? "Saving..." : isEdit ? "Update Crew" : "Add Crew"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* SECTION WRAPPER */
const Section = ({ title, children }) => (
  <div
    className="relative overflow-hidden rounded-2xl border border-gray-200 
  bg-white shadow-sm hover:shadow-xl transition-all duration-300"
  >
    {/* Header */}
    <div className="px-5 md:px-6 pt-5 pb-3 flex items-center gap-4">
      {/* Fancy dot */}

      {/* Title */}
      <h3 className="text-base md:text-lg font-semibold text-blue-800 tracking-wide">
        {title}
      </h3>

      {/* Stylish divider */}
      <div className="flex-1 h-[2px] bg-gradient-to-r from-blue-200 via-gray-200 to-transparent rounded-full"></div>
    </div>

    {/* Content */}
    <div className="px-5 md:px-6 pb-6 pt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {children}
      </div>
    </div>
  </div>
);
/* reusable */
const blockCopyEvents = {
  onCopy: (e) => e.preventDefault(),
  onPaste: (e) => e.preventDefault(),
  onCut: (e) => e.preventDefault(),
  onContextMenu: (e) => e.preventDefault(),
  onDragStart: (e) => e.preventDefault(),
};

const FormInput = ({ label, error, type = "text", ...props }) => (
  <div>
    <label className="block text-sm mb-2 font-medium">{label}</label>

    <input
      type={type}
      {...props}
      {...blockCopyEvents}
      autoComplete="off"
      className={`w-full border rounded-xl px-4 py-2 bg-white
      focus:ring-2 focus:ring-blue-500 focus:outline-none
      ${error ? "border-red-400" : "border-gray-300"}`}
    />

    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const FormSelect = ({ label, error, children, ...props }) => (
  <div>
    <label className="block text-sm mb-2 font-medium">{label}</label>

    <select
      {...props}
      onCopy={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      className={`w-full border rounded-xl px-4 py-2 bg-white
      focus:ring-2 focus:ring-blue-500 focus:outline-none
      ${error ? "border-red-400" : "border-gray-300"}`}
    >
      {children}
    </select>

    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export default AddCrewMembers;
