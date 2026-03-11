import { useState } from "react";
import { FinancialSummaryBar } from "@/components/billing/FinancialSummaryBar";
import { OverviewTab } from "@/components/billing/OverviewTab";
import { ProformaTab } from "@/components/billing/ProformaTab";
import { InterimInvoicesTab } from "@/components/billing/InterimInvoicesTab";
import { FinalInvoiceTab } from "@/components/billing/FinalInvoiceTab";
import { PaymentsRefundsTab } from "@/components/billing/PaymentsRefundsTab";
import { LedgerAuditTab } from "@/components/billing/LedgerAuditTab";
import { useCaseSummary } from "@/hooks/useBillingData";
import { BillingSkeleton } from "@/components/billing/BillingSkeleton";
import { LayoutDashboard, FileText, FilePlus, FileCheck2, CreditCard, BookOpen, ChevronRight, type LucideIcon } from "lucide-react";

const CASE_ID = "CASE-2024-0891";

type Tab = "overview" | "proforma" | "interim" | "final" | "payments" | "ledger";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "proforma", label: "Proforma", icon: FileText },
  { id: "interim", label: "Interim Invoices", icon: FilePlus },
  { id: "final", label: "Final Invoice", icon: FileCheck2 },
  { id: "payments", label: "Payments & Refunds", icon: CreditCard },
  { id: "ledger", label: "Ledger & Audit", icon: BookOpen },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { data: caseSummary, isLoading } = useCaseSummary(CASE_ID);

  if (isLoading || !caseSummary) {
    return (
      <div className="min-h-screen bg-surface-1 p-6">
        <BillingSkeleton rows={4} />
      </div>
    );
  }

  const { patientCase, financials } = caseSummary;

  return (
    <div className="min-h-screen bg-surface-1">
      {/* Financial Summary Bar — driven by computed financials */}
      <FinancialSummaryBar patientCase={patientCase} financials={financials} />

      {/* Breadcrumb */}
      <div className="px-6 pt-4 pb-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <span>Billing</span>
          <ChevronRight size={12} />
          <span>{patientCase.caseNumber}</span>
          <ChevronRight size={12} />
          <span className="text-foreground font-medium">{TABS.find((t) => t.id === activeTab)?.label}</span>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/60"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-6 py-6">
        {activeTab === "overview" && <OverviewTab caseId={CASE_ID} patientCase={patientCase} financials={financials} />}
        {activeTab === "proforma" && <ProformaTab caseId={CASE_ID} />}
        {activeTab === "interim" && <InterimInvoicesTab caseId={CASE_ID} financials={financials} />}
        {activeTab === "final" && <FinalInvoiceTab caseId={CASE_ID} financials={financials} />}
        {activeTab === "payments" && <PaymentsRefundsTab caseId={CASE_ID} />}
        {activeTab === "ledger" && <LedgerAuditTab caseId={CASE_ID} />}
      </div>
    </div>
  );
};

export default Index;
