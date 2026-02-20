import { useParams, Link } from "react-router-dom";
import { mockInvoices, mockPatientCase, mockReceipts } from "@/data/mockBillingData";
import { Currency } from "@/components/billing/Currency";
import { StatusBadge } from "@/components/billing/StatusBadge";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Download,
  ExternalLink,
  Shield,
  Building2,
  User,
  Calendar,
  FileText,
  CreditCard,
  RefreshCw,
} from "lucide-react";

function PaymentStatusIllustration({ status }: { status: string }) {
  if (status === "PAID") {
    return (
      <div className="flex flex-col items-center py-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: "hsl(var(--status-paid-bg))" }}
        >
          <CheckCircle2 size={40} style={{ color: "hsl(var(--status-paid-fg))" }} />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">Payment Received</h2>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          Your payment has been successfully processed. A receipt has been sent to your registered contact.
        </p>
      </div>
    );
  }
  if (status === "OVERDUE") {
    return (
      <div className="flex flex-col items-center py-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: "hsl(var(--status-overdue-bg))" }}
        >
          <AlertTriangle size={40} style={{ color: "hsl(var(--status-overdue-fg))" }} />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">Payment Overdue</h2>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          This invoice is past its due date. Please make the payment immediately to avoid further delays.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center py-8">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ background: "hsl(var(--status-sent-bg))" }}
      >
        <Clock size={40} style={{ color: "hsl(var(--status-sent-fg))" }} />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-1">Payment Pending</h2>
      <p className="text-muted-foreground text-sm text-center max-w-xs">
        Your invoice is ready. Please complete the payment before the due date.
      </p>
    </div>
  );
}

export default function PaymentPortal() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const invoice = mockInvoices.find((inv) => inv.id === invoiceId);

  // --- Not found state ---
  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--surface-1))" }}>
        <div className="card-base p-10 max-w-md w-full mx-4 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "hsl(var(--status-overdue-bg))" }}
          >
            <FileText size={30} style={{ color: "hsl(var(--status-overdue-fg))" }} />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Invoice Not Found</h2>
          <p className="text-muted-foreground text-sm mb-6">
            The invoice <strong>{invoiceId}</strong> could not be found or may have expired.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "hsl(var(--primary))" }}
          >
            <ArrowLeft size={14} /> Back to Billing
          </Link>
        </div>
      </div>
    );
  }

  const receipts = mockReceipts.filter((r) => r.invoiceId === invoice.id);
  const isPaid = invoice.status === "PAID";
  const isPayable = ["SENT", "BALANCE_DUE", "OVERDUE", "PARTIALLY_PAID"].includes(invoice.status);
  const isDue = invoice.dueDate ? new Date(invoice.dueDate) < new Date() && !isPaid : false;

  const formattedDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "hsl(var(--surface-1))" }}>
      {/* ── Header bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-20 border-b"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "hsl(var(--primary))" }}
            >
              <Building2 size={14} className="text-white" />
            </div>
            <span className="font-semibold text-foreground text-sm">MedBill Portal</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(var(--status-paid-fg))" }}>
            <Shield size={13} />
            <span className="font-medium">256-bit encrypted</span>
          </div>
        </div>
      </header>

      {/* ── Page body ── */}
      <div className="max-w-3xl mx-auto mt-16 space-y-5">

        {/* Back link (billing admin only context) */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} /> Back to Admin Billing
        </Link>

        {/* ── Patient identity card ── */}
        <div className="card-base overflow-hidden">
          {/* Teal accent strip */}
          <div className="h-1.5 w-full" style={{ background: "hsl(var(--primary))" }} />

          <div className="p-6">
            {/* Status illustration */}
            <PaymentStatusIllustration status={invoice.status} />

            <div
              className="h-px w-full my-4"
              style={{ background: "hsl(var(--border))" }}
            />

            {/* Invoice meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Invoice No.", value: invoice.invoiceNumber, icon: FileText },
                { label: "Patient", value: mockPatientCase.patientName, icon: User },
                { label: "UHID", value: mockPatientCase.uhid, icon: User },
                { label: "Case No.", value: mockPatientCase.caseNumber, icon: FileText },
                { label: "Invoice Date", value: formattedDate(invoice.date), icon: Calendar },
                { label: "Due Date", value: formattedDate(invoice.dueDate), icon: Calendar },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="section-label">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} className="text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground">{value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Overdue banner */}
            {isDue && !isPaid && (
              <div
                className="mt-5 flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium"
                style={{
                  background: "hsl(var(--status-overdue-bg))",
                  color: "hsl(var(--status-overdue-fg))",
                }}
              >
                <AlertTriangle size={16} />
                <span>This invoice was due on {formattedDate(invoice.dueDate)}. Please pay immediately.</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Line items breakdown ── */}
        {invoice.lineItems && invoice.lineItems.length > 0 && (
          <div className="card-base">
            <div className="px-6 pt-5 pb-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
              <h3 className="font-semibold text-foreground text-sm">Charges Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "hsl(var(--surface-1))" }}>
                    {["Description", "Category", "Qty", "Unit Price", "Discount", "Tax", "Total"].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2.5 text-left first:pl-6 last:pr-6 last:text-right"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        <span className="section-label">{col}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="border-t"
                      style={{
                        borderColor: "hsl(var(--border))",
                        background: idx % 2 === 1 ? "hsl(var(--surface-1))" : "hsl(var(--card))",
                      }}
                    >
                      <td className="px-4 py-3 pl-6">
                        <span className="font-medium text-foreground">{item.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: "hsl(var(--accent))",
                            color: "hsl(var(--accent-foreground))",
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.quantity}</td>
                      <td className="px-4 py-3 tabular-nums text-right text-muted-foreground">
                        ₹{item.unitPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-right" style={{ color: "hsl(142 60% 28%)" }}>
                        {item.discount > 0 ? `–₹${item.discount.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-right text-muted-foreground">
                        {item.taxPercent > 0 ? `${item.taxPercent}%` : "—"}
                      </td>
                      <td className="px-4 py-3 pr-6 tabular-nums text-right font-semibold text-foreground">
                        ₹{item.lineTotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals footer */}
            <div
              className="border-t px-6 py-4 flex flex-col items-end gap-1.5"
              style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--surface-1))" }}
            >
              <div className="flex justify-between w-full max-w-xs text-sm text-muted-foreground">
                <span>Subtotal</span>
                <Currency amount={invoice.subtotal} size="sm" />
              </div>
              <div className="flex justify-between w-full max-w-xs text-sm text-muted-foreground">
                <span>Total Tax</span>
                <Currency amount={invoice.totalTax} size="sm" />
              </div>
              <div
                className="flex justify-between w-full max-w-xs pt-2 border-t mt-1"
                style={{ borderColor: "hsl(var(--border))" }}
              >
                <span className="font-semibold text-foreground">Gross Total</span>
                <Currency amount={invoice.grossTotal} size="lg" className="text-foreground" />
              </div>
            </div>
          </div>
        )}

        {/* ── Payment summary card (no line items / upload invoices) ── */}
        {(!invoice.lineItems || invoice.lineItems.length === 0) && (
          <div className="card-base p-6 flex items-center justify-between">
            <div>
              <p className="section-label mb-1">Amount Due</p>
              <Currency amount={invoice.grossTotal} size="xl" className="text-foreground" />
            </div>
            <StatusBadge status={invoice.status} />
          </div>
        )}

        {/* ── Pay Now CTA ── */}
        {isPayable && (
          <div className="card-base p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">Ready to Pay?</h3>
                <p className="text-sm text-muted-foreground">
                  Amount due:{" "}
                  <span className="font-semibold text-foreground">
                    ₹{invoice.grossTotal.toLocaleString("en-IN")}
                  </span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {invoice.pdfUrl && (
                  <a
                    href={invoice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:bg-accent"
                    style={{
                      borderColor: "hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                  >
                    <Download size={15} />
                    Download PDF
                  </a>
                )}
                {invoice.razorpayLink ? (
                  <a
                    href={invoice.razorpayLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
                    style={{ background: "hsl(var(--primary))" }}
                  >
                    <CreditCard size={15} />
                    Pay Now
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white opacity-50 cursor-not-allowed"
                    style={{ background: "hsl(var(--primary))" }}
                  >
                    <CreditCard size={15} />
                    Pay Now
                  </button>
                )}
              </div>
            </div>

            {/* Trust indicators */}
            <div
              className="flex flex-wrap gap-4 mt-5 pt-4 border-t text-xs"
              style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
            >
              {[
                { icon: Shield, text: "Secured by Razorpay" },
                { icon: RefreshCw, text: "Instant confirmation" },
                { icon: CheckCircle2, text: "Auto receipt generation" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon size={12} style={{ color: "hsl(var(--primary))" }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Payment confirmed state ── */}
        {isPaid && (
          <div
            className="card-base p-6"
            style={{ borderColor: "hsl(var(--status-paid-bg))" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 size={20} style={{ color: "hsl(var(--status-paid-fg))" }} />
              <h3 className="font-semibold text-foreground">Payment Confirmed</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {invoice.pdfUrl && (
                <a
                  href={invoice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:bg-accent"
                  style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                >
                  <Download size={15} />
                  Download Invoice
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Receipts ── */}
        {receipts.length > 0 && (
          <div className="card-base overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
              <h3 className="font-semibold text-foreground text-sm">Payment Receipts</h3>
            </div>
            <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
              {receipts.map((r) => (
                <div key={r.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "hsl(var(--status-paid-bg))" }}
                    >
                      <CheckCircle2 size={16} style={{ color: "hsl(var(--status-paid-fg))" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.receiptNumber}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formattedDate(r.date)}
                        {r.gatewayRef && (
                          <> · <span className="font-mono">{r.gatewayRef}</span></>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Currency
                      amount={r.amount}
                      size="md"
                      className="financial-positive"
                    />
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: "hsl(var(--status-paid-bg))",
                        color: "hsl(var(--status-paid-fg))",
                      }}
                    >
                      {r.type === "SYSTEM" ? "Online" : "Hospital"}
                    </span>
                    {r.pdfUrl && (
                      <a
                        href={r.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <p className="text-center text-xs text-muted-foreground pb-8">
          For billing queries, contact the hospital's billing department or call our helpline.
          <br />
          This is a secure payment portal. Do not share this link with anyone.
        </p>
      </div>
    </div>
  );
}
