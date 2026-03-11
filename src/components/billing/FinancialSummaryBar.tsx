import type { PatientCase } from "@/types/billing";
import type { ComputedFinancials } from "@/services/billingApi";
import { Calendar, User, MapPin, Stethoscope } from "lucide-react";

interface FinancialSummaryBarProps {
  patientCase: PatientCase;
  financials: ComputedFinancials;
}

export function FinancialSummaryBar({ patientCase, financials }: FinancialSummaryBarProps) {
  const summaryItems = [
    { label: "Quotation", value: financials.quotationTotal },
    { label: "Advance Paid", value: financials.advancePaid },
    { label: "Interim Raised", value: financials.interimRaised },
    { label: "Interim Paid", value: financials.interimPaid },
    { label: "Total Received", value: financials.totalReceived },
    { label: "Outstanding", value: financials.outstanding },
  ];

  return (
    <div
      className="sticky top-0 z-20 w-full"
      style={{
        background: "hsl(var(--summary-bg))",
        boxShadow: "var(--shadow-summary)",
      }}
    >
      {/* Patient info strip */}
      <div className="border-b border-white/10 px-6 py-2.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <div className="flex items-center gap-1.5">
            <User size={13} className="opacity-70 text-white" />
            <span className="text-white font-semibold text-sm">{patientCase.patientName}</span>
            <span className="text-white/60 text-xs">({patientCase.uhid})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Stethoscope size={13} className="opacity-70 text-white" />
            <span className="text-white/80 text-xs">{patientCase.diagnosis}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="opacity-70 text-white" />
            <span className="text-white/80 text-xs">{patientCase.ward}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="opacity-70 text-white" />
            <span className="text-white/80 text-xs">
              Admitted: {new Date(patientCase.admissionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <div className="ml-auto">
            <span className="bg-white/15 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {patientCase.caseNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Financial strip */}
      <div className="px-6 py-3">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex flex-col">
              <span className="text-white/60 text-xs mb-0.5">{item.label}</span>
              <span className="text-white font-bold tabular-nums text-sm">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
