"use client";

import { Expense, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/types";
import { formatCurrency, getCategoryTotals, getMonthStart } from "@/lib/utils";

interface Props {
  expenses: Expense[];
}

export default function SummaryCards({ expenses }: Props) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthStart = getMonthStart();
  const monthExpenses = expenses.filter((e) => e.date >= monthStart);
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = getCategoryTotals(expenses);
  const topCategory = categoryTotals[0];

  const today = new Date().toISOString().split("T")[0];
  const todayTotal = expenses
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Total Spending"
        value={formatCurrency(total)}
        sub={`${expenses.length} expense${expenses.length !== 1 ? "s" : ""}`}
        color="indigo"
      />
      <Card
        label="This Month"
        value={formatCurrency(monthTotal)}
        sub={`${monthExpenses.length} expense${monthExpenses.length !== 1 ? "s" : ""}`}
        color="emerald"
      />
      <Card
        label="Today"
        value={formatCurrency(todayTotal)}
        sub={new Date().toLocaleDateString("en-US", { weekday: "long" })}
        color="amber"
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Top Category</p>
        {topCategory ? (
          <>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ backgroundColor: CATEGORY_COLORS[topCategory.category] + "15" }}
              >
                {CATEGORY_ICONS[topCategory.category]}
              </span>
              <span className="text-xl font-bold text-gray-900">{topCategory.category}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(topCategory.total)} ({topCategory.count} expense{topCategory.count !== 1 ? "s" : ""})
            </p>
          </>
        ) : (
          <>
            <p className="text-xl font-bold text-gray-400 mt-2">--</p>
            <p className="text-xs text-gray-400 mt-1">No data yet</p>
          </>
        )}
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "indigo" | "emerald" | "amber";
}) {
  const colors = {
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] bg-gradient-to-br ${colors[color]} opacity-5`} />
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}
