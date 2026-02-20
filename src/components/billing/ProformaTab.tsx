import { mockInvoices } from "@/data/mockBillingData";
import { StatusBadge } from "./StatusBadge";
import { Currency } from "./Currency";
import { Eye, Lock } from "lucide-react";

export function ProformaTab() {
  const proforma = mockInvoices.find((inv) => inv.type === "PROFORMA");
  if (!proforma) return null;

  const subtotalCalc = (proforma.lineItems ?? []).reduce((acc, item) => acc + (item.quantity * item.unitPrice - item.discount), 0);

  return (
    <div className="space-y-6">
      {/* Read-only notice */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-teal-50 border border-teal-100 rounded-lg">
        <Lock size={14} className="text-primary flex-shrink-0" />
        <p className="text-sm text-primary">
          Proforma (Advance) invoice is <strong>read-only</strong>. This represents the initial quotation summary sent to the patient before treatment.
        </p>
      </div>

      {/* Invoice header */}
      <div className="card-base p-6">
        <div className="flex flex-wrap gap-4 justify-between items-start mb-6">
          <div>
            <p className="section-label mb-1">Proforma Invoice</p>
            <h2 className="text-xl font-bold text-foreground">{proforma.invoiceNumber}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Dated: {new Date(proforma.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <StatusBadge status={proforma.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Invoice Date", value: new Date(proforma.date).toLocaleDateString("en-IN") },
            { label: "Due Date", value: new Date(proforma.dueDate).toLocaleDateString("en-IN") },
            { label: "Mode", value: proforma.mode === "SYSTEM" ? "System-Generated" : "Uploaded" },
            { label: "Type", value: "Proforma / Advance" },
          ].map((item) => (
            <div key={item.label} className="bg-surface-1 rounded-lg p-3">
              <p className="section-label mb-1">{item.label}</p>
              <p className="text-sm font-medium text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Line items table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 section-label">Item</th>
                <th className="text-left py-3 pr-4 section-label">Category</th>
                <th className="text-right py-3 pr-4 section-label">Qty</th>
                <th className="text-right py-3 pr-4 section-label">Unit Price</th>
                <th className="text-right py-3 pr-4 section-label">Discount</th>
                <th className="text-right py-3 pr-4 section-label">Tax %</th>
                <th className="text-right py-3 pr-4 section-label">Tax Amt</th>
                <th className="text-right py-3 section-label">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {(proforma.lineItems ?? []).map((item) => (
                <tr key={item.id} className="border-b border-border/60 hover:bg-surface-1 transition-colors">
                  <td className="py-3 pr-4 font-medium text-foreground">{item.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{item.category}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{item.quantity}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    ₹{item.unitPrice.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-red-500">
                    {item.discount > 0 ? `–₹${item.discount.toLocaleString("en-IN")}` : "–"}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">{item.taxPercent}%</td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {item.taxAmount > 0 ? `₹${item.taxAmount.toLocaleString("en-IN")}` : "–"}
                  </td>
                  <td className="py-3 text-right tabular-nums font-semibold text-foreground">
                    ₹{item.lineTotal.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums font-medium">₹{subtotalCalc.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Tax</span>
              <span className="tabular-nums font-medium">₹{proforma.totalTax.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
              <span>Gross Total</span>
              <Currency amount={proforma.grossTotal} size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Read-only summary */}
      <div className="card-base p-6">
        <h3 className="font-semibold text-foreground mb-4">Advance Collection Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Quotation Total", value: 480000, neutral: true },
            { label: "Advance Requested", value: 100000, neutral: true },
            { label: "Advance Paid", value: 100000, positive: true },
          ].map((item) => (
            <div key={item.label} className="bg-surface-1 rounded-lg p-4 border border-border">
              <p className="section-label mb-2">{item.label}</p>
              <Currency
                amount={item.value}
                size="lg"
                className={item.positive ? "text-emerald-600" : "text-foreground"}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
