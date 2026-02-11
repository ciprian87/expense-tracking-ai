"use client";

import { useState } from "react";
import { useExpenses } from "@/lib/useExpenses";
import AppShell from "@/components/AppShell";
import SummaryCards from "@/components/SummaryCards";
import Charts from "@/components/Charts";
import ExpenseForm from "@/components/ExpenseForm";
import ExportHub from "@/components/ExportHub";

export default function DashboardPage() {
  const { expenses, loaded, addExpense } = useExpenses();
  const [hubOpen, setHubOpen] = useState(false);

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
            onClick={() => setHubOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 transition-all shadow-sm flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19H9a7 7 0 115.7-11.1A5.5 5.5 0 0121 12.5V13a4 4 0 01-3.5 6z" />
            </svg>
            Export Hub
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

      {/* Export Hub Drawer */}
      <ExportHub expenses={expenses} open={hubOpen} onClose={() => setHubOpen(false)} />
    </AppShell>
  );
}
