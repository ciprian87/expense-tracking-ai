"use client";

import { useState } from "react";
import { useExpenses } from "@/lib/useExpenses";
import { Expense } from "@/lib/types";
import AppShell from "@/components/AppShell";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";

export default function ExpensesPage() {
  const { expenses, loaded, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [editing, setEditing] = useState<Expense | null>(null);

  function handleSubmit(data: Parameters<typeof addExpense>[0]) {
    if (editing) {
      updateExpense(editing.id, data);
      setEditing(null);
    } else {
      addExpense(data);
    }
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and track all your expenses
        </p>
      </div>

      {/* Form */}
      <div className="mb-6">
        <ExpenseForm
          onSubmit={handleSubmit}
          editingExpense={editing}
          onCancelEdit={() => setEditing(null)}
        />
      </div>

      {/* List */}
      <ExpenseList
        expenses={expenses}
        onEdit={setEditing}
        onDelete={deleteExpense}
      />
    </AppShell>
  );
}
