"use client";

import { useState } from "react";
import { Expense, CATEGORIES, Category, FilterState, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/types";
import { formatCurrency, formatDate, filterExpenses, exportToCSV } from "@/lib/utils";

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const initialFilters: FilterState = {
  search: "",
  category: "All",
  dateFrom: "",
  dateTo: "",
  sortBy: "date",
  sortOrder: "desc",
};

export default function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = filterExpenses(expenses, filters);

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  function clearFilters() {
    setFilters(initialFilters);
  }

  const hasActiveFilters =
    filters.search || filters.category !== "All" || filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Expenses
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filtered.length}{filtered.length !== expenses.length ? ` of ${expenses.length}` : ""})
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                showFilters || hasActiveFilters
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="hidden sm:inline">Filters</span>
              <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {hasActiveFilters && (
                <span className="ml-1.5 w-2 h-2 bg-indigo-500 rounded-full inline-block" />
              )}
            </button>
            {expenses.length > 0 && (
              <button
                onClick={() => exportToCSV(filtered)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <span className="hidden sm:inline">Export CSV</span>
                <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as Category | "All" })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
              <div className="flex gap-1">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterState["sortBy"] })}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="category">Category</option>
                </select>
                <button
                  onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })}
                  className="px-2.5 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm hover:bg-gray-100 transition-colors"
                  title={filters.sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                  {filters.sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium sm:col-span-2 lg:col-span-4 text-left"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expense Items */}
      <div className="divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">{expenses.length === 0 ? "📊" : "🔍"}</div>
            <p className="text-gray-500 text-sm">
              {expenses.length === 0
                ? "No expenses yet. Add your first expense above!"
                : "No expenses match your filters."}
            </p>
          </div>
        ) : (
          filtered.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group"
            >
              {/* Category badge */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[expense.category] + "15" }}
              >
                {CATEGORY_ICONS[expense.category]}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {expense.description}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-2"
                    style={{
                      color: CATEGORY_COLORS[expense.category],
                      backgroundColor: CATEGORY_COLORS[expense.category] + "15",
                    }}
                  >
                    {expense.category}
                  </span>
                  {formatDate(expense.date)}
                </p>
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(expense.amount)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => onEdit(expense)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    deleteConfirm === expense.id
                      ? "text-red-600 bg-red-50"
                      : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  title={deleteConfirm === expense.id ? "Click again to confirm" : "Delete"}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
