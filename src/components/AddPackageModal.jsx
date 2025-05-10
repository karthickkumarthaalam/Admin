import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { toast } from "react-toastify";

const AddPackageModal = ({ isOpen, onClose, editPackageData, onSuccess }) => {
  const [form, setForm] = useState({
    package_name: "",
    currency_id: "",
    price: "",
    yearly_price: "",
    duration: "",
    description: "",
    language: [],
    features: [],
    featureInput: "",
  });
  const [currencies, setCurrencies] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchCurrencies();
      if (editPackageData) populateForm(editPackageData);
    }
  }, [isOpen, editPackageData]);

  const fetchCurrencies = async () => {
    try {
      const res = await apiCall("/currency", "GET");
      setCurrencies(res.data);
    } catch (err) {
      toast.error("Failed to fetch currencies");
    }
  };

  const resetForm = () => {
    setForm({
      package_name: "",
      currency_id: "",
      price: "",
      yearly_price: "",
      duration: "",
      description: "",
      language: [],
      features: [],
      featureInput: "",
    });
    setErrors({});
  };

  const populateForm = (data) => {
    setForm({
      package_name: data.package_name || "",
      currency_id: data.currency_id || "",
      price: data.price || "",
      yearly_price: data.yearly_price || "",
      duration: data.duration || "",
      description: data.description || "",
      language: data.language || [],
      features: data.features || [],
      featureInput: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const updatedLanguages = checked
      ? [...form.language, value]
      : form.language.filter((lang) => lang !== value);
    setForm({ ...form, language: updatedLanguages });
  };

  const handleAddFeature = () => {
    if (form.featureInput.trim()) {
      setForm((prev) => ({
        ...prev,
        features: [...prev.features, form.featureInput.trim()],
        featureInput: "",
      }));
    }
  };

  const handleRemoveFeature = (index) => {
    const updatedFeatures = [...form.features];
    updatedFeatures.splice(index, 1);
    setForm({ ...form, features: updatedFeatures });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.package_name)
      newErrors.package_name = "Package name is required.";
    if (!form.currency_id) newErrors.currency_id = "Currency is required.";
    if (!form.price) newErrors.price = "Price is required.";
    if (!form.duration) newErrors.duration = "Duration is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        package_name: form.package_name,
        currency_id: form.currency_id,
        price: form.price,
        yearly_price: form.yearly_price,
        duration: form.duration,
        description: form.description,
        language: form.language,
        features: form.features,
      };

      if (editPackageData) {
        await apiCall(`/package/${editPackageData.id}`, "PUT", payload);
        toast.success("Package updated successfully!");
      } else {
        await apiCall("/package", "POST", payload);
        toast.success("Package created successfully!");
      }

      onSuccess();
    } catch (error) {
      toast.error("Failed to save package");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-4xl p-6 relative overflow-auto max-h-[90vh] sm:max-h-[80vh]">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-red-600">
          {editPackageData ? "Edit Package" : "Add Package"}
        </h2>

        <div className="space-y-4">
          {/* Package Name */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-sm">Package Name</label>
            <input
              type="text"
              name="package_name"
              placeholder="Package Name"
              value={form.package_name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            {errors.package_name && (
              <p className="text-sm text-red-500">{errors.package_name}</p>
            )}
          </div>

          {/* Currency & Price */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-medium mb-1 text-sm">Currency</label>
              <select
                name="currency_id"
                value={form.currency_id}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="">Select Currency</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.country_name} - {currency.currency_name}
                  </option>
                ))}
              </select>
              {errors.currency_id && (
                <p className="text-sm text-red-500">{errors.currency_id}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="font-medium mb-1 text-sm">Price</label>
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-medium mb-1 text-sm">Duration</label>
              <select
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="">Select Duration</option>
                <option value="free">Free</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1 text-sm">Yearly Price</label>
              <input
                type="number"
                name="yearly_price"
                placeholder="Yearly Price"
                value={form.yearly_price}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:rung-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-sm">Description</label>
            <textarea
              name="description"
              placeholder="Package Description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Languages */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-sm">Languages</label>
            <div className="flex gap-4 flex-wrap">
              {["English", "Tamil", "French", "German"].map((lang) => (
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

          {/* Features */}
          <div className="flex flex-col">
            <label className="font-medium mb-1 text-sm">Features</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="featureInput"
                placeholder="Add feature"
                value={form.featureInput}
                onChange={(e) =>
                  setForm({ ...form, featureInput: e.target.value })
                }
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <button
                onClick={handleAddFeature}
                type="button"
                className="px-3 py-2 text-sm rounded bg-gray-300 hover:bg-gray-400"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="bg-gray-200 text-xs px-2 py-1 rounded flex items-center gap-1"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="ml-1 text-gray-800 hover:text-gray-900 text-sm font-bold"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
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
            {editPackageData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPackageModal;
