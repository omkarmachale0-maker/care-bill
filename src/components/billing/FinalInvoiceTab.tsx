import { useState } from "react";
import { mockInvoices } from "@/data/mockBillingData";
import { StatusBadge } from "./StatusBadge";
import { Currency } from "./Currency";
import { Link, Upload, RefreshCw, AlertTriangle } from "lucide-react";

type Mode = "SYSTEM" | "UPLOAD";
type RefundStep = "idle" | "confirm";

export function FinalInvoiceTab() {
  const [mode, setMode] = useState<Mode>("SYSTEM");
  const [refundStep, setRefundStep] = useState<RefundStep>("idle");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const finalInvoice = mockInvoices.find((inv) => inv.type === "FINAL");

  const advancePaid = 100000;
  const interimPaid = 150000;
  const totalPaymentsReceived = advancePaid + interimPaid;
  const grossFinalTotal = finalInvoice?.grossTotal ?? 0;
  const netBalance = grossFinalTotal - totalPaymentsReceived;
  const isRefundable = netBalance < 0;
  const isBalanceDue = netBalance > 0;
  const refundableAmount = Math.abs(Math.min(netBalance, 0));

  const reconciliationRows = [
    { label: "Gross Final Total", value: grossFinalTotal, bold: true },
    { label: "– Advance Paid", value: -advancePaid, negative: true },
    { label: "– Interim Paid", value: -interimPaid, negative: true },
  ];

  return (
    <div className="space-y-6">
      {/* Existing final invoice */}
      {finalInvoice && (
        <div className="card-base p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <p className="section-label mb-1">Final Invoice</p>
              <h2 className="text-xl font-bold text-foreground">{finalInvoice.invoiceNumber}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Dated: {new Date(finalInvoice.date).toLocaleDateString("en-IN")} · Due: {new Date(finalInvoice.dueDate).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={finalInvoice.status} />
              {finalInvoice.razorpayLink && (
                <a
                  href={finalInvoice.razorpayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md text-primary border border-primary hover:bg-accent transition-colors"
                >
                  <Link size={11} />
                  Pay Balance Due
                </a>
              )}
            </div>
          </div>

          {/* Payment Reconciliation Summary */}
          <div className="mb-5 p-4 bg-surface-1 rounded-lg border border-border">
            <p className="section-label mb-3">Payment Reconciliation Summary</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Advance Paid", value: advancePaid },
                { label: "Total Interim Paid", value: interimPaid },
                { label: "Total Payments Received", value: totalPaymentsReceived },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <Currency amount={item.value} size="md" className="text-emerald-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Line items */}
          {finalInvoice.lineItems && (
            <div className="overflow-x-auto mb-5">
              <p className="section-label mb-3">Itemized Final Charges</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 section-label">Item</th>
                    <th className="text-left py-2 pr-3 section-label">Category</th>
                    <th className="text-right py-2 pr-3 section-label">Qty</th>
                    <th className="text-right py-2 pr-3 section-label">Unit Price</th>
                    <th className="text-right py-2 pr-3 section-label">Discount</th>
                    <th className="text-right py-2 pr-3 section-label">Tax %</th>
                    <th className="text-right py-2 pr-3 section-label">Tax Amt</th>
                    <th className="text-right py-2 section-label">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {finalInvoice.lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="py-2 pr-3 font-medium">{item.name}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{item.category}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{item.quantity}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-destructive">
                        {item.discount > 0 ? `–₹${item.discount.toLocaleString("en-IN")}` : "–"}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">{item.taxPercent}%</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">
                        {item.taxAmount > 0 ? `₹${item.taxAmount.toLocaleString("en-IN")}` : "–"}
                      </td>
                      <td className="py-2 text-right tabular-nums font-semibold">₹{item.lineTotal.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reconciliation box */}
          <div className="flex justify-end">
            <div className="w-80 rounded-lg overflow-hidden border border-border">
              <div className="p-4 bg-surface-1">
                <p className="section-label mb-3">Reconciliation Summary</p>
                {reconciliationRows.map((row, i) => (
                  <div key={i} className={`flex justify-between text-sm py-1.5 ${i < reconciliationRows.length - 1 ? "border-b border-border/50" : ""}`}>
                    <span className={row.negative ? "text-muted-foreground" : "text-foreground font-medium"}>{row.label}</span>
                    <span className={`tabular-nums font-medium ${row.negative ? "text-destructive" : ""}`}>
                      {row.negative ? "" : ""}₹{Math.abs(row.value).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
              <div className={`px-4 py-3 flex justify-between items-center ${isRefundable ? "bg-purple-50" : "bg-amber-50"}`}>
                <span className={`font-bold text-sm ${isRefundable ? "text-purple-700" : "text-amber-700"}`}>
                  {isRefundable ? "Refundable Amount" : "Balance Due"}
                </span>
                <span className={`tabular-nums font-bold text-base ${isRefundable ? "text-purple-700" : "text-amber-700"}`}>
                  ₹{Math.abs(netBalance).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Refund section */}
          {isRefundable && (
            <div className="mt-5 p-4 border border-purple-200 rounded-lg bg-purple-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-purple-800 mb-1">Refund Available</p>
                  <p className="text-xs text-purple-600">
                    Total payments exceed final invoice. Refundable: <strong>₹{refundableAmount.toLocaleString("en-IN")}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setRefundStep("confirm")}
                  className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors flex-shrink-0"
                >
                  <RefreshCw size={14} />
                  Process Refund
                </button>
              </div>
            </div>
          )}

          {isBalanceDue && (
            <div className="mt-5 p-4 border border-amber-200 rounded-lg bg-amber-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">Balance Due</p>
                  <p className="text-xs text-amber-600">
                    Net balance of ₹{netBalance.toLocaleString("en-IN")} is outstanding. Payment link has been sent to patient.
                  </p>
                </div>
                {finalInvoice.razorpayLink && (
                  <a
                    href={finalInvoice.razorpayLink}
                    className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 bg-amber-600 text-white hover:bg-amber-700 transition-colors flex-shrink-0"
                  >
                    <Link size={14} />
                    View Payment Link
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Refund modal overlay */}
      {refundStep === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="card-base p-6 w-full max-w-md mx-4 shadow-summary">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-purple-100">
                <RefreshCw size={18} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Process Refund</h3>
                <p className="text-xs text-muted-foreground">Max refundable: ₹{refundableAmount.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Refund Amount (₹)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={refundableAmount}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Refund Reason <span className="text-destructive">*</span></label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Mandatory: describe the reason for refund..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  This will trigger a Razorpay refund, update ledger entries, and generate a refund receipt. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-5 pt-4 border-t border-border">
              <button
                onClick={() => setRefundStep("idle")}
                className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-surface-1 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!refundReason.trim() || !refundAmount}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No final invoice — create form */}
      {!finalInvoice && (
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground">Create Final Invoice</h3>
            <div className="flex rounded-lg overflow-hidden border border-border">
              {(["SYSTEM", "UPLOAD"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="px-4 py-1.5 text-sm font-medium transition-colors"
                  style={
                    mode === m
                      ? { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
                      : {}
                  }
                >
                  {m === "SYSTEM" ? "System-Generated" : "Upload"}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Only one final invoice can be created per case.</p>
        </div>
      )}
    </div>
  );
}
