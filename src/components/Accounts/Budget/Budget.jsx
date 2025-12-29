import { useEffect, useState } from "react";
import {
  BadgePlus,
  Edit,
  Loader2,
  Search,
  Trash2,
  CopyIcon,
  ArchiveRestore,
  Archive,
} from "lucide-react";
import BreadCrumb from "../../BreadCrum";
import { usePermission } from "../../../context/PermissionContext";
import { toast } from "react-toastify";
import { apiCall } from "../../../utils/apiCall";
import debounce from "lodash.debounce";
import AddBudget from "./AddBudget";
import AddBudgetItemsModal from "./AddBudgetItemsModal";
import ViewBudgetModal from "./ViewBudgetModal";
import { useAuth } from "../../../context/AuthContext";

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBuudgetData, setEditBudgetData] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { hasPermission } = usePermission();
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedBudgetData, setSelectedBudgetData] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDeleted, setViewDeleted] = useState(false);

  const { user } = useAuth();

  const pageSize = 50;

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/budget?page=${currentPage}&limit=${pageSize}&search=${searchQuery}&show_deleted=${viewDeleted}`
      );
      setBudgets(response?.data);
      setTotalRecords(response?.pagination?.totalRecords);
    } catch (error) {
      toast.error("Failed to fetch budgets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Budget?")) return;
    setLoading(true);
    try {
      await apiCall(`/budget/${id}`, "DELETE");
      fetchBudgets();
      setCurrentPage(1);
      toast.success("Budgets deleted Successfully");
    } catch (error) {
      toast.error("Failed to delete budgets");
    } finally {
      setLoading(false);
    }
  };

  const openBudgetItemModal = (budget, type) => {
    setSelectedBudgetData({ ...budget, budget_type: type });
    setIsItemModalOpen(true);
  };

  const handleDuplicateBudget = async (id) => {
    if (!window.confirm("Are you Sure you want to duplicate this Budget ?"))
      return;
    try {
      await apiCall(`/budget/duplicate/${id}`, "POST");
      fetchBudgets();
    } catch (error) {
      toast.error("Failed to duplicate Budget");
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Are you Sure you want to restore this Budget?"))
      return;
    try {
      await apiCall(`/budget/${id}/restore`, "PATCH");
      fetchBudgets();
      setViewDeleted(false);
    } catch (error) {
      toast.error("Failed to restore Budget");
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [currentPage, searchQuery, viewDeleted]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <BreadCrumb title="Budget Management" paths={["Budgets"]} />
      <div className="mt-4 bg-white rounded shadow px-4 py-3 md:mx-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-semibold text-lg">Budget List</h2>
          <div className="flex gap-4">
            {hasPermission("Budget", "create") && (
              <button
                onClick={() => {
                  setEditBudgetData(null);
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/25 font-medium"
              >
                <BadgePlus size={16} />
                <span>Add Budget</span>
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-center md:justify-end items-center gap-4 flex-wrap">
          {user.email === "admin" && (
            <button
              onClick={() => {
                setViewDeleted((prev) => {
                  setCurrentPage(1);
                  return !prev;
                });
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border shadow-sm transition-all duration-200 ${
                viewDeleted
                  ? "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {viewDeleted ? (
                <>
                  <ArchiveRestore size={16} />
                  Showing Deleted Budgets
                </>
              ) : (
                <>
                  <Archive size={16} />
                  Show Deleted Budgets
                </>
              )}
            </button>
          )}
          <div className="relative w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search Budgets..."
              onChange={(e) => handleSearch(e.target.value)}
              className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-8 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto mt-6 max-w-full border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full  text-sm">
            <thead className="bg-gradient-to-r from-gray-600 to-gray-600 text-white text-left">
              <tr>
                <th className="border-b px-4 py-3 whitespace-nowrap text-left align-top">
                  SI
                </th>
                <th className="border-b px-4 py-3 whitespace-nowrap text-left align-top">
                  Budget Id
                </th>
                <th className="border-b px-4 py-3 whitespace-nowrap text-left align-top">
                  Details
                </th>
                <th className="border-b px-4 py-3 whitespace-nowrap text-left align-top">
                  Date
                </th>
                <th className="border-b px-4 py-3 whitespace-nowrap text-left align-top">
                  Expense
                </th>
                <th className="border-b px-4 py-3 whitespace-nowrap text-left align-top">
                  Income
                </th>
                <th className="border-b px-4 py-3 whitespace-nowrap text-left align-top">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-6">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-red-500"
                    />
                  </td>
                </tr>
              ) : budgets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6">
                    No Budgets Found.
                  </td>
                </tr>
              ) : (
                budgets.map((budget, index) => (
                  <tr
                    key={budget.id}
                    className={`group transition-all ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:shadow-md`}
                  >
                    <td className="border-b px-4 py-3 text-sm text-gray-500 align-top font-medium">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    {/* Budget ID with pill style */}
                    <td className="border-b px-4 py-3 text-sm align-top whitespace-nowrap">
                      <span
                        className="inline-block bg-blue-100 text-blue-600 font-semibold text-xs px-3 py-1 rounded-full shadow-sm cursor-pointer"
                        onClick={() => {
                          setSelectedBudgetData(budget);
                          setViewModalOpen(true);
                        }}
                      >
                        {budget?.budget_id}
                      </span>
                    </td>

                    {/* Title and Creator with pseudo-avatar */}
                    <td className="border-b px-4 py-3 text-sm align-top">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-800">
                          {budget?.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {budget?.creator?.name || "Admin"}
                        </div>
                      </div>
                    </td>

                    {/* Date/From-To */}
                    <td className="border-b px-4 py-3 text-sm align-top whitespace-nowrap text-gray-700">
                      {budget?.date ? (
                        <div className="text-gray-800">
                          {new Date(budget?.date).toLocaleDateString("en-GB")}
                        </div>
                      ) : (
                        <div className="text-xs space-y-1">
                          <div>
                            <span className="font-semibold">From:</span>{" "}
                            {new Date(budget?.from_date).toLocaleDateString(
                              "en-GB"
                            )}
                          </div>
                          <div>
                            <span className="font-semibold">To:</span>{" "}
                            {new Date(budget?.to_date).toLocaleDateString(
                              "en-GB"
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* +Expense with red pill style */}
                    <td className="border-b px-4 py-3 align-top text-left whitespace-nowrap">
                      {hasPermission("Budget", "update") && (
                        <button
                          onClick={() => openBudgetItemModal(budget, "expense")}
                          className="bg-red-100 text-red-600 font-semibold text-xs px-3 py-1 rounded-full hover:bg-red-200"
                        >
                          + Expense
                        </button>
                      )}
                    </td>

                    {/* +Income +Sponsers with green & blue pill */}
                    <td className="border-b px-4 py-3 align-top whitespace-nowrap">
                      <div className="flex  gap-2">
                        {hasPermission("Budget", "update") && (
                          <>
                            <button
                              onClick={() =>
                                openBudgetItemModal(budget, "income")
                              }
                              className="bg-green-100 text-green-600 font-semibold text-xs px-3 py-1 rounded-full hover:bg-green-200"
                            >
                              + Income
                            </button>
                            <button
                              onClick={() =>
                                openBudgetItemModal(budget, "sponsers")
                              }
                              className="bg-blue-100 text-blue-600 font-semibold text-xs px-3 py-1 rounded-full hover:bg-blue-200"
                            >
                              + Sponsers
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Actions with icon hover and tooltips */}
                    <td className="border-b px-4 py-3 align-top whitespace-nowrap">
                      {!viewDeleted ? (
                        <div className="flex gap-3 items-center">
                          {hasPermission("Budget", "update") && (
                            <>
                              <button
                                title="Edit Budget"
                                className="text-gray-500 hover:text-blue-600 hover:scale-125"
                                onClick={() => {
                                  setEditBudgetData(budget);
                                  setIsAddModalOpen(true);
                                }}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="text-gray-500 hover:text-yellow-500 hover:scale-125"
                                onClick={() => handleDuplicateBudget(budget.id)}
                                title="Duplicate Budget"
                              >
                                <CopyIcon size={16} />{" "}
                              </button>
                            </>
                          )}
                          {hasPermission("Budget", "delete") && (
                            <button
                              title="Delete Budget"
                              className="text-gray-500 hover:text-red-600 hover:scale-125"
                              onClick={() => handleDelete(budget.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          className="px-3 py-2 text-center bg-blue-800 text-white rounded-lg text-xs"
                          onClick={() => handleRestore(budget.id)}
                        >
                          Restore Budget
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <AddBudget
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchBudgets();
          setIsAddModalOpen(false);
        }}
        editBudgetData={editBuudgetData}
      />
      <AddBudgetItemsModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        budgetData={selectedBudgetData}
        reloadData={fetchBudgets}
      />
      <ViewBudgetModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        budget={selectedBudgetData}
      />
    </div>
  );
};

export default Budget;
