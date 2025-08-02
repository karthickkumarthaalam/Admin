import React, { useEffect, useState } from "react";
import { usePermission } from "../../../../context/PermissionContext";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "react-toastify";
import { apiCall } from "../../../../utils/apiCall";
import BreadCrumb from "../../../BreadCrum";
import { BadgePlus, Edit, Loader2, Trash2 } from "lucide-react";
import AddExpenseMerchant from "./AddExpenseMerchant";

const Merchant = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMerchantData, setEditMerchantData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { hasPermission } = usePermission();
  const { user } = useAuth();

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const res = await apiCall(`/merchant`, "GET");
      setMerchants(res?.data);
    } catch (error) {
      toast.error("Failed to fetch Merchants");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete merchant?")) return;
    try {
      await apiCall(`/merchant/${id}`, "DELETE");
      fetchMerchants();
      toast.success("Merchants deleted Successfully");
    } catch (error) {
      toast.error("Failed to delete merchant");
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb title="Expense Merchants" paths={["merchants"]} />
      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2 border-dashed">
          <h2 className="font-semibold text-lg"> Merchant List</h2>
          {hasPermission("Expenses", "create") && (
            <button
              onClick={() => {
                setShowModal(true);
                setEditMerchantData(null);
              }}
              className="rounded bg-red-500 hover:bg-red-600 text-white px-3 py-2 flex gap-2 items-center text-sm"
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
                <th className="border px-3 py-2 text-left">Merchant</th>
                {user.role === "admin" && (
                  <th className="border px-3 py-2 text-left">Created By</th>
                )}
                <th className="border px-3 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-6">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-red-500"
                    />
                  </td>
                </tr>
              ) : merchants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6">
                    {" "}
                    No Merchants Found.
                  </td>
                </tr>
              ) : (
                merchants.map((merchant, index) => (
                  <tr
                    key={merchant.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:shadow-md`}
                  >
                    <td className="border px-3 py-2 align-top"> {index + 1}</td>
                    <td className="border px-3 py-2 align-top">
                      {merchant.merchant_name}
                    </td>
                    {user.role === "admin" && (
                      <td className=" border px-3 py-2">
                        {merchant?.creator?.name || "Admin"}
                      </td>
                    )}
                    <td className="border px-3 py-2 align-top">
                      <div className="flex gap-2">
                        {hasPermission("Expenses", "update") && (
                          <button
                            className="text-blue-600"
                            onClick={() => {
                              setEditMerchantData(merchant);
                              setShowModal(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {hasPermission("Expenses", "delete") && (
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

      <AddExpenseMerchant
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          fetchMerchants();
          setShowModal(false);
        }}
        editMerchantData={editMerchantData}
      />
    </div>
  );
};

export default Merchant;
