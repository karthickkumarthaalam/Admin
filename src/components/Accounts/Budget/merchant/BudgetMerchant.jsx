import React, { useState, useEffect } from "react";
import { BadgePlus, Edit, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import BreadCrumb from "../../../BreadCrum";
import { apiCall } from "../../../../utils/apiCall";
import { usePermission } from "../../../../context/PermissionContext";
import AddBudgetMerchantModal from "./AddBudgetMerchantModal";
import { useAuth } from "../../../../context/AuthContext";

const BudgetMerchant = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { hasPermission } = usePermission();

  const { user } = useAuth();

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const response = await apiCall("/budget-merchant", "GET");
      setMerchants(response?.data || []);
    } catch (error) {
      toast.error("Failed to fetch merchants");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Merchant?"))
      return;
    setLoading(true);
    try {
      await apiCall(`/budget-merchant/${id}`, "DELETE");
      toast.success("Merchant deleted successfully");
      fetchMerchants();
    } catch (error) {
      toast.error("Failed to delete merchant");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb title="Budget Merchants" paths={["Merchants"]} />

      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-semibold text-lg">Merchant List</h2>
          {hasPermission("Budget", "create") && (
            <button
              onClick={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
              className="rounded bg-red-500 text-white px-3 py-2 flex gap-2 items-center hover:bg-red-600 text-sm"
            >
              <BadgePlus size={16} />
              <span>Add Merchant</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">SI</th>
                <th className="border px-3 py-2 text-left">Merchant Name</th>
                {user.role === "admin" && (
                  <th className="border px-3 py-2 text-left">Created By</th>
                )}
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-6">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-red-500"
                    />
                  </td>
                </tr>
              ) : merchants.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-6">
                    No Merchants Found.
                  </td>
                </tr>
              ) : (
                merchants.map((merchant, index) => (
                  <tr key={merchant.id}>
                    <td className="border px-3 py-2">{index + 1}</td>
                    <td className="border px-3 py-2">
                      {merchant.merchant_name}
                    </td>
                    {user.role === "admin" && (
                      <td className="border px-3 py-2">
                        {merchant.creator?.name || "Admin"}
                      </td>
                    )}
                    <td className="border px-3 py-2">
                      <div className="flex gap-2">
                        {hasPermission("Budget", "update") && (
                          <button
                            className="text-blue-600"
                            onClick={() => {
                              setEditData(merchant);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {hasPermission("Budget", "delete") && (
                          <button
                            className="text-red-600"
                            onClick={() => handleDelete(merchant.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddBudgetMerchantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMerchants}
        editData={editData}
      />
    </div>
  );
};

export default BudgetMerchant;
