import { Link } from "react-router-dom";
import type { PatientCase } from "@/types/billing";
import type { ComputedFinancials } from "@/services/billingApi";
import { Currency } from "./Currency";
import { StatusBadge } from "./StatusBadge";
import { BillingSkeleton } from "./BillingSkeleton";
import { useInvoices, useReceipts } from "@/hooks/useBillingData";
import { FileText, CreditCard, CheckCircle2, Clock, ExternalLink, AlertTriangle } from "lucide-react";

interface OverviewTabProps {
  caseId: string;
  patientCase: PatientCase;
  financials: ComputedFinancials;
}

export function OverviewTab({ caseId, patientCase, financials }: OverviewTabProps) {
  const { data: invoices, isLoading: invoicesLoading } = useInvoices(caseId);
  const { data: receipts, isLoading: receiptsLoading } = useReceipts(caseId);

  if (invoicesLoading || receiptsLoading) return <BillingSkeleton rows={3} />;

  const recentInvoices = (invoices ?? []).slice(0, 3);
  const recentReceipts = (receipts ?? []).slice(0, 3);

  const progress = Math.min(financials.progressPercent, 100);

  const statCards = [
    {
      label: "Total Quotation",
      value: financials.quotationTotal,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-teal-50",
      badge: null as string | null,
    },
    {
      label: "Total Received",
      value: financials.totalReceived,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      badge: null,
    },
    {
      label: "Outstanding",
      value: financials.outstanding,
      icon: Clock,
      color: financials.isFullyPaid ? "text-emerald-600" : "text-amber-600",
      bgColor: financials.isFullyPaid ? "bg-emerald-50" : "bg-amber-50",
      badge: financials.isFullyPaid ? "Fully Paid" : financials.outstanding > 0 ? "Due" : null,
    },
    {
      label: "Final Invoice",
      value: financials.finalInvoiceAmount ?? 0,
      icon: CreditCard,
      color: "text-primary",
      bgColor: "bg-teal-50",
      badge: financials.finalInvoiceAmount === null ? "Not Generated" : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overpayment warning */}
      {financials.isOverpaid && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg border" style={{ background: "hsl(var(--status-sent-bg))", borderColor: "hsl(var(--status-sent-fg) / 0.3)" }}>
          <AlertTriangle size={14} style={{ color: "hsl(var(--status-sent-fg))" }} />
          <p className="text-sm" style={{ color: "hsl(var(--status-sent-fg))" }}>
            <strong>Overpayment detected.</strong> Total received exceeds the quotation amount.
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card-base p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <span className="section-label">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={16} className={stat.color} />
              </div>
            </div>
            {stat.badge === "Not Generated" ? (
              <p className="text-sm font-medium text-muted-foreground">Not Generated</p>
            ) : (
              <Currency amount={stat.value} size="lg" className={stat.color} />
            )}
            {stat.badge && stat.badge !== "Not Generated" && (
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                stat.badge === "Fully Paid" ? "status-paid" : "status-sent"
              }`}>
                {stat.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Payment progress */}
      <div className="card-base p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-foreground">Payment Progress</h3>
          <span className="text-sm text-muted-foreground tabular-nums">{progress.toFixed(1)}% collected</span>
        </div>
        <div className="w-full bg-surface-2 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: financials.isOverpaid
                ? "hsl(var(--status-sent-fg))"
                : "linear-gradient(90deg, hsl(var(--primary)), hsl(199 89% 55%))",
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(financials.totalReceived)} received
          </span>
          <span>
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(financials.quotationTotal)} total
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case details */}
        <div className="card-base p-6">
          <h3 className="font-semibold text-foreground mb-4">Case Details</h3>
          <dl className="space-y-3">
            {[
              { label: "Patient Name", value: patientCase.patientName },
              { label: "UHID", value: patientCase.uhid },
              { label: "Patient ID", value: patientCase.patientId },
              { label: "Ward / Room", value: patientCase.ward },
              { label: "Consultant", value: patientCase.consultant },
              { label: "Insurance", value: patientCase.insuranceProvider ?? "Self Pay" },
              { label: "Admission Date", value: new Date(patientCase.admissionDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
              { label: "Expected Discharge", value: new Date(patientCase.expectedDischarge).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-start gap-2 py-1 border-b border-border last:border-0">
                <dt className="text-sm text-muted-foreground flex-shrink-0">{item.label}</dt>
                <dd className="text-sm font-medium text-foreground text-right">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Recent invoices & receipts */}
        <div className="card-base p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Invoices</h3>
          <div className="space-y-3">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-surface-1 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">{inv.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {inv.type} · {new Date(inv.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Currency amount={inv.grossTotal} size="sm" />
                    <StatusBadge status={inv.status} />
                  </div>
                  <Link
                    to={`/pay/${inv.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: "hsl(var(--primary))" }}
                  >
                    Patient View <ExternalLink size={10} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3">Recent Receipts</h4>
            {recentReceipts.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.receiptNumber}</p>
                  <p className="text-xs text-muted-foreground">{r.gatewayRef}</p>
                </div>
                <Currency amount={r.amount} size="sm" className="financial-positive" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
