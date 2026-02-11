"use client";

import { Expense, CATEGORY_COLORS } from "@/lib/types";
import { getCategoryTotals, getDailyTotals, formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface Props {
  expenses: Expense[];
}

export default function Charts({ expenses }: Props) {
  const categoryTotals = getCategoryTotals(expenses);
  const dailyTotals = getDailyTotals(expenses, 30);

  const pieData = categoryTotals.map((ct) => ({
    name: ct.category,
    value: ct.total,
    color: CATEGORY_COLORS[ct.category],
  }));

  const total = categoryTotals.reduce((sum, ct) => sum + ct.total, 0);

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="text-4xl mb-3">📈</div>
        <p className="text-gray-500 text-sm">Add some expenses to see your spending analytics.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Spending Trend */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Last 30 Days</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTotals}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={50}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Spent"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorTotal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">By Category</h3>
        <div className="flex items-center gap-6">
          <div className="w-[140px] h-[140px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value))]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2.5">
            {categoryTotals.map((ct) => (
              <div key={ct.category} className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[ct.category] }}
                />
                <span className="text-xs text-gray-600 flex-1">{ct.category}</span>
                <span className="text-xs font-semibold text-gray-900">
                  {formatCurrency(ct.total)}
                </span>
                <span className="text-xs text-gray-400 w-10 text-right">
                  {total > 0 ? Math.round((ct.total / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Comparison Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Category Comparison</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryTotals}
              layout="vertical"
              margin={{ left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Total"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={24}>
                {categoryTotals.map((entry, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[entry.category]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
