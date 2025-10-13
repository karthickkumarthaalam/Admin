import React, { useState, useEffect } from "react";
import { BadgePlus, Edit, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import BreadCrumb from "../../../BreadCrum";
import { apiCall } from "../../../../utils/apiCall";
import { usePermission } from "../../../../context/PermissionContext";
import AddBudgetUnitsModal from "./AddBudgetUnitsModal";
import { useAuth } from "../../../../context/AuthContext";

const BudgetUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { hasPermission } = usePermission();

  const { user } = useAuth();

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await apiCall("/budget-units");
      setUnits(response?.data || []);
    } catch (error) {
      toast.error("Failed to fetch units");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Unit?")) return;
    setLoading(true);
    try {
      await apiCall(`/budget-units/${id}`, "DELETE");
      toast.success("Unit deleted successfully");
      fetchUnits();
    } catch (error) {
      toast.error("Failed to delete unit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb title="Budget Units" paths={["Units"]} />

      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-semibold text-lg">Units List</h2>
          {hasPermission("Budget", "create") && (
            <button
              onClick={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
              className="rounded bg-red-500 text-white px-3 py-2 flex gap-2 items-center hover:bg-red-600 text-sm"
            >
              <BadgePlus size={16} />
              <span>Add Unit</span>
            </button>
          )}
        </div>
        <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full  text-sm">
            <thead className="bg-gradient-to-r from-gray-500 to-gray-600 text-white text-left">
              <tr>
                <th className="border-b px-3 py-3 text-left">SI</th>
                <th className="border-b px-3 py-3 text-left">Unit Name</th>
                {user.role === "admin" && (
                  <th className="border-b px-3 py-3 text-left">Created By</th>
                )}
                <th className="border-b px-3 py-3 text-left">Actions</th>
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
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-6">
                    No Units Found.
                  </td>
                </tr>
              ) : (
                units.map((unit, index) => (
                  <tr
                    key={unit.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:shadow-md`}
                  >
                    <td className="border-b px-3 py-3">{index + 1}</td>
                    <td className="border-b px-3 py-3">{unit.units_name}</td>
                    {user.role === "admin" && (
                      <td className="border-b px-3 py-3">
                        {unit?.creator?.name || "Admin"}
                      </td>
                    )}
                    <td className="border-b px-3 py-3">
                      <div className="flex gap-2">
                        {hasPermission("Budget", "update") && (
                          <button
                            className="text-blue-600"
                            onClick={() => {
                              setEditData(unit);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {hasPermission("Budget", "delete") && (
                          <button
                            className="text-red-600"
                            onClick={() => handleDelete(unit.id)}
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

      <AddBudgetUnitsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUnits}
        editData={editData}
      />
    </div>
  );
};

export default BudgetUnits;
