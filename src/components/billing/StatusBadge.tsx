import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/types/billing";

interface StatusBadgeProps {
  status: InvoiceStatus | string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "status-draft" },
  SENT: { label: "Sent", className: "status-sent" },
  PAID: { label: "Paid", className: "status-paid" },
  OVERDUE: { label: "Overdue", className: "status-overdue" },
  REFUNDABLE: { label: "Refundable", className: "status-refundable" },
  REFUNDED: { label: "Refunded", className: "status-refunded" },
  BALANCE_DUE: { label: "Balance Due", className: "status-balance" },
  PARTIALLY_PAID: { label: "Partially Paid", className: "status-sent" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "status-draft" };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
