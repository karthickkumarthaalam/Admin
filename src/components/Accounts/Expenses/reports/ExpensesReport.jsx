import React, { useEffect, useState } from "react";
import { apiCall } from "../../../../utils/apiCall";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Loader2,
  Filter,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { useDebounce } from "../../../../hooks/useDebounce";
import { exportExpensesReportPDF } from "../../../../utils/exportExpenseReportPdf";

const ExpensesReport = () => {
  const [reportData, setReportData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedYear = useDebounce(year, 600);

  const colors = [
    "#2563eb", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#0ea5e9", // sky
    "#f97316", // orange
    "#22c55e", // lime
  ];

  const fetchMerchants = async () => {
    try {
      const res = await apiCall(`/merchant`, "GET");
      setMerchants(res.data || []);
    } catch {
      toast.error("Failed to fetch merchants");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiCall("/system-user", "GET");
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/expense/report?year=${year}`;
      if (selectedMerchant) url += `&merchant=${selectedMerchant}`;
      if (selectedUser) url += `&merchant=${selectedUser}`;
      const res = await apiCall(url, "GET");
      setReportData(res.data || []);
    } catch {
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMerchants();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [debouncedYear, selectedMerchant, selectedUser]);

  const CustomTooltip = ({ active, payload, label, currencySymbol }) => {
    if (active && payload && payload.length) {
      const total = payload.find((p) => p.dataKey === "total_amount");
      const pending = payload.find((p) => p.dataKey === "pending_amount");

      return (
        <div className="relative bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-xl px-4 py-3 text-sm transition-all duration-200">
          {/* Accent bar */}
          <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl bg-gradient-to-r from-blue-500 to-indigo-500"></div>

          <div className="mt-2">
            <p className="font-semibold text-gray-800 text-base mb-2">
              {label}
            </p>

            <div className="flex items-center justify-between gap-6">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs uppercase tracking-wide">
                  Total
                </span>
                <span className="font-semibold text-gray-900 text-sm">
                  {currencySymbol}{" "}
                  {total?.value?.toLocaleString(
                    currencySymbol === "CHF" ? "en-CH" : "en-GB",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-500 text-xs uppercase tracking-wide">
                  Pending
                </span>
                <span className="font-semibold text-amber-600 text-sm">
                  {currencySymbol}{" "}
                  {pending?.value?.toLocaleString(
                    currencySymbol === "CHF" ? "en-CH" : "en-GB",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-100  p-6">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-5 mb-8 ">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center justify-between flex-1">
            <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Filter size={18} className="text-blue-600 " />
              Expense Report Filters
            </h2>

            <button
              onClick={() =>
                exportExpensesReportPDF({
                  reportData,
                  year,
                  selectedMerchant,
                  selectedUser,
                })
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r 
                   from-blue-600 to-indigo-600 text-white text-sm font-medium 
                   shadow hover:shadow-md transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
              Export
            </button>
          </div>

          <div className="flex overflow-x-auto scrollbar-none gap-3 items-center">
            {/* Year Input */}
            <div className="relative min-w-[110px]">
              <Calendar
                className="absolute left-3 top-2.5 text-gray-400"
                size={16}
              />
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="pl-9 pr-3 py-2 w-full rounded-lg border border-gray-200 
                   bg-white text-sm text-gray-700 placeholder:text-gray-400
                   focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                   transition-all duration-200 outline-none"
                placeholder="Year"
              />
            </div>

            {/* Merchant Filter */}
            <select
              value={selectedMerchant}
              onChange={(e) => {
                setSelectedMerchant(e.target.value);
                setSelectedUser("");
              }}
              className="min-w-[160px] py-2 px-3 rounded-lg border border-gray-200 
                 bg-white text-sm text-gray-700 cursor-pointer
                 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                 transition-all duration-200 outline-none"
            >
              <option value="">All Merchants</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.merchant_name}>
                  {m.merchant_name}
                </option>
              ))}
            </select>

            {/* User Filter */}
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                setSelectedMerchant("");
              }}
              className="min-w-[140px] py-2 px-3 rounded-lg border border-gray-200 
                 bg-white text-sm text-gray-700 cursor-pointer
                 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                 transition-all duration-200 outline-none"
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="ml-3 text-gray-600">Loading report...</p>
        </div>
      ) : reportData.length > 0 ? (
        <div className="space-y-10">
          {reportData.map((currencyData, index) => {
            const color = colors[index % colors.length];
            const completionRate = currencyData.year_total
              ? Math.round(
                  ((currencyData.year_total - currencyData.pending_total) /
                    currencyData.year_total) *
                    100
                )
              : 0;

            return (
              <div
                key={currencyData.currency_id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition p-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    ></span>
                    {currencyData.currency_name}{" "}
                    <span className="text-gray-500">
                      ({currencyData.currency_symbol})
                    </span>
                  </h3>
                  <span className="text-sm text-gray-500 font-medium">
                    {year}
                  </span>
                </div>

                {/* Chart & Totals side-by-side */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Chart */}
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={currencyData.months}
                        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                        />
                        <Tooltip
                          content={
                            <CustomTooltip
                              currencySymbol={currencyData.currency_symbol}
                            />
                          }
                        />
                        <Legend />
                        <Bar
                          dataKey="total_amount"
                          fill={color}
                          name="Total Amount"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="pending_amount"
                          fill={`${color}66`}
                          name="Pending Amount"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Totals at right side */}
                  <div className="w-full lg:w-64 flex flex-col gap-4">
                    <div className="p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium text-sm">Yearly Total</h4>
                        <TrendingUp size={16} />
                      </div>
                      <p className="text-2xl font-bold">
                        {currencyData.currency_symbol}{" "}
                        {currencyData.year_total.toLocaleString(
                          currencyData.currency_symbol === "CHF"
                            ? "en-CH"
                            : "en-GB",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium text-sm">Pending Total</h4>
                        <AlertCircle size={16} />
                      </div>
                      <p className="text-2xl font-bold">
                        {currencyData.currency_symbol}{" "}
                        {currencyData.pending_total.toLocaleString(
                          currencyData.currency_symbol === "CHF"
                            ? "en-CH"
                            : "en-GB",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-medium text-sm">Completion</h4>
                        <CheckCircle2 size={16} />
                      </div>
                      <p className="text-2xl font-bold">{completionRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-blue-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative bg-white shadow-inner border border-gray-200 rounded-full p-6">
              <DollarSign
                size={48}
                className="text-blue-600 drop-shadow-md opacity-90"
              />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Expense Data Found
          </h3>
          <p className="text-gray-500 max-w-md">
            Try adjusting your filters or add new expense entries to see
            insights here.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpensesReport;
