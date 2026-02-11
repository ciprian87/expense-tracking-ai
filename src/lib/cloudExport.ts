import { Expense, Category } from "./types";
import { getTodayString, formatCurrency } from "./utils";

// ── Types ──

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  categories: Category[] | "all";
  dateRange: "all" | "this-month" | "last-month" | "this-year" | "last-90-days";
  format: "csv" | "json" | "pdf";
  columns: string[];
}

export interface CloudService {
  id: string;
  name: string;
  color: string;
  connected: boolean;
  lastSync?: string;
}

export interface ExportHistoryEntry {
  id: string;
  timestamp: string;
  destination: string;
  templateName: string;
  recordCount: number;
  totalAmount: number;
  status: "completed" | "failed" | "pending";
}

export interface ScheduleConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  destination: string;
  template: string;
  nextRun?: string;
}

export interface ShareLink {
  id: string;
  url: string;
  createdAt: string;
  expiresAt: string;
  accessCount: number;
}

// ── Templates ──

export const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: "tax-report",
    name: "Tax Report",
    description: "All deductible expenses formatted for tax filing",
    icon: "receipt",
    categories: "all",
    dateRange: "this-year",
    format: "pdf",
    columns: ["Date", "Category", "Description", "Amount"],
  },
  {
    id: "monthly-summary",
    name: "Monthly Summary",
    description: "Current month breakdown by category with totals",
    icon: "calendar",
    categories: "all",
    dateRange: "this-month",
    format: "csv",
    columns: ["Date", "Category", "Description", "Amount"],
  },
  {
    id: "category-analysis",
    name: "Category Analysis",
    description: "Deep dive into spending patterns per category",
    icon: "chart",
    categories: "all",
    dateRange: "last-90-days",
    format: "json",
    columns: ["Date", "Category", "Description", "Amount"],
  },
  {
    id: "bills-only",
    name: "Bills & Utilities",
    description: "Recurring bills and utility payments only",
    icon: "bolt",
    categories: ["Bills"],
    dateRange: "this-year",
    format: "csv",
    columns: ["Date", "Description", "Amount"],
  },
];

// ── Cloud Services ──

export const CLOUD_SERVICES: CloudService[] = [
  { id: "google-sheets", name: "Google Sheets", color: "#34a853", connected: false },
  { id: "dropbox", name: "Dropbox", color: "#0061ff", connected: false },
  { id: "onedrive", name: "OneDrive", color: "#0078d4", connected: false },
  { id: "notion", name: "Notion", color: "#000000", connected: false },
  { id: "email", name: "Email", color: "#ea4335", connected: true },
  { id: "slack", name: "Slack", color: "#4a154b", connected: false },
];

// ── History Storage ──

const HISTORY_KEY = "expense-export-history";
const SCHEDULE_KEY = "expense-export-schedule";
const SHARES_KEY = "expense-export-shares";
const SERVICES_KEY = "expense-cloud-services";

export function loadHistory(): ExportHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(history: ExportHistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function addHistoryEntry(entry: Omit<ExportHistoryEntry, "id" | "timestamp">): ExportHistoryEntry {
  const full: ExportHistoryEntry = {
    ...entry,
    id: Math.random().toString(36).slice(2, 10),
    timestamp: new Date().toISOString(),
  };
  const history = [full, ...loadHistory()].slice(0, 50);
  saveHistory(history);
  return full;
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

// ── Schedule Storage ──

export function loadSchedule(): ScheduleConfig | null {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSchedule(config: ScheduleConfig) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(config));
}

// ── Service Connection Storage ──

export function loadServiceConnections(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(SERVICES_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveServiceConnection(serviceId: string, connected: boolean) {
  const connections = loadServiceConnections();
  connections[serviceId] = connected;
  localStorage.setItem(SERVICES_KEY, JSON.stringify(connections));
}

// ── Share Links ──

export function loadShares(): ShareLink[] {
  try {
    return JSON.parse(localStorage.getItem(SHARES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function createShareLink(): ShareLink {
  const link: ShareLink = {
    id: Math.random().toString(36).slice(2, 10),
    url: `https://expenses.app/shared/${Math.random().toString(36).slice(2, 14)}`,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    accessCount: 0,
  };
  const shares = [link, ...loadShares()].slice(0, 10);
  localStorage.setItem(SHARES_KEY, JSON.stringify(shares));
  return link;
}

export function revokeShareLink(id: string) {
  const shares = loadShares().filter((s) => s.id !== id);
  localStorage.setItem(SHARES_KEY, JSON.stringify(shares));
}

// ── Template Filtering ──

export function getDateRangeBounds(range: ExportTemplate["dateRange"]): { from: string; to: string } {
  const now = new Date();
  const to = getTodayString();

  switch (range) {
    case "this-month": {
      const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      return { from, to };
    }
    case "last-month": {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        from: `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-01`,
        to: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`,
      };
    }
    case "this-year": {
      return { from: `${now.getFullYear()}-01-01`, to };
    }
    case "last-90-days": {
      const start = new Date(now);
      start.setDate(start.getDate() - 90);
      return { from: start.toISOString().split("T")[0], to };
    }
    default:
      return { from: "", to };
  }
}

export function applyTemplate(expenses: Expense[], template: ExportTemplate): Expense[] {
  let result = [...expenses];
  const { from, to } = getDateRangeBounds(template.dateRange);

  if (from) result = result.filter((e) => e.date >= from);
  if (to) result = result.filter((e) => e.date <= to);
  if (template.categories !== "all") {
    result = result.filter((e) => template.categories.includes(e.category));
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

// ── Export Execution ──

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function executeExport(
  expenses: Expense[],
  template: ExportTemplate,
  destination: string
): Promise<ExportHistoryEntry> {
  const filtered = applyTemplate(expenses, template);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  // Simulate cloud processing
  await new Promise((r) => setTimeout(r, 1200));

  if (destination === "download" || destination === "email") {
    const filename = `${template.id}-${getTodayString()}`;
    switch (template.format) {
      case "csv": {
        const headers = template.columns.join(",");
        const rows = filtered.map((e) =>
          template.columns.map((c) => {
            if (c === "Date") return e.date;
            if (c === "Category") return e.category;
            if (c === "Description") return `"${e.description.replace(/"/g, '""')}"`;
            return e.amount.toFixed(2);
          }).join(",")
        );
        downloadBlob(new Blob([[headers, ...rows].join("\n")], { type: "text/csv" }), `${filename}.csv`);
        break;
      }
      case "json": {
        const data = filtered.map((e) => ({ date: e.date, category: e.category, description: e.description, amount: e.amount }));
        downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `${filename}.json`);
        break;
      }
      case "pdf": {
        const html = buildPdfHtml(filtered, template, total);
        const win = window.open("", "_blank");
        if (win) { win.document.write(html); win.document.close(); }
        break;
      }
    }
  }

  return addHistoryEntry({
    destination,
    templateName: template.name,
    recordCount: filtered.length,
    totalAmount: total,
    status: "completed",
  });
}

function buildPdfHtml(expenses: Expense[], template: ExportTemplate, total: number): string {
  return `<!DOCTYPE html><html><head><title>${template.name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:40px;color:#1f2937}
h1{font-size:22px;margin-bottom:4px}.subtitle{color:#6b7280;font-size:13px;margin-bottom:24px}
table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;padding:10px 12px;background:#f3f4f6;border-bottom:2px solid #e5e7eb;font-weight:600}
td{padding:9px 12px;border-bottom:1px solid #f3f4f6}tr:nth-child(even) td{background:#f9fafb}
.amount{text-align:right;font-variant-numeric:tabular-nums}.total{margin-top:16px;text-align:right;font-size:15px;font-weight:700}
@media print{body{padding:20px}}</style></head><body>
<h1>${template.name}</h1>
<p class="subtitle">${expenses.length} records &middot; ${formatCurrency(total)} total &middot; ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
<table><thead><tr>${template.columns.map((c) => `<th${c === "Amount" ? ' class="amount"' : ""}>${c}</th>`).join("")}</tr></thead>
<tbody>${expenses.map((e) => `<tr><td>${e.date}</td>${template.columns.includes("Category") ? `<td>${e.category}</td>` : ""}<td>${e.description}</td><td class="amount">${formatCurrency(e.amount)}</td></tr>`).join("")}</tbody></table>
<p class="total">Total: ${formatCurrency(total)}</p>
<script>window.onload=function(){window.print()}</script></body></html>`;
}
