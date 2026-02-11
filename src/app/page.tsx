"use client";

import { useState } from "react";
import { useExpenses } from "@/lib/useExpenses";
import AppShell from "@/components/AppShell";
import SummaryCards from "@/components/SummaryCards";
import Charts from "@/components/Charts";
import ExpenseForm from "@/components/ExpenseForm";
import ExportModal from "@/components/ExportModal";

export default function DashboardPage() {
  const { expenses, loaded, addExpense } = useExpenses();
  const [exportOpen, setExportOpen] = useState(false);

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
            onClick={() => setExportOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v8M4 7l4 4 4-4M2 13h12" />
            </svg>
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

      {/* Export Modal */}
      <ExportModal expenses={expenses} open={exportOpen} onClose={() => setExportOpen(false)} />
    </AppShell>
  );
}
