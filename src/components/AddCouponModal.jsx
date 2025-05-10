import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiCall } from "../utils/apiCall";
import { toast } from "react-toastify";

const AddCouponModal = ({ isOpen, onClose, editCouponData, onSuccess }) => {
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState({
    coupon_name: "",
    coupon_code: "",
    start_date: "",
    end_date: "",
    redirect_url: "",
    description: "",
    selectedPackages: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
      resetForm();
      if (editCouponData) populateForm(editCouponData);
    }
  }, [isOpen, editCouponData]);

  const fetchPackages = async () => {
    try {
      const res = await apiCall("/package", "GET");
      setPackages(res.data);
    } catch (error) {
      toast.error("Failed to fetch packages");
    }
  };

  const resetForm = () => {
    setForm({
      coupon_name: "",
      coupon_code: "",
      start_date: "",
      end_date: "",
      redirect_url: "",
      description: "",
      selectedPackages: [],
    });
    setErrors({});
  };

  const populateForm = (data) => {
    setForm({
      coupon_name: data.coupon_name || "",
      coupon_code: data.coupon_code || "",
      start_date: data.start_date ? data.start_date.slice(0, 10) : "",
      end_date: data.end_date ? data.end_date.slice(0, 10) : "",
      redirect_url: data.redirect_url || "",
      description: data.description || "",
      selectedPackages: data.packages ? data.packages.map((p) => p.id) : [],
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value.trim() });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePackageToggle = (id) => {
    setForm((prev) => {
      const updated = prev.selectedPackages.includes(id)
        ? prev.selectedPackages.filter((pkgId) => pkgId !== id)
        : [...prev.selectedPackages, id];
      return { ...prev, selectedPackages: updated };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.coupon_name) newErrors.coupon_name = "Coupon name is required.";
    if (!form.coupon_code) newErrors.coupon_code = "Coupon code is required.";
    if (!form.start_date) newErrors.start_date = "Start date is required.";
    if (!form.end_date) newErrors.end_date = "End date is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        coupon_name: form.coupon_name,
        coupon_code: form.coupon_code,
        start_date: form.start_date,
        end_date: form.end_date,
        redirect_url: form.redirect_url,
        description: form.description,
        packages: form.selectedPackages,
      };

      if (editCouponData) {
        await apiCall(`/coupons/${editCouponData.id}`, "PUT", payload);
        toast.success("Coupon updated successfully!");
      } else {
        await apiCall("/coupons", "POST", payload);
        toast.success("Coupon created successfully!");
      }

      onSuccess();
    } catch (error) {
      toast.error("Failed to save Coupon");
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
          {editCouponData ? "Edit Coupon" : "Add Coupon"}
        </h2>

        <div className="space-y-4">
          {/* Coupon Name */}
          <div className="flex flex-col">
            <label htmlFor="coupon_name" className="font-medium mb-1 text-sm">
              Coupon Name
            </label>
            <input
              type="text"
              name="coupon_name"
              id="coupon_name"
              placeholder="Coupon Name"
              value={form.coupon_name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            {errors.coupon_name && (
              <p className="text-sm text-red-500">{errors.coupon_name}</p>
            )}
          </div>

          {/* Coupon Code */}
          <div className="flex flex-col">
            <label htmlFor="coupon_code" className="font-medium mb-1 text-sm">
              Coupon Code
            </label>
            <input
              type="text"
              name="coupon_code"
              id="coupon_code"
              placeholder="Coupon Code"
              value={form.coupon_code}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            {errors.coupon_code && (
              <p className="text-sm text-red-500">{errors.coupon_code}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="start_date" className="font-medium mb-1 text-sm">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                id="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label htmlFor="end_date" className="font-medium mb-1 text-sm">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                id="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Redirect URL */}
          <div className="flex flex-col">
            <label htmlFor="redirect_url" className="font-medium mb-1 text-sm">
              Redirect URL
            </label>
            <input
              type="text"
              name="redirect_url"
              id="redirect_url"
              placeholder="Redirect URL"
              value={form.redirect_url}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label htmlFor="description" className="font-medium mb-1 text-sm">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Packages */}
          <div className="flex flex-col">
            <p className="font-medium text-sm mb-1">Select Packages:</p>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border p-2 rounded">
              {packages.map((pkg) => (
                <label key={pkg.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.selectedPackages.includes(pkg.id)}
                    onChange={() => handlePackageToggle(pkg.id)}
                  />
                  {pkg.package_name}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-5">
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
            {editCouponData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCouponModal;
