import { Expense, Category, FilterState } from "./types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getMonthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function filterExpenses(
  expenses: Expense[],
  filters: FilterState
): Expense[] {
  let result = [...expenses];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }

  if (filters.category !== "All") {
    result = result.filter((e) => e.category === filters.category);
  }

  if (filters.dateFrom) {
    result = result.filter((e) => e.date >= filters.dateFrom);
  }

  if (filters.dateTo) {
    result = result.filter((e) => e.date <= filters.dateTo);
  }

  result.sort((a, b) => {
    let cmp: number;
    switch (filters.sortBy) {
      case "amount":
        cmp = a.amount - b.amount;
        break;
      case "category":
        cmp = a.category.localeCompare(b.category);
        break;
      default:
        cmp = a.date.localeCompare(b.date);
    }
    return filters.sortOrder === "desc" ? -cmp : cmp;
  });

  return result;
}

export function getCategoryTotals(
  expenses: Expense[]
): { category: Category; total: number; count: number }[] {
  const map = new Map<Category, { total: number; count: number }>();
  for (const e of expenses) {
    const existing = map.get(e.category) || { total: 0, count: 0 };
    map.set(e.category, {
      total: existing.total + e.amount,
      count: existing.count + 1,
    });
  }
  return Array.from(map.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.total - a.total);
}

export function getMonthlyTotals(
  expenses: Expense[]
): { month: string; total: number }[] {
  const map = new Map<string, number>();
  for (const e of expenses) {
    const month = e.date.slice(0, 7); // YYYY-MM
    map.set(month, (map.get(month) || 0) + e.amount);
  }
  return Array.from(map.entries())
    .map(([month, total]) => ({
      month: new Date(month + "-01T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      }),
      total,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function getDailyTotals(
  expenses: Expense[],
  days: number = 30
): { date: string; total: number }[] {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  const startStr = start.toISOString().split("T")[0];

  const map = new Map<string, number>();
  for (const e of expenses) {
    if (e.date >= startStr) {
      map.set(e.date, (map.get(e.date) || 0) + e.amount);
    }
  }

  const result: { date: string; total: number }[] = [];
  const cursor = new Date(start);
  while (cursor <= now) {
    const key = cursor.toISOString().split("T")[0];
    result.push({
      date: cursor.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      total: map.get(key) || 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

export function exportToCSV(expenses: Expense[]): void {
  const headers = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expenses-${getTodayString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
