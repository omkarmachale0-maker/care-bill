import { usePayments, useEscrowSummary, useReceipts } from "@/hooks/useBillingData";
import { Currency } from "./Currency";
import { StatusBadge } from "./StatusBadge";
import { BillingSkeleton } from "./BillingSkeleton";
import { Download, CheckCircle2, Upload, CreditCard } from "lucide-react";

interface PaymentsRefundsTabProps {
  caseId: string;
}

export function PaymentsRefundsTab({ caseId }: PaymentsRefundsTabProps) {
  const { data: payments, isLoading: paymentsLoading } = usePayments(caseId);
  const { data: escrowSummary, isLoading: escrowLoading } = useEscrowSummary(caseId);
  const { data: receipts, isLoading: receiptsLoading } = useReceipts(caseId);

  if (paymentsLoading || escrowLoading || receiptsLoading) return <BillingSkeleton rows={3} />;

  return (
    <div className="space-y-6">
      {/* Payment history */}
      <div className="card-base p-6">
        <h3 className="font-semibold text-foreground mb-5">Payment History</h3>
        <div className="space-y-4">
          {(payments ?? []).map((pay) => (
            <div key={pay.id} className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-teal-50">
                      <CreditCard size={14} className="text-primary" />
                    </div>
                    <p className="font-semibold text-foreground">{pay.description}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(pay.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {pay.reference}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Currency amount={pay.amount} size="lg" className="text-emerald-600" />
                  <StatusBadge status={pay.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
                {[
                  { label: "Method", value: pay.method },
                  { label: "Invoice Ref", value: pay.invoiceRef },
                  { label: "Gateway Fee", value: `₹${pay.gatewayFee.toLocaleString("en-IN")}` },
                  { label: "Platform Fee", value: `₹${pay.platformFee.toLocaleString("en-IN")}` },
                ].map((d) => (
                  <div key={d.label}>
                    <p className="text-xs text-muted-foreground">{d.label}</p>
                    <p className="text-sm font-medium text-foreground">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escrow summary */}
      <div className="card-base p-6">
        <h3 className="font-semibold text-foreground mb-5">Escrow Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(escrowSummary ?? []).map((item) => (
            <div key={item.label} className="bg-surface-1 rounded-lg p-4 border border-border">
              <p className="section-label mb-2">{item.label}</p>
              <Currency
                amount={item.value}
                size="md"
                className={item.positive ? "text-emerald-600" : item.negative ? "text-destructive" : "text-foreground"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Receipts */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground">Receipts</h3>
          <button className="flex items-center gap-1.5 text-sm text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">
            <Upload size={13} />
            Upload Hospital Receipt
          </button>
        </div>
        <div className="space-y-3">
          {(receipts ?? []).map((receipt) => (
            <div key={receipt.id} className="flex items-center justify-between p-4 bg-surface-1 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-50">
                  <CheckCircle2 size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{receipt.receiptNumber}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(receipt.date).toLocaleDateString("en-IN")} · {receipt.type === "SYSTEM" ? "System Receipt" : "Hospital Upload"} · {receipt.gatewayRef}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Currency amount={receipt.amount} size="md" className="text-emerald-600" />
                <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Download size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refunds section */}
      <div className="card-base p-6">
        <h3 className="font-semibold text-foreground mb-3">Refunds</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-3 rounded-full bg-surface-2 mb-3">
            <CheckCircle2 size={24} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No refunds processed</p>
          <p className="text-xs text-muted-foreground mt-1">Refunds will appear here once the final invoice is settled</p>
        </div>
      </div>
    </div>
  );
}
