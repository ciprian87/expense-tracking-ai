"use client";

import { useState, useEffect } from "react";
import { CATEGORIES, Category, ExpenseFormData, Expense, CATEGORY_ICONS } from "@/lib/types";
import { getTodayString } from "@/lib/utils";

interface Props {
  onSubmit: (data: ExpenseFormData) => void;
  editingExpense?: Expense | null;
  onCancelEdit?: () => void;
}

const initialForm: ExpenseFormData = {
  amount: "",
  category: "Food",
  description: "",
  date: getTodayString(),
};

export default function ExpenseForm({ onSubmit, editingExpense, onCancelEdit }: Props) {
  const [form, setForm] = useState<ExpenseFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setForm({
        amount: editingExpense.amount.toString(),
        category: editingExpense.category,
        description: editingExpense.description,
        date: editingExpense.date,
      });
      setErrors({});
    }
  }, [editingExpense]);

  function validate(data: ExpenseFormData): boolean {
    const errs: Partial<Record<keyof ExpenseFormData, string>> = {};
    const amount = parseFloat(data.amount);
    if (!data.amount || isNaN(amount) || amount <= 0) {
      errs.amount = "Enter a valid amount greater than 0";
    }
    if (amount > 999999.99) {
      errs.amount = "Amount cannot exceed $999,999.99";
    }
    if (!data.description.trim()) {
      errs.description = "Description is required";
    }
    if (data.description.trim().length > 100) {
      errs.description = "Description must be under 100 characters";
    }
    if (!data.date) {
      errs.date = "Date is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(form)) return;
    onSubmit(form);
    setForm({ ...initialForm, date: getTodayString() });
    setErrors({});
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  }

  function handleCancel() {
    setForm({ ...initialForm, date: getTodayString() });
    setErrors({});
    onCancelEdit?.();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {editingExpense ? "Edit Expense" : "Add New Expense"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={`w-full pl-7 pr-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                errors.amount ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 hover:bg-white"
              }`}
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
              errors.date ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 hover:bg-white"
            }`}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_ICONS[cat]} {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            placeholder="What was this expense for?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
              errors.description ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 hover:bg-white"
            }`}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {editingExpense ? "Update Expense" : "Add Expense"}
        </button>
        {editingExpense && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        )}
        {submitted && !editingExpense && (
          <span className="text-emerald-600 text-sm font-medium animate-fade-in">
            Expense added!
          </span>
        )}
      </div>
    </form>
  );
}
