import { Expense, Category } from "./types";

export type ExportFormat = "csv" | "json" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  dateFrom: string;
  dateTo: string;
  categories: Category[];
}

export function filterExportExpenses(
  expenses: Expense[],
  options: ExportOptions
): Expense[] {
  let result = [...expenses];

  if (options.dateFrom) {
    result = result.filter((e) => e.date >= options.dateFrom);
  }
  if (options.dateTo) {
    result = result.filter((e) => e.date <= options.dateTo);
  }
  if (options.categories.length > 0) {
    result = result.filter((e) => options.categories.includes(e.category));
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsCSV(expenses: Expense[], filename: string) {
  const headers = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${filename}.csv`);
}

export function exportAsJSON(expenses: Expense[], filename: string) {
  const data = expenses.map((e) => ({
    date: e.date,
    category: e.category,
    description: e.description,
    amount: e.amount,
  }));
  const json = JSON.stringify(data, null, 2);
  downloadBlob(new Blob([json], { type: "application/json" }), `${filename}.json`);
}

export function exportAsPDF(expenses: Expense[], filename: string) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Build PDF page content as HTML, render in a print window
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 40px; color: #1f2937; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 10px 12px; background: #f3f4f6; border-bottom: 2px solid #e5e7eb; font-weight: 600; }
        td { padding: 9px 12px; border-bottom: 1px solid #f3f4f6; }
        tr:nth-child(even) td { background: #f9fafb; }
        .amount { text-align: right; font-variant-numeric: tabular-nums; }
        .total-row { margin-top: 16px; text-align: right; font-size: 15px; font-weight: 700; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>Expense Report</h1>
      <p class="subtitle">${expenses.length} record${expenses.length !== 1 ? "s" : ""} &middot; Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      <table>
        <thead><tr><th>Date</th><th>Category</th><th>Description</th><th class="amount">Amount</th></tr></thead>
        <tbody>
          ${expenses.map((e) => `<tr><td>${e.date}</td><td>${e.category}</td><td>${e.description}</td><td class="amount">$${e.amount.toFixed(2)}</td></tr>`).join("")}
        </tbody>
      </table>
      <p class="total-row">Total: $${total.toFixed(2)}</p>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export async function performExport(
  expenses: Expense[],
  options: ExportOptions
): Promise<void> {
  const filtered = filterExportExpenses(expenses, options);

  // Simulate brief processing time for UX feedback
  await new Promise((r) => setTimeout(r, 600));

  switch (options.format) {
    case "csv":
      exportAsCSV(filtered, options.filename);
      break;
    case "json":
      exportAsJSON(filtered, options.filename);
      break;
    case "pdf":
      exportAsPDF(filtered, options.filename);
      break;
  }
}
