import { useState } from "react";
import { useLedgerEntries, useLedgerBalances, useAuditLogs } from "@/hooks/useBillingData";
import { BillingSkeleton } from "./BillingSkeleton";
import { ArrowUpRight, ArrowDownLeft, Shield, Download } from "lucide-react";

const LEDGER_NAMES = [
  "All",
  "Escrow Ledger",
  "Hospital Payable",
  "Gateway Expense",
  "Revenue Ledger",
  "Refund Liability Ledger",
];

interface LedgerAuditTabProps {
  caseId: string;
}

export function LedgerAuditTab({ caseId }: LedgerAuditTabProps) {
  const [activeLedger, setActiveLedger] = useState("All");
  const { data: ledgerEntries, isLoading: ledgerLoading } = useLedgerEntries(caseId, activeLedger);
  const { data: ledgerBalances, isLoading: balancesLoading } = useLedgerBalances(caseId);
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs(caseId);

  if (ledgerLoading || balancesLoading || auditLoading) return <BillingSkeleton rows={4} />;

  const handleExportCSV = () => {
    if (!ledgerEntries?.length) return;
    const headers = ["Date", "Description", "Ledger", "Debit", "Credit", "Balance", "Reference"];
    const rows = ledgerEntries.map((e) => [e.date, e.description, e.ledger, e.debit, e.credit, e.balance, e.reference]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-${caseId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Ledger engine */}
      <div className="card-base p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h3 className="font-semibold text-foreground">Ledger Engine</h3>
          <div className="flex items-center gap-2">
            <div className="flex gap-2 flex-wrap">
              {LEDGER_NAMES.map((name) => (
                <button
                  key={name}
                  onClick={() => setActiveLedger(name)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    activeLedger === name
                      ? "border-primary text-primary bg-teal-50"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-primary text-primary hover:bg-accent transition-colors"
            >
              <Download size={12} />
              CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 section-label">Date & Time</th>
                <th className="text-left py-3 pr-4 section-label">Description</th>
                <th className="text-left py-3 pr-4 section-label">Ledger</th>
                <th className="text-right py-3 pr-4 section-label">Debit</th>
                <th className="text-right py-3 pr-4 section-label">Credit</th>
                <th className="text-right py-3 pr-4 section-label">Balance</th>
                <th className="text-left py-3 section-label">Reference</th>
              </tr>
            </thead>
            <tbody>
              {(ledgerEntries ?? []).map((entry) => (
                <tr key={entry.id} className="border-b border-border/60 hover:bg-surface-1 transition-colors">
                  <td className="py-3 pr-4 text-muted-foreground text-xs whitespace-nowrap">{entry.date}</td>
                  <td className="py-3 pr-4 text-foreground">{entry.description}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-primary border border-teal-100">
                      {entry.ledger}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {entry.debit > 0 ? (
                      <span className="flex items-center justify-end gap-1 font-medium text-foreground">
                        <ArrowUpRight size={12} className="text-destructive" />
                        ₹{entry.debit.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">–</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {entry.credit > 0 ? (
                      <span className="flex items-center justify-end gap-1 font-medium text-emerald-600">
                        <ArrowDownLeft size={12} />
                        ₹{entry.credit.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">–</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums font-semibold text-foreground">
                    ₹{entry.balance.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 text-xs text-muted-foreground font-mono">{entry.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ledger balances summary */}
        <div className="mt-5 pt-5 border-t border-border grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(ledgerBalances ?? []).map((item) => (
            <div key={item.label} className="bg-surface-1 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className="text-sm font-bold tabular-nums text-foreground">₹{item.value.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Audit log */}
      <div className="card-base p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-lg bg-teal-50">
            <Shield size={16} className="text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Audit Log</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 section-label">Timestamp</th>
                <th className="text-left py-3 pr-4 section-label">User / Role</th>
                <th className="text-left py-3 pr-4 section-label">Action</th>
                <th className="text-left py-3 pr-4 section-label">Entity</th>
                <th className="text-left py-3 pr-4 section-label">Details</th>
                <th className="text-left py-3 section-label">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {(auditLogs ?? []).map((log) => (
                <tr key={log.id} className="border-b border-border/60 hover:bg-surface-1 transition-colors">
                  <td className="py-3 pr-4 text-muted-foreground text-xs whitespace-nowrap font-mono">{log.timestamp}</td>
                  <td className="py-3 pr-4">
                    <p className="text-xs font-medium text-foreground">{log.user}</p>
                    <p className="text-xs text-muted-foreground">{log.role}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-medium bg-surface-2 text-foreground border border-border">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-foreground">{log.entity}</td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground max-w-xs">{log.details}</td>
                  <td className="py-3 text-xs text-muted-foreground font-mono">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
