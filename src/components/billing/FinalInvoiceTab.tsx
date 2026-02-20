import { useState } from "react";
import { mockInvoices } from "@/data/mockBillingData";
import { StatusBadge } from "./StatusBadge";
import { Currency } from "./Currency";
import { ITEM_CATEGORIES, type LineItem } from "@/types/billing";
import { Link, Upload, RefreshCw, AlertTriangle, Plus, Trash2, CheckCircle } from "lucide-react";

type Mode = "SYSTEM" | "UPLOAD";
type RefundStep = "idle" | "confirm";

function generateId() {
  return `li-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function calcLineItem(item: LineItem): LineItem {
  const subtotal = item.quantity * item.unitPrice - item.discount;
  const taxAmount = parseFloat(((subtotal * item.taxPercent) / 100).toFixed(2));
  const lineTotal = parseFloat((subtotal + taxAmount).toFixed(2));
  return { ...item, taxAmount, lineTotal };
}

const defaultLineItem = (): LineItem =>
  calcLineItem({
    id: generateId(),
    name: "",
    category: "Surgery",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    taxPercent: 0,
    taxAmount: 0,
    lineTotal: 0,
  });

const ADVANCE_PAID = 100000;
const INTERIM_PAID = 150000;
const TOTAL_PAYMENTS = ADVANCE_PAID + INTERIM_PAID;

export function FinalInvoiceTab() {
  const [mode, setMode] = useState<Mode>("SYSTEM");
  const [refundStep, setRefundStep] = useState<RefundStep>("idle");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  // System mode state
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem()]);

  // Upload mode state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDragOver, setUploadDragOver] = useState(false);
  const [uploadInvoiceNumber, setUploadInvoiceNumber] = useState("");
  const [uploadInvoiceDate, setUploadInvoiceDate] = useState("");
  const [uploadDueDate, setUploadDueDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]
  );
  const [uploadTotalAmount, setUploadTotalAmount] = useState("");

  const finalInvoice = mockInvoices.find((inv) => inv.type === "FINAL");

  // --- Calculations ---
  const systemSubtotal = lineItems.reduce(
    (acc, item) => acc + (item.quantity * item.unitPrice - item.discount),
    0
  );
  const systemTotalTax = lineItems.reduce((acc, item) => acc + item.taxAmount, 0);
  const systemGrossTotal = systemSubtotal + systemTotalTax;

  const uploadedTotal = parseFloat(uploadTotalAmount) || 0;
  const activeGrossTotal = finalInvoice
    ? finalInvoice.grossTotal
    : mode === "SYSTEM"
    ? systemGrossTotal
    : uploadedTotal;

  const netBalance = activeGrossTotal - TOTAL_PAYMENTS;
  const isRefundable = netBalance < 0;
  const isBalanceDue = netBalance > 0;
  const refundableAmount = Math.abs(Math.min(netBalance, 0));

  // --- Helpers ---
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return calcLineItem({ ...item, [field]: value });
      })
    );
  };

  const addItem = () => setLineItems((prev) => [...prev, defaultLineItem()]);

  const removeItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") setUploadFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  // ── Reconciliation summary rows (shared display) ──
  const ReconciliationBox = ({ grossTotal }: { grossTotal: number }) => {
    const net = grossTotal - TOTAL_PAYMENTS;
    const refundable = net < 0;
    return (
      <div className="flex justify-end">
        <div className="w-80 rounded-lg overflow-hidden border border-border">
          <div className="p-4" style={{ background: "hsl(var(--surface-1))" }}>
            <p className="section-label mb-3">Reconciliation Summary</p>
            {[
              { label: "Gross Final Total", value: grossTotal, sign: "" },
              { label: "– Advance Paid", value: ADVANCE_PAID, sign: "–", muted: true },
              { label: "– Interim Paid", value: INTERIM_PAID, sign: "–", muted: true },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className={`flex justify-between text-sm py-1.5 ${
                  i < arr.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                <span className={row.muted ? "text-muted-foreground" : "font-medium text-foreground"}>
                  {row.label}
                </span>
                <span
                  className={`tabular-nums font-medium ${row.muted ? "financial-negative" : ""}`}
                >
                  {row.sign}₹{row.value.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
          <div
            className="px-4 py-3 flex justify-between items-center"
            style={{
              background: refundable
                ? "hsl(var(--status-refundable-bg))"
                : "hsl(var(--status-sent-bg))",
            }}
          >
            <span
              className="font-bold text-sm"
              style={{
                color: refundable
                  ? "hsl(var(--status-refundable-fg))"
                  : "hsl(var(--status-balance-fg))",
              }}
            >
              {refundable ? "Refundable Amount" : "Balance Due"}
            </span>
            <span
              className="tabular-nums font-bold text-base"
              style={{
                color: refundable
                  ? "hsl(var(--status-refundable-fg))"
                  : "hsl(var(--status-balance-fg))",
              }}
            >
              ₹{Math.abs(net).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* ── Existing final invoice view ── */}
      {finalInvoice && (
        <div className="card-base p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <p className="section-label mb-1">Final Invoice · {finalInvoice.mode === "UPLOAD" ? "Uploaded (HIS)" : "System-Generated"}</p>
              <h2 className="text-xl font-bold text-foreground">{finalInvoice.invoiceNumber}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Dated: {new Date(finalInvoice.date).toLocaleDateString("en-IN")} · Due:{" "}
                {new Date(finalInvoice.dueDate).toLocaleDateString("en-IN")}
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
          <div className="mb-5 p-4 rounded-lg border border-border" style={{ background: "hsl(var(--surface-1))" }}>
            <p className="section-label mb-3">Payment Reconciliation Summary</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Advance Paid", value: ADVANCE_PAID },
                { label: "Total Interim Paid", value: INTERIM_PAID },
                { label: "Total Payments Received", value: TOTAL_PAYMENTS },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <Currency amount={item.value} size="md" className="financial-positive" />
                </div>
              ))}
            </div>
          </div>

          {/* Line items (system-generated only) */}
          {finalInvoice.lineItems && finalInvoice.lineItems.length > 0 && (
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
                      <td className="py-2 pr-3 text-right tabular-nums financial-negative">
                        {item.discount > 0 ? `–₹${item.discount.toLocaleString("en-IN")}` : "–"}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">{item.taxPercent}%</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">
                        {item.taxAmount > 0 ? `₹${item.taxAmount.toLocaleString("en-IN")}` : "–"}
                      </td>
                      <td className="py-2 text-right tabular-nums font-semibold">
                        ₹{item.lineTotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end gap-8 mt-3 pt-3 border-t border-border text-sm">
                <span className="text-muted-foreground">
                  Total Tax:{" "}
                  <span className="font-medium text-foreground">
                    ₹{finalInvoice.totalTax.toLocaleString("en-IN")}
                  </span>
                </span>
                <span className="font-bold text-foreground">
                  ₹{finalInvoice.grossTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          {/* Uploaded invoice gross total (HIS mode) */}
          {finalInvoice.mode === "UPLOAD" && !finalInvoice.lineItems?.length && (
            <div className="mb-5 flex items-center justify-between p-4 rounded-lg border border-border" style={{ background: "hsl(var(--surface-1))" }}>
              <div>
                <p className="section-label mb-1">Total Treatment Amount</p>
                <Currency amount={finalInvoice.grossTotal} size="xl" className="text-foreground" />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Upload size={13} />
                <span>HIS Upload · No itemization</span>
              </div>
            </div>
          )}

          <ReconciliationBox grossTotal={finalInvoice.grossTotal} />

          {/* Refund section */}
          {isRefundable && (
            <div
              className="mt-5 p-4 rounded-lg border"
              style={{
                background: "hsl(var(--status-refundable-bg))",
                borderColor: "hsl(var(--status-refundable-fg) / 0.25)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "hsl(var(--status-refundable-fg))" }}>
                    Refund Available
                  </p>
                  <p className="text-xs" style={{ color: "hsl(var(--status-refundable-fg))" }}>
                    Total payments exceed final invoice. Refundable:{" "}
                    <strong>₹{refundableAmount.toLocaleString("en-IN")}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setRefundStep("confirm")}
                  className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 text-white flex-shrink-0 transition-colors hover:opacity-90"
                  style={{ background: "hsl(var(--status-refundable-fg))" }}
                >
                  <RefreshCw size={14} />
                  Process Refund
                </button>
              </div>
            </div>
          )}

          {isBalanceDue && (
            <div
              className="mt-5 p-4 rounded-lg border"
              style={{
                background: "hsl(var(--status-sent-bg))",
                borderColor: "hsl(var(--status-balance-fg) / 0.25)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "hsl(var(--status-balance-fg))" }}>
                    Balance Due
                  </p>
                  <p className="text-xs" style={{ color: "hsl(var(--status-balance-fg))" }}>
                    Net balance of ₹{netBalance.toLocaleString("en-IN")} is outstanding. Payment link sent to patient.
                  </p>
                </div>
                {finalInvoice.razorpayLink && (
                  <a
                    href={finalInvoice.razorpayLink}
                    className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 text-white flex-shrink-0 transition-colors hover:opacity-90"
                    style={{ background: "hsl(var(--status-balance-fg))" }}
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

      {/* ── Refund modal ── */}
      {refundStep === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="card-base p-6 w-full max-w-md mx-4" style={{ boxShadow: "var(--shadow-summary)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="p-2 rounded-lg"
                style={{ background: "hsl(var(--status-refundable-bg))" }}
              >
                <RefreshCw size={18} style={{ color: "hsl(var(--status-refundable-fg))" }} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Process Refund</h3>
                <p className="text-xs text-muted-foreground">
                  Max refundable: ₹{refundableAmount.toLocaleString("en-IN")}
                </p>
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
                <label className="block text-sm font-medium text-foreground mb-2">
                  Refund Reason <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Mandatory: describe the reason for refund..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
              <div
                className="flex items-start gap-2 p-3 rounded-lg border"
                style={{
                  background: "hsl(var(--status-sent-bg))",
                  borderColor: "hsl(var(--status-balance-fg) / 0.3)",
                }}
              >
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--status-balance-fg))" }} />
                <p className="text-xs" style={{ color: "hsl(var(--status-balance-fg))" }}>
                  This will trigger a Razorpay refund, update ledger entries, and generate a refund receipt. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-5 pt-4 border-t border-border">
              <button
                onClick={() => { setRefundStep("idle"); setRefundAmount(""); setRefundReason(""); }}
                className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-surface-1 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!refundReason.trim() || !refundAmount}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "hsl(var(--status-refundable-fg))" }}
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create final invoice (shown only when none exists) ── */}
      {!finalInvoice && (
        <div
          className="card-base p-6"
          style={{ borderColor: "hsl(var(--primary) / 0.2)" }}
        >
          {/* Header + mode toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="font-semibold text-foreground">Create Final Invoice</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Only one final invoice allowed per case.</p>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-border">
              {(["SYSTEM", "UPLOAD"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="px-4 py-1.5 text-sm font-medium transition-colors"
                  style={
                    mode === m
                      ? { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
                      : { color: "hsl(var(--muted-foreground))" }
                  }
                >
                  {m === "SYSTEM" ? "System-Generated" : "Upload (HIS)"}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Reconciliation Summary (read-only, always visible) */}
          <div className="mb-5 p-4 rounded-lg border border-border" style={{ background: "hsl(var(--surface-1))" }}>
            <p className="section-label mb-3">Payment Reconciliation Summary</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Advance Paid", value: ADVANCE_PAID },
                { label: "Total Interim Paid", value: INTERIM_PAID },
                { label: "Total Payments Received", value: TOTAL_PAYMENTS },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                  <Currency amount={item.value} size="md" className="financial-positive" />
                </div>
              ))}
            </div>
          </div>

          {/* ── SYSTEM MODE ── */}
          {mode === "SYSTEM" && (
            <>
              <div className="mb-4">
                <p className="section-label mb-3">Itemized Final Charges</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[820px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-3 section-label w-1/4">Item Name</th>
                        <th className="text-left py-2 pr-3 section-label w-1/6">Category</th>
                        <th className="text-right py-2 pr-3 section-label w-14">Qty</th>
                        <th className="text-right py-2 pr-3 section-label w-24">Unit Price</th>
                        <th className="text-right py-2 pr-3 section-label w-24">Discount</th>
                        <th className="text-right py-2 pr-3 section-label w-14">Tax %</th>
                        <th className="text-right py-2 pr-3 section-label w-24">Tax Amt</th>
                        <th className="text-right py-2 pr-3 section-label w-28">Line Total</th>
                        <th className="py-2 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item) => (
                        <tr key={item.id} className="border-b border-border/50">
                          <td className="py-2 pr-3">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItem(item.id, "name", e.target.value)}
                              placeholder="Item name"
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <select
                              value={item.category}
                              onChange={(e) => updateItem(item.id, "category", e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                              {ITEM_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                              min="1"
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                              min="0"
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                              min="0"
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              value={item.taxPercent}
                              onChange={(e) => updateItem(item.id, "taxPercent", parseFloat(e.target.value) || 0)}
                              min="0"
                              max="100"
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">
                            ₹{item.taxAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums font-semibold">
                            ₹{item.lineTotal.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2">
                            <button
                              onClick={() => removeItem(item.id)}
                              disabled={lineItems.length === 1}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={addItem}
                  className="mt-3 flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  <Plus size={14} />
                  Add Line Item
                </button>
              </div>

              {/* Invoice summary + reconciliation side by side */}
              <div className="flex flex-wrap justify-end gap-4 mt-2">
                <div
                  className="w-72 rounded-lg p-4 border border-border space-y-2"
                  style={{ background: "hsl(var(--surface-1))" }}
                >
                  <p className="section-label mb-3">Invoice Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums font-medium">₹{systemSubtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Tax</span>
                    <span className="tabular-nums font-medium">₹{systemTotalTax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                    <span>Gross Total</span>
                    <span className="tabular-nums" style={{ color: "hsl(var(--primary))" }}>
                      ₹{systemGrossTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-1">
                    <label className="text-muted-foreground">Due Date</label>
                    <input
                      type="date"
                      className="text-sm border border-border rounded px-2 py-0.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      defaultValue={new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <ReconciliationBox grossTotal={systemGrossTotal} />
              </div>
            </>
          )}

          {/* ── UPLOAD (HIS) MODE ── */}
          {mode === "UPLOAD" && (
            <div className="space-y-5">
              {/* Drop zone */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Upload Final Invoice PDF</label>
                <label
                  className="block cursor-pointer"
                  onDragOver={(e) => { e.preventDefault(); setUploadDragOver(true); }}
                  onDragLeave={() => setUploadDragOver(false)}
                  onDrop={handleFileDrop}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
                    style={{
                      borderColor: uploadDragOver
                        ? "hsl(var(--primary))"
                        : uploadFile
                        ? "hsl(var(--status-paid-fg))"
                        : "hsl(var(--border))",
                      background: uploadFile
                        ? "hsl(var(--status-paid-bg))"
                        : "hsl(var(--surface-1))",
                    }}
                  >
                    {uploadFile ? (
                      <>
                        <CheckCircle size={28} className="mx-auto mb-2" style={{ color: "hsl(var(--status-paid-fg))" }} />
                        <p className="text-sm font-medium text-foreground">{uploadFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(uploadFile.size / 1024 / 1024).toFixed(2)} MB · Click to replace
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload size={28} className="mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">
                          Drop PDF here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">PDF only · Max 10MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Invoice Number</label>
                  <input
                    type="text"
                    value={uploadInvoiceNumber}
                    onChange={(e) => setUploadInvoiceNumber(e.target.value)}
                    placeholder="FIN-2024-0891-01"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Total Treatment Amount (₹)</label>
                  <input
                    type="number"
                    value={uploadTotalAmount}
                    onChange={(e) => setUploadTotalAmount(e.target.value)}
                    min="1"
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Invoice Date</label>
                  <input
                    type="date"
                    value={uploadInvoiceDate}
                    onChange={(e) => setUploadInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Due Date</label>
                  <input
                    type="date"
                    value={uploadDueDate}
                    onChange={(e) => setUploadDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Live reconciliation preview (shows as soon as amount is entered) */}
              {uploadedTotal > 0 && (
                <div className="pt-2">
                  <p className="section-label mb-3">Auto-Adjusted Reconciliation</p>
                  <ReconciliationBox grossTotal={uploadedTotal} />
                </div>
              )}

              {/* Info note */}
              <div
                className="flex items-start gap-2 p-3 rounded-lg border"
                style={{
                  background: "hsl(var(--accent))",
                  borderColor: "hsl(var(--primary) / 0.2)",
                }}
              >
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--primary))" }} />
                <p className="text-xs" style={{ color: "hsl(var(--accent-foreground))" }}>
                  The system will auto-calculate the net balance as:{" "}
                  <strong>Total Amount − (Advance + Interim Paid)</strong>. Settlement logic is identical to system mode.
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end mt-6 pt-5 border-t border-border">
            <button className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-surface-1 transition-colors">
              Save as Draft
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors hover:opacity-90 text-white"
              style={{ background: "hsl(var(--primary))" }}
            >
              <Link size={14} />
              {mode === "SYSTEM" ? "Generate & Send Payment Link" : "Submit & Process Settlement"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
