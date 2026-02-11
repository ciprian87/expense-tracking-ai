"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Expense, Category, CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/types";
import { formatCurrency, getTodayString } from "@/lib/utils";
import { ExportFormat, ExportOptions, filterExportExpenses, performExport } from "@/lib/exportUtils";

interface Props {
  expenses: Expense[];
  open: boolean;
  onClose: () => void;
}

const FORMAT_META: Record<ExportFormat, { label: string; desc: string; icon: string }> = {
  csv: { label: "CSV", desc: "Spreadsheet compatible", icon: "table" },
  json: { label: "JSON", desc: "Structured data format", icon: "code" },
  pdf: { label: "PDF", desc: "Print-ready report", icon: "doc" },
};

export default function ExportModal({ expenses, open, onClose }: Props) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [filename, setFilename] = useState(`expenses-${getTodayString()}`);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setFormat("csv");
      setFilename(`expenses-${getTodayString()}`);
      setDateFrom("");
      setDateTo("");
      setSelectedCategories([]);
      setExporting(false);
      setDone(false);
      setShowPreview(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const options: ExportOptions = useMemo(
    () => ({ format, filename, dateFrom, dateTo, categories: selectedCategories }),
    [format, filename, dateFrom, dateTo, selectedCategories]
  );

  const filteredExpenses = useMemo(
    () => filterExportExpenses(expenses, options),
    [expenses, options]
  );

  const filteredTotal = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [filteredExpenses]
  );

  const toggleCategory = useCallback((cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await performExport(expenses, options);
      setDone(true);
      setTimeout(() => onClose(), 1200);
    } finally {
      setExporting(false);
    }
  }, [expenses, options, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Export Data</h2>
            <p className="text-sm text-gray-500">Configure and download your expense data</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Format Selection */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(FORMAT_META) as ExportFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    format === f
                      ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <FormatIcon type={FORMAT_META[f].icon} active={format === f} />
                  <p className={`text-sm font-semibold mt-2 ${format === f ? "text-indigo-700" : "text-gray-900"}`}>
                    {FORMAT_META[f].label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{FORMAT_META[f].desc}</p>
                  {format === f && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 5.5L4 8L8.5 2" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Filename */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filename</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="expenses"
                className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-sm text-gray-400 font-mono">.{format}</span>
            </div>
          </section>

          {/* Date Range */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </section>

          {/* Category Filter */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">Categories</label>
              <button
                onClick={() =>
                  setSelectedCategories((prev) =>
                    prev.length === CATEGORIES.length ? [] : [...CATEGORIES]
                  )
                }
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {selectedCategories.length === CATEGORIES.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Leave empty to include all categories</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      active
                        ? "text-white border-transparent"
                        : "text-gray-700 border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    style={active ? { backgroundColor: CATEGORY_COLORS[cat] } : undefined}
                  >
                    <span className="text-xs">{CATEGORY_ICONS[cat]}</span>
                    {cat}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Summary Bar */}
          <section className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {filteredExpenses.length} record{filteredExpenses.length !== 1 ? "s" : ""} to export
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Total: {formatCurrency(filteredTotal)}
              </p>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {showPreview ? "Hide preview" : "Preview data"}
            </button>
          </section>

          {/* Preview Table */}
          {showPreview && (
            <section className="border border-gray-200 rounded-xl overflow-hidden animate-fade-in">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Date</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Category</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Description</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                          No records match your filters
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.slice(0, 50).map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{e.date}</td>
                          <td className="px-4 py-2.5">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: CATEGORY_COLORS[e.category] }}
                            >
                              {CATEGORY_ICONS[e.category]} {e.category}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-700 max-w-[200px] truncate">{e.description}</td>
                          <td className="px-4 py-2.5 text-right font-medium text-gray-900 tabular-nums">
                            {formatCurrency(e.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {filteredExpenses.length > 50 && (
                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-200">
                  Showing 50 of {filteredExpenses.length} records
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || done || filteredExpenses.length === 0}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exporting...
              </>
            ) : done ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5L6.5 12L13 4" /></svg>
                Done!
              </>
            ) : (
              <>
                Export as {FORMAT_META[format].label}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormatIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? "text-indigo-600" : "text-gray-400";
  if (type === "table") {
    return (
      <svg className={color} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18" />
      </svg>
    );
  }
  if (type === "code") {
    return (
      <svg className={color} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
      </svg>
    );
  }
  return (
    <svg className={color} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}
