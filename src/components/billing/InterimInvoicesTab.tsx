import { useState } from "react";
import { mockInvoices } from "@/data/mockBillingData";
import { StatusBadge } from "./StatusBadge";
import { Currency } from "./Currency";
import { ITEM_CATEGORIES, type LineItem } from "@/types/billing";
import { Plus, Trash2, Link, Upload, ChevronDown, CheckCircle } from "lucide-react";

function generateId() {
  return `li-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function calcLineItem(item: LineItem): LineItem {
  const subtotal = item.quantity * item.unitPrice - item.discount;
  const taxAmount = parseFloat(((subtotal * item.taxPercent) / 100).toFixed(2));
  const lineTotal = parseFloat((subtotal + taxAmount).toFixed(2));
  return { ...item, taxAmount, lineTotal };
}

type Mode = "SYSTEM" | "UPLOAD";

export function InterimInvoicesTab() {
  const [mode, setMode] = useState<Mode>("SYSTEM");
  const [showCreate, setShowCreate] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    calcLineItem({
      id: generateId(),
      name: "",
      category: "Consultation",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxPercent: 5,
      taxAmount: 0,
      lineTotal: 0,
    }),
  ]);

  // Existing interim invoices
  const existingInterims = mockInvoices.filter((inv) => inv.type === "INTERIM");

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        return calcLineItem(updated);
      })
    );
  };

  const addItem = () => {
    setLineItems((prev) => [
      ...prev,
      calcLineItem({
        id: generateId(),
        name: "",
        category: "Consultation",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxPercent: 5,
        taxAmount: 0,
        lineTotal: 0,
      }),
    ]);
  };

  const removeItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice - item.discount), 0);
  const totalTax = lineItems.reduce((acc, item) => acc + item.taxAmount, 0);
  const grossTotal = subtotal + totalTax;

  const caseFinancialSummary = [
    { label: "Quotation Total", value: 480000 },
    { label: "Advance Paid", value: 100000 },
    { label: "Interim Raised", value: 150000 },
    { label: "Interim Paid", value: 150000 },
    { label: "Outstanding", value: 212000 },
  ];

  return (
    <div className="space-y-6">
      {/* Existing interim invoices */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-foreground">Interim Invoices</h3>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            <Plus size={15} />
            New Interim Invoice
          </button>
        </div>

        <div className="space-y-3">
          {existingInterims.map((inv) => (
            <div key={inv.id} className="card-base p-5 card-hover">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">{inv.invoiceNumber}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dated: {new Date(inv.date).toLocaleDateString("en-IN")} · Due: {new Date(inv.dueDate).toLocaleDateString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {inv.mode === "SYSTEM" ? "System-Generated · Itemized" : "Uploaded Invoice"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Currency amount={inv.grossTotal} size="lg" />
                  {inv.status === "PAID" && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle size={12} />
                      Payment Received
                    </div>
                  )}
                  {inv.razorpayLink && (
                    <a
                      href={inv.razorpayLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-primary text-primary hover:bg-accent transition-colors"
                    >
                      <Link size={11} />
                      Payment Link
                    </a>
                  )}
                </div>
              </div>

              {inv.lineItems && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="text-left pb-2 pr-3">Item</th>
                          <th className="text-left pb-2 pr-3">Category</th>
                          <th className="text-right pb-2 pr-3">Qty</th>
                          <th className="text-right pb-2 pr-3">Unit Price</th>
                          <th className="text-right pb-2 pr-3">Tax</th>
                          <th className="text-right pb-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inv.lineItems.map((item) => (
                          <tr key={item.id} className="border-t border-border/50">
                            <td className="py-1.5 pr-3 font-medium">{item.name}</td>
                            <td className="py-1.5 pr-3 text-muted-foreground">{item.category}</td>
                            <td className="py-1.5 pr-3 text-right tabular-nums">{item.quantity}</td>
                            <td className="py-1.5 pr-3 text-right tabular-nums">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                            <td className="py-1.5 pr-3 text-right tabular-nums">{item.taxPercent}%</td>
                            <td className="py-1.5 text-right tabular-nums font-semibold">₹{item.lineTotal.toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end gap-8 mt-3 pt-3 border-t border-border text-sm">
                    <span className="text-muted-foreground">Total Tax: <span className="font-medium text-foreground">₹{inv.totalTax.toLocaleString("en-IN")}</span></span>
                    <span className="font-bold text-foreground">₹{inv.grossTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create new interim */}
      {showCreate && (
        <div className="card-base p-6 border-primary/20" style={{ borderColor: "hsl(var(--primary) / 0.2)" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground">Create New Interim Invoice</h3>
            {/* Mode toggle */}
            <div className="flex rounded-lg overflow-hidden border border-border">
              <button
                onClick={() => setMode("SYSTEM")}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  mode === "SYSTEM"
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground bg-background"
                }`}
                style={mode === "SYSTEM" ? { background: "hsl(var(--primary))" } : {}}
              >
                System-Generated
              </button>
              <button
                onClick={() => setMode("UPLOAD")}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  mode === "UPLOAD"
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground bg-background"
                }`}
                style={mode === "UPLOAD" ? { background: "hsl(var(--primary))" } : {}}
              >
                Upload (HIS)
              </button>
            </div>
          </div>

          {/* Case financial summary (read-only) */}
          <div className="mb-5 p-4 bg-surface-1 rounded-lg border border-border">
            <p className="section-label mb-3">Case Financial Summary</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {caseFinancialSummary.map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold tabular-nums">₹{item.value.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </div>

          {mode === "SYSTEM" ? (
            <>
              {/* Itemized billing grid */}
              <div className="mb-4">
                <p className="section-label mb-3">Itemized Billing</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[800px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-3 section-label w-1/4">Item Name</th>
                        <th className="text-left py-2 pr-3 section-label w-1/6">Category</th>
                        <th className="text-right py-2 pr-3 section-label w-16">Qty</th>
                        <th className="text-right py-2 pr-3 section-label w-24">Unit Price</th>
                        <th className="text-right py-2 pr-3 section-label w-24">Discount</th>
                        <th className="text-right py-2 pr-3 section-label w-16">Tax %</th>
                        <th className="text-right py-2 pr-3 section-label w-24">Tax Amt</th>
                        <th className="text-right py-2 pr-3 section-label w-28">Line Total</th>
                        <th className="py-2 w-8"></th>
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
                              min="0"
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
                          <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground text-sm">
                            ₹{item.taxAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 pr-3 text-right tabular-nums font-semibold text-sm">
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
                  className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <Plus size={14} />
                  Add Line Item
                </button>
              </div>

              {/* Invoice summary */}
              <div className="flex justify-end">
                <div className="w-72 bg-surface-1 rounded-lg p-4 border border-border space-y-2">
                  <p className="section-label mb-3">Invoice Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Tax</span>
                    <span className="tabular-nums font-medium">₹{totalTax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                    <span>Gross Total</span>
                    <span className="tabular-nums" style={{ color: "hsl(var(--primary))" }}>
                      ₹{grossTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-1">
                    <label className="text-muted-foreground">Due Date</label>
                    <input
                      type="date"
                      className="text-sm border border-border rounded px-2 py-0.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      defaultValue={new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Upload mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Upload zone */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Upload Invoice PDF</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-surface-1 hover:border-primary/40 transition-colors cursor-pointer">
                  <Upload size={28} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Drop PDF here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF only · Max 10MB</p>
                </div>
              </div>
              {[
                { label: "Invoice Number", type: "text", placeholder: "INT-2024-0891-02" },
                { label: "Invoice Date", type: "date" },
                { label: "Due Date", type: "date" },
                { label: "Amount (₹)", type: "number", placeholder: "0.00" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-sm font-medium text-foreground mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end mt-6 pt-5 border-t border-border">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-surface-1 transition-colors"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              Save as Draft
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              <Link size={14} />
              Generate &amp; Send Payment Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
