"use client";

import { useExpenses } from "@/lib/useExpenses";
import { exportToCSV } from "@/lib/utils";
import AppShell from "@/components/AppShell";
import SummaryCards from "@/components/SummaryCards";
import Charts from "@/components/Charts";
import ExpenseForm from "@/components/ExpenseForm";

export default function DashboardPage() {
  const { expenses, loaded, addExpense } = useExpenses();

  if (!loaded) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Your spending overview at a glance</p>
        </div>
        {expenses.length > 0 && (
          <button
            onClick={() => exportToCSV(expenses)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Export Data
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="mb-6">
        <SummaryCards expenses={expenses} />
      </div>

      {/* Quick Add */}
      <div className="mb-6">
        <ExpenseForm onSubmit={addExpense} />
      </div>

      {/* Charts */}
      <Charts expenses={expenses} />
    </AppShell>
  );
}
