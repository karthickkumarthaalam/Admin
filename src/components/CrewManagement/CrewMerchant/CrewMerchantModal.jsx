import { useEffect, useState } from "react";
import { X, Loader2, Plane, Building2, Plus, Tag } from "lucide-react";
import { apiCall } from "../../../utils/apiCall";
import { toast } from "react-toastify";

const CrewMerchantModal = ({ isOpen, onClose, editData, onSuccess }) => {
  const [merchantName, setMerchantName] = useState("");
  const [merchantType, setMerchantType] = useState("flight");
  const [categories, setCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!editData;

  useEffect(() => {
    if (editData) {
      setMerchantName(editData.merchant_name || "");
      setMerchantType(editData.merchant_type || "flight");
      setCategories(editData.merchant_category || []);
    } else {
      setMerchantName("");
      setMerchantType("flight");
      setCategories([]);
    }
  }, [editData]);

  const addCategory = () => {
    if (!categoryInput.trim()) return;

    if (categories.includes(categoryInput.trim())) {
      toast.error("Category already added");
      return;
    }

    setCategories([...categories, categoryInput.trim()]);
    setCategoryInput("");
  };

  const removeCategory = (cat) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!merchantName.trim()) {
      toast.error("Merchant name required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        merchant_name: merchantName.trim(),
        merchant_type: merchantType,
        merchant_category: categories,
      };

      if (isEdit) {
        await apiCall(`/crew-merchant/${editData.id}`, "PUT", payload);
        toast.success("Merchant updated successfully");
      } else {
        await apiCall("/crew-merchant", "POST", payload);
        toast.success("Merchant created successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl z-10">
            <Loader2 className="animate-spin text-blue-600" size={30} />
          </div>
        )}

        {/* HEADER */}

        <div className="flex justify-between items-center px-6 py-5 border-b border-dashed border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {isEdit ? "Edit Merchant" : "Add Merchant"}
            </h2>
            <p className="text-xs text-gray-400">
              Manage vendors for flights & hotels
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* MERCHANT NAME */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Merchant Name
            </label>

            <input
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="Eg: Indigo Airlines"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* MERCHANT TYPE */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Merchant Type
            </label>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div
                onClick={() => setMerchantType("flight")}
                className={`cursor-pointer flex items-center justify-center gap-2 border rounded-lg py-3 text-sm font-medium transition
                ${
                  merchantType === "flight"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <Plane size={16} />
                Flight
              </div>

              <div
                onClick={() => setMerchantType("room")}
                className={`cursor-pointer flex items-center justify-center gap-2 border rounded-lg py-3 text-sm font-medium transition
                ${
                  merchantType === "room"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <Building2 size={16} />
                Room
              </div>
            </div>
          </div>

          {/* CATEGORY INPUT */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Categories
            </label>

            <div className="flex gap-2 mt-2">
              <input
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="Add category"
                className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={addCategory}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* CATEGORY TAGS */}

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs"
                  >
                    <Tag size={12} />
                    {cat}

                    <button
                      type="button"
                      onClick={() => removeCategory(cat)}
                      className="text-red-500 ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIONS */}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEdit ? "Update Merchant" : "Create Merchant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrewMerchantModal;
