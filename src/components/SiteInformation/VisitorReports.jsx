import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { apiCall } from "../../utils/apiCall";
import BreadCrumb from "../../components/BreadCrum";

const VisitorsDashboard = () => {
  const [data, setData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  // ✅ Generate list of last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      label: d.toLocaleString("default", { month: "long", year: "numeric" }),
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    };
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split("-");
      const monthIndex = parseInt(month) - 1;
      const startDate = `${year}-${month}-01`;

      const endDateObj = new Date(Date.UTC(year, monthIndex + 1, 1));
      endDateObj.setUTCDate(0);

      const endDate = `${year}-${month}-${String(
        endDateObj.getUTCDate()
      ).padStart(2, "0")}`;

      const res = await apiCall(
        `/visit/report?startDate=${startDate}&endDate=${endDate}`,
        "GET"
      );

      const backendData = res.daily || [];
      const countryStats = res.byCountry || [];

      // ✅ Generate all days in global UTC
      const totalDays = endDateObj.getUTCDate();
      const allDays = [];

      for (let d = 1; d <= totalDays; d++) {
        const dateStr = new Date(Date.UTC(year, monthIndex, d))
          .toISOString()
          .split("T")[0]; // will always be UTC

        const found = backendData.find((v) => v.date === dateStr);

        allDays.push({
          date: dateStr,
          total_visits: found ? found.total_visits : 0,
        });
      }

      setData(allDays);
      setCountryData(countryStats);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load visitor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedMonth]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-screen bg-gray-50">
      <BreadCrumb title="Visitor Dashboard" paths={["Visitors", "Dashboard"]} />

      <div className="mt-4 bg-white mx-4 p-6 rounded-xl shadow-md flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Visitor Trends
          </h2>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-red-500" size={32} />
          </div>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No visitor data available.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: -15, bottom: 10 }}
            >
              <defs>
                {/* Gradient fill for bars */}
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.5} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  new Date(val).getDate().toString().padStart(2, "0")
                }
                label={{
                  value: `Day`,
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 12,
                }}
                interval="preserveStartEnd"
              />

              <YAxis
                tick={{ fontSize: 13 }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Visits",
                  angle: -180,
                  position: "insideLeft",
                  fontSize: 12,
                }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
                formatter={(value) => [`${value} visits`, "Total"]}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })
                }
              />

              <Bar
                dataKey="total_visits"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                barSize={window.innerWidth < 640 ? 10 : 30} // adaptive bar width
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Summary section */}
        {!loading && data.length > 0 && (
          <div className="mt-6 border-t pt-4 text-sm text-gray-700">
            <p>
              Total visits this month:{" "}
              <span className="font-semibold text-blue-600">
                {data.reduce((sum, d) => sum + d.total_visits, 0)}
              </span>
            </p>
          </div>
        )}

        {/* 🌍 Country-wise summary table */}
        {!loading && countryData.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-md font-semibold mb-3 text-gray-800">
              Country-wise Visitors
            </h3>
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-700 text-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left border-b">#</th>
                    <th className="px-4 py-3 text-left border-b">Country</th>
                    <th className="px-4 py-3 text-left border-b">
                      Total Visits
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {countryData.map((c, idx) => (
                    <tr
                      key={c.country || idx}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 border-b">{idx + 1}</td>
                      <td className="px-4 py-3 border-b font-bold">
                        {c.country || "Unknown"}
                      </td>
                      <td className="px-4 py-3 border-b font-bold text-blue-600">
                        {c.total_visits}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorsDashboard;
