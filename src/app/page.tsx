"use client";

import { useExpenses } from "@/lib/useExpenses";
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Your spending overview at a glance</p>
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
