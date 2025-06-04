import React, { useState, useEffect } from "react";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import BreadCrumb from "../components/BreadCrum";
import { Search, Loader2 } from "lucide-react";
import { apiCall } from "../utils/apiCall";
import debounce from "lodash.debounce";
import CopyrightFooter from "../components/CopyRightsComponent";
import { toast } from "react-toastify";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeRefundTxnId, setActiveRefundTxnId] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const pageSize = 20;

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/transactions?page=${currentPage}&search=${searchQuery}`,
        "GET"
      );
      setTransactions(response.data);
      setTotalRecords(response.pagination.totalRecords);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchQuery]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleRefundRequestedClick = (e, txnId) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    if (activeRefundTxnId === txnId) {
      setActiveRefundTxnId(null);
    } else {
      setActiveRefundTxnId(txnId);
      setTooltipPosition({
        x: rect.left,
        y: rect.bottom + window.scrollY,
      });
    }
  };

  const handleProcessRefund = async (txn) => {
    try {
      const payload = {
        transaction_id: txn.transaction_id,
        refund_reason: txn.refund_reason,
      };
      await apiCall(`/transactions/process-refund`, "POST", payload);
      toast.success("Refund processed successfully");
      setActiveRefundTxnId(null);
      fetchTransactions();
    } catch (error) {
      toast.error("Failed to process refund");
    }
  };

  const handleCancelRefund = async (txn) => {
    try {
      const payload = {
        transaction_id: txn.transaction_id,
      };
      await apiCall(`/transactions/reject-refund`, "POST", payload);
      toast.success("Refund Cancelled successfully");
      setActiveRefundTxnId(null);
      fetchTransactions();
    } catch (error) {
      toast.error("Failed to cancel refund");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <BreadCrumb
          title={"Transactions"}
          paths={["Programs", "Transaction List"]}
        />

        <div className="mt-4 rounded-sm shadow-md px-6 py-4 mx-4 bg-white flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex flex-row justify-between items-center gap-3 border-b border-dashed border-gray-300 pb-3">
            <p className="text-sm sm:text-lg font-semibold text-gray-800">
              Transaction List
            </p>
          </div>

          <div className="flex justify-center sm:justify-end mt-4">
            <div className="relative w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Transactions..."
                onChange={(e) => handleSearch(e.target.value)}
                className="border-2 border-gray-300 rounded-md text-xs sm:text-sm px-8 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-red-500" size={32} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto mt-4 max-w-full">
                <table className="w-full sm:min-w-[800px] border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="py-2 px-4 border">SI</th>
                      <th className="py-2 px-4 border">Member ID</th>
                      <th className="py-2 px-4 border">Name</th>
                      <th className="py-2 px-4 border">Transaction ID</th>
                      <th className="py-2 px-4 border">Transaction Date</th>
                      <th className="py-2 px-4 border">Amount</th>
                      <th className="py-2 px-4 border">Status</th>
                      <th className="py-2 px-4 border">Refund Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center py-6 text-gray-500"
                        >
                          No transactions available.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((txn, index) => (
                        <tr key={txn.id}>
                          <td className="py-2 px-4 border">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                          <td className="py-2 px-4 border">
                            {txn.member.member_id}
                          </td>
                          <td className="py-2 px-4 border">
                            {txn.member.name}
                          </td>
                          <td className="py-2 px-4 border">
                            {txn.transaction_id}
                          </td>
                          <td className="py-2 px-4 border">
                            {new Date(txn.transaction_date).toLocaleString()}
                          </td>
                          <td className="py-2 px-4 border">CHF {txn.amount}</td>
                          <td className="py-2 px-4 border capitalize">
                            <span
                              className={`px-2 py-1 text-xs rounded font-semibold ${
                                txn.payment_status === "completed"
                                  ? "bg-green-500 text-white"
                                  : txn.payment_status === "pending"
                                  ? "bg-yellow-400 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {txn.payment_status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2 px-4 border relative">
                            {txn.refund_requested_at ? (
                              txn.refund_status === "pending" ? (
                                <>
                                  <span
                                    className="cursor-pointer text-blue-500 underline"
                                    onClick={(e) =>
                                      handleRefundRequestedClick(e, txn.id)
                                    }
                                  >
                                    Refund requested
                                  </span>
                                </>
                              ) : (
                                <span
                                  className={`px-2 py-1 text-xs rounded font-semibold ${
                                    txn.refund_status === "completed"
                                      ? "bg-green-500 text-white"
                                      : txn.refund_status === "pending"
                                      ? "bg-yellow-400 text-white"
                                      : "bg-red-500 text-white"
                                  }`}
                                >
                                  {txn.refund_status.toUpperCase()}
                                </span>
                              )
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {activeRefundTxnId && (
                <div
                  className="fixed z-50 bg-white border border-gray-300 shadow rounded p-2 flex flex-col gap-2 w-40"
                  style={{
                    top: tooltipPosition.y + 4,
                    left: tooltipPosition.x,
                  }}
                >
                  <button
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() =>
                      handleProcessRefund(
                        transactions.find((txn) => txn.id === activeRefundTxnId)
                      )
                    }
                  >
                    Process Refund
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() =>
                      handleCancelRefund(
                        transactions.find((txn) => txn.id === activeRefundTxnId)
                      )
                    }
                  >
                    Cancel Refund
                  </button>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="text-sm px-3 py-1.5 rounded border hover:bg-gray-100 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="text-sm px-3 py-1.5 rounded border hover:bg-gray-100 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <CopyrightFooter />
      </div>
    </div>
  );
};

export default Transactions;
