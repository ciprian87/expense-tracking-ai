"use client";

import { useState, useEffect, useCallback } from "react";
import { Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  EXPORT_TEMPLATES,
  CLOUD_SERVICES,
  ExportTemplate,
  ExportHistoryEntry,
  ScheduleConfig,
  ShareLink,
  CloudService,
  loadHistory,
  clearHistory,
  loadSchedule,
  saveSchedule,
  loadServiceConnections,
  saveServiceConnection,
  loadShares,
  createShareLink,
  revokeShareLink,
  applyTemplate,
  executeExport,
} from "@/lib/cloudExport";

interface Props {
  expenses: Expense[];
  open: boolean;
  onClose: () => void;
}

type Tab = "templates" | "integrations" | "share" | "history" | "schedule";

const TABS: { id: Tab; label: string }[] = [
  { id: "templates", label: "Templates" },
  { id: "integrations", label: "Integrations" },
  { id: "share", label: "Share" },
  { id: "schedule", label: "Schedule" },
  { id: "history", label: "History" },
];

export default function ExportHub({ expenses, open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("templates");
  const [exporting, setExporting] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Persistent state
  const [history, setHistory] = useState<ExportHistoryEntry[]>([]);
  const [schedule, setScheduleState] = useState<ScheduleConfig | null>(null);
  const [serviceConns, setServiceConns] = useState<Record<string, boolean>>({});
  const [shares, setShares] = useState<ShareLink[]>([]);

  // Load persisted state
  useEffect(() => {
    if (open) {
      setHistory(loadHistory());
      setScheduleState(loadSchedule());
      setServiceConns(loadServiceConnections());
      setShares(loadShares());
      setExporting(null);
      setSuccessId(null);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleExport = useCallback(async (template: ExportTemplate, destination: string) => {
    setExporting(template.id);
    try {
      await executeExport(expenses, template, destination);
      setSuccessId(template.id);
      setHistory(loadHistory());
      setTimeout(() => setSuccessId(null), 2000);
    } finally {
      setExporting(null);
    }
  }, [expenses]);

  const toggleService = useCallback((id: string) => {
    const next = !serviceConns[id];
    saveServiceConnection(id, next);
    setServiceConns((prev) => ({ ...prev, [id]: next }));
  }, [serviceConns]);

  const handleCreateShare = useCallback(() => {
    createShareLink();
    setShares(loadShares());
  }, []);

  const handleRevokeShare = useCallback((id: string) => {
    revokeShareLink(id);
    setShares(loadShares());
  }, []);

  const handleScheduleSave = useCallback((config: ScheduleConfig) => {
    saveSchedule(config);
    setScheduleState(config);
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <CloudIcon className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Export Hub</h2>
                <p className="text-xs text-gray-500">Cloud export, share & sync</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 text-xs font-medium py-2 px-1 rounded-md transition-all ${
                  tab === t.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
                {t.id === "history" && history.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-[10px]">{history.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "templates" && (
            <TemplatesTab
              expenses={expenses}
              exporting={exporting}
              successId={successId}
              onExport={handleExport}
            />
          )}
          {tab === "integrations" && (
            <IntegrationsTab
              serviceConns={serviceConns}
              onToggle={toggleService}
            />
          )}
          {tab === "share" && (
            <ShareTab
              shares={shares}
              onCreate={handleCreateShare}
              onRevoke={handleRevokeShare}
              expenseCount={expenses.length}
            />
          )}
          {tab === "schedule" && (
            <ScheduleTab
              schedule={schedule}
              onSave={handleScheduleSave}
            />
          )}
          {tab === "history" && (
            <HistoryTab
              history={history}
              onClear={handleClearHistory}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Templates Tab ──

function TemplatesTab({
  expenses,
  exporting,
  successId,
  onExport,
}: {
  expenses: Expense[];
  exporting: string | null;
  successId: string | null;
  onExport: (t: ExportTemplate, dest: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Pre-configured exports for common needs. Click to download instantly.</p>
      {EXPORT_TEMPLATES.map((t) => {
        const filtered = applyTemplate(expenses, t);
        const total = filtered.reduce((s, e) => s + e.amount, 0);
        const isExporting = exporting === t.id;
        const isSuccess = successId === t.id;

        return (
          <div key={t.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TemplateIcon type={t.icon} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{t.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      {t.format}
                    </span>
                    <span className="text-xs text-gray-400">
                      {filtered.length} record{filtered.length !== 1 ? "s" : ""} &middot; {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onExport(t, "download")}
                  disabled={isExporting || filtered.length === 0}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isExporting ? (
                    <><Spinner /> Exporting...</>
                  ) : isSuccess ? (
                    <><CheckIcon /> Done</>
                  ) : (
                    <>
                      <DownloadIcon /> Export
                    </>
                  )}
                </button>
                <button
                  onClick={() => onExport(t, "email")}
                  disabled={isExporting || filtered.length === 0}
                  title="Send via email"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <EmailIcon />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Integrations Tab ──

function IntegrationsTab({
  serviceConns,
  onToggle,
}: {
  serviceConns: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Connect services to export directly to your favorite tools.</p>
      <div className="grid grid-cols-1 gap-3">
        {CLOUD_SERVICES.map((svc) => {
          const connected = serviceConns[svc.id] ?? svc.connected;
          return (
            <div
              key={svc.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                connected
                  ? "bg-white border-gray-200 shadow-sm"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <ServiceLogo service={svc} />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{svc.name}</h3>
                  <p className="text-xs text-gray-500">
                    {connected ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        Connected
                      </span>
                    ) : (
                      "Not connected"
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onToggle(svc.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  connected
                    ? "text-red-600 hover:bg-red-50 border border-red-200"
                    : "text-indigo-600 hover:bg-indigo-50 border border-indigo-200"
                }`}
              >
                {connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>
      <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
        <p className="text-xs text-indigo-700 font-medium">
          Cloud integrations are simulated in this demo. In production, each service would use OAuth for secure authentication.
        </p>
      </div>
    </div>
  );
}

// ── Share Tab ──

function ShareTab({
  shares,
  onCreate,
  onRevoke,
  expenseCount,
}: {
  shares: ShareLink[];
  onCreate: () => void;
  onRevoke: (id: string) => void;
  expenseCount: number;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyLink = (link: ShareLink) => {
    navigator.clipboard.writeText(link.url);
    setCopied(link.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Create shareable links to your expense data. Links expire after 7 days.</p>

      {/* Generate Link */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-indigo-200 flex items-center justify-center">
            <LinkIcon />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Shareable Link</h3>
            <p className="text-xs text-gray-500">{expenseCount} expense{expenseCount !== 1 ? "s" : ""} will be included</p>
          </div>
        </div>
        <button
          onClick={onCreate}
          className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Generate New Link
        </button>
      </div>

      {/* QR Code Preview */}
      {shares.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
          <div className="w-32 h-32 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-3 border-2 border-dashed border-gray-300">
            <QrPlaceholder />
          </div>
          <p className="text-xs text-gray-500">Scan to access latest shared report</p>
        </div>
      )}

      {/* Active Links */}
      {shares.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Links</h3>
          <div className="space-y-2">
            {shares.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-xs font-mono text-gray-600 truncate">{link.url}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Expires {new Date(link.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => copyLink(link)}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    {copied === link.id ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => onRevoke(link.id)}
                    className="px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Schedule Tab ──

function ScheduleTab({
  schedule,
  onSave,
}: {
  schedule: ScheduleConfig | null;
  onSave: (config: ScheduleConfig) => void;
}) {
  const [enabled, setEnabled] = useState(schedule?.enabled ?? false);
  const [frequency, setFrequency] = useState<ScheduleConfig["frequency"]>(schedule?.frequency ?? "weekly");
  const [destination, setDestination] = useState(schedule?.destination ?? "email");
  const [template, setTemplate] = useState(schedule?.template ?? "monthly-summary");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const nextRun = computeNextRun(frequency);
    onSave({ enabled, frequency, destination, template, nextRun });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Set up automatic recurring exports. Your data will be exported on schedule.</p>

      {/* Enable toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Automatic Exports</h3>
          <p className="text-xs text-gray-500 mt-0.5">Run exports on a recurring schedule</p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? "bg-indigo-600" : "bg-gray-300"}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>

      {enabled && (
        <div className="space-y-4 animate-fade-in">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {(["daily", "weekly", "monthly"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`py-2.5 text-sm font-medium rounded-lg border transition-all capitalize ${
                    frequency === f
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Template</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {EXPORT_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Send to</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {CLOUD_SERVICES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
              <option value="download">Local Download</option>
            </select>
          </div>

          {/* Next Run Preview */}
          <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
            <p className="text-xs text-indigo-700">
              <span className="font-semibold">Next export:</span> {computeNextRun(frequency)}
            </p>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            {saved ? <><CheckIcon /> Saved!</> : "Save Schedule"}
          </button>
        </div>
      )}

      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
        <p className="text-xs text-amber-700 font-medium">
          Scheduled exports are simulated in this demo. In production, this would use a server-side cron job or cloud function.
        </p>
      </div>
    </div>
  );
}

// ── History Tab ──

function HistoryTab({
  history,
  onClear,
}: {
  history: ExportHistoryEntry[];
  onClear: () => void;
}) {
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <HistoryIcon />
        </div>
        <p className="text-sm font-medium text-gray-600">No exports yet</p>
        <p className="text-xs text-gray-400 mt-1">Your export history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{history.length} export{history.length !== 1 ? "s" : ""} recorded</p>
        <button onClick={onClear} className="text-xs text-red-500 hover:text-red-600 font-medium">
          Clear all
        </button>
      </div>
      <div className="space-y-2">
        {history.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                entry.status === "completed" ? "bg-emerald-100" : entry.status === "failed" ? "bg-red-100" : "bg-amber-100"
              }`}>
                {entry.status === "completed" ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round"><path d="M3 8.5L6.5 12L13 4" /></svg>
                ) : entry.status === "failed" ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
                ) : (
                  <Spinner />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{entry.templateName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(entry.timestamp).toLocaleString()} &middot; {entry.destination}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(entry.totalAmount)}</p>
              <p className="text-[10px] text-gray-400">{entry.recordCount} records</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ──

function computeNextRun(frequency: ScheduleConfig["frequency"]): string {
  const next = new Date();
  switch (frequency) {
    case "daily": next.setDate(next.getDate() + 1); break;
    case "weekly": next.setDate(next.getDate() + (7 - next.getDay())); break;
    case "monthly": next.setMonth(next.getMonth() + 1, 1); break;
  }
  return next.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

// ── Icons ──

function CloudIcon({ className = "" }: { className?: string }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 115.7-11.1A5.5 5.5 0 0121 12.5V13a4 4 0 01-3.5 6z" /></svg>;
}

function DownloadIcon() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v8M4 7l4 4 4-4M2 13h12" /></svg>;
}

function EmailIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>;
}

function CheckIcon() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8.5L6.5 12L13 4" /></svg>;
}

function LinkIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>;
}

function HistoryIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
}

function Spinner() {
  return <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}

function TemplateIcon({ type }: { type: string }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "#6b7280", strokeWidth: "1.5", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "receipt":
      return <svg {...props}><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2z" /><path d="M8 10h8M8 14h4" /></svg>;
    case "calendar":
      return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case "chart":
      return <svg {...props}><path d="M18 20V10M12 20V4M6 20v-6" /></svg>;
    case "bolt":
      return <svg {...props}><path d="M13 2L3 14h9l-1 8 10-12h-9z" /></svg>;
    default:
      return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2" /></svg>;
  }
}

function ServiceLogo({ service }: { service: CloudService }) {
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold"
      style={{ backgroundColor: service.color }}
    >
      {service.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
    </div>
  );
}

function QrPlaceholder() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="4" y="4" width="20" height="20" rx="2" stroke="#d1d5db" strokeWidth="2" />
      <rect x="8" y="8" width="12" height="12" rx="1" fill="#d1d5db" />
      <rect x="40" y="4" width="20" height="20" rx="2" stroke="#d1d5db" strokeWidth="2" />
      <rect x="44" y="8" width="12" height="12" rx="1" fill="#d1d5db" />
      <rect x="4" y="40" width="20" height="20" rx="2" stroke="#d1d5db" strokeWidth="2" />
      <rect x="8" y="44" width="12" height="12" rx="1" fill="#d1d5db" />
      <rect x="28" y="28" width="8" height="8" rx="1" fill="#d1d5db" />
      <rect x="40" y="40" width="8" height="8" rx="1" fill="#d1d5db" />
      <rect x="52" y="40" width="8" height="8" rx="1" fill="#d1d5db" />
      <rect x="40" y="52" width="8" height="8" rx="1" fill="#d1d5db" />
      <rect x="52" y="52" width="8" height="8" rx="1" fill="#d1d5db" />
      <rect x="28" y="4" width="4" height="4" rx="1" fill="#d1d5db" />
      <rect x="4" y="28" width="4" height="4" rx="1" fill="#d1d5db" />
      <rect x="28" y="40" width="4" height="4" rx="1" fill="#d1d5db" />
    </svg>
  );
}
