/**
 * Billing API Service Layer
 * 
 * All data-fetching functions are centralized here.
 * Currently returns mock data — replace each function body with 
 * real API calls (e.g., supabase.from('...').select()) when backend is ready.
 * 
 * IMPORTANT: No component should import from mockBillingData directly.
 */

import type { PatientCase, Invoice, Receipt, LedgerEntry, AuditLog, CaseFinancials } from "@/types/billing";
import { mockPatientCase, mockInvoices, mockReceipts, mockLedger, mockAuditLogs } from "@/data/mockBillingData";

// ─── Types for API responses ───

export interface CaseSummary {
  patientCase: PatientCase;
  financials: ComputedFinancials;
}

/** All financial values derived from ledger calculations */
export interface ComputedFinancials {
  quotationTotal: number;
  advancePaid: number;
  interimRaised: number;
  interimPaid: number;
  totalReceived: number;
  outstanding: number;
  finalInvoiceAmount: number | null; // null = not generated
  progressPercent: number;
  isOverpaid: boolean;
  isFullyPaid: boolean;
}

export interface PaymentRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  method: string;
  reference: string;
  invoiceRef: string;
  status: string;
  gatewayFee: number;
  platformFee: number;
  type: "ADVANCE" | "OUTSTANDING";
}

export interface EscrowSummaryItem {
  label: string;
  value: number;
  positive?: boolean;
  negative?: boolean;
}

export interface LedgerBalance {
  label: string;
  value: number;
}

// ─── Helper: compute financials from ledger ───

function computeFinancialsFromLedger(
  caseFinancials: CaseFinancials,
  invoices: Invoice[],
  _ledger: LedgerEntry[]
): ComputedFinancials {
  // In production: these would be SUM queries on the ledger table
  // grouped by event_type and account
  const quotationTotal = caseFinancials.quotationTotal;
  const advancePaid = caseFinancials.advancePaid;
  const interimRaised = caseFinancials.interimRaised;
  const interimPaid = caseFinancials.interimPaid;
  const totalReceived = advancePaid + interimPaid + caseFinancials.finalPaid;

  const finalInvoice = invoices.find((inv) => inv.type === "FINAL");
  const finalInvoiceAmount = finalInvoice ? finalInvoice.grossTotal : null;
  const outstanding = finalInvoiceAmount !== null
    ? finalInvoiceAmount - totalReceived
    : caseFinancials.outstanding;

  const progressPercent = quotationTotal > 0
    ? (totalReceived / quotationTotal) * 100
    : 0;

  return {
    quotationTotal,
    advancePaid,
    interimRaised,
    interimPaid,
    totalReceived,
    outstanding: Math.max(outstanding, 0),
    finalInvoiceAmount,
    progressPercent,
    isOverpaid: outstanding < 0,
    isFullyPaid: outstanding === 0 && finalInvoiceAmount !== null,
  };
}

// ─── API Functions ───

/** Fetch case summary + computed financials for a given case_id */
export async function fetchCaseSummary(caseId: string): Promise<CaseSummary> {
  // TODO: Replace with real API call
  // const { data } = await supabase.rpc('get_case_summary', { case_id: caseId });
  await simulateLatency();

  const financials = computeFinancialsFromLedger(
    mockPatientCase.financials,
    mockInvoices,
    mockLedger
  );

  return {
    patientCase: mockPatientCase,
    financials,
  };
}

/** Fetch all invoices for a case */
export async function fetchInvoices(caseId: string): Promise<Invoice[]> {
  // TODO: Replace with real API call
  // const { data } = await supabase.from('invoices').select('*').eq('case_id', caseId);
  await simulateLatency();
  return mockInvoices;
}

/** Fetch invoices filtered by type */
export async function fetchInvoicesByType(
  caseId: string,
  type: "PROFORMA" | "INTERIM" | "FINAL"
): Promise<Invoice[]> {
  // TODO: Replace with real API call
  await simulateLatency();
  return mockInvoices.filter((inv) => inv.type === type);
}

/** Fetch a single invoice by ID (for payment portal) */
export async function fetchInvoiceById(invoiceId: string): Promise<Invoice | null> {
  // TODO: Replace with real API call
  await simulateLatency();
  return mockInvoices.find((inv) => inv.id === invoiceId) ?? null;
}

/** Fetch all receipts for a case */
export async function fetchReceipts(caseId: string): Promise<Receipt[]> {
  // TODO: Replace with real API call
  await simulateLatency();
  return mockReceipts;
}

/** Fetch payment history for a case */
export async function fetchPayments(caseId: string): Promise<PaymentRecord[]> {
  // TODO: Replace with real API call
  // In production: query payments table joined with invoices
  await simulateLatency();
  return [
    {
      id: "PAY-001",
      date: "2024-12-01",
      description: "Advance payment – Proforma invoice",
      amount: 100000,
      method: "Razorpay",
      reference: "pay_RZP291823ABC",
      invoiceRef: "PRF-2024-0891-01",
      status: "PAID",
      gatewayFee: 2000,
      platformFee: 1500,
      type: "ADVANCE",
    },
    {
      id: "PAY-002",
      date: "2024-12-07",
      description: "Interim payment – Interim invoice #1",
      amount: 150000,
      method: "Razorpay",
      reference: "pay_RZP391823XYZ",
      invoiceRef: "INT-2024-0891-01",
      status: "PAID",
      gatewayFee: 3000,
      platformFee: 2250,
      type: "ADVANCE",
    },
  ];
}

/** Fetch escrow summary for a case */
export async function fetchEscrowSummary(caseId: string): Promise<EscrowSummaryItem[]> {
  // TODO: Compute from ledger entries
  await simulateLatency();
  return [
    { label: "Total Collected in Escrow", value: 250000, positive: true },
    { label: "Gateway Charges Deducted", value: 5000, negative: true },
    { label: "Platform Commission", value: 3750, negative: true },
    { label: "Net Escrow Balance", value: 241250, positive: true },
    { label: "Released to Hospital", value: 0 },
    { label: "Pending Release", value: 241250 },
  ];
}

/** Fetch ledger entries for a case */
export async function fetchLedgerEntries(
  caseId: string,
  ledgerFilter?: string
): Promise<LedgerEntry[]> {
  // TODO: Replace with real API call
  await simulateLatency();
  if (ledgerFilter && ledgerFilter !== "All") {
    return mockLedger.filter((e) => e.ledger === ledgerFilter);
  }
  return mockLedger;
}

/** Fetch computed ledger balances */
export async function fetchLedgerBalances(caseId: string): Promise<LedgerBalance[]> {
  // TODO: Compute as SUM(debit) - SUM(credit) grouped by ledger
  await simulateLatency();
  return [
    { label: "Escrow", value: 250000 },
    { label: "Hospital Payable", value: 250000 },
    { label: "Gateway Expense", value: 5000 },
    { label: "Revenue (Commission)", value: 3750 },
    { label: "Refund Liability", value: 0 },
  ];
}

/** Fetch audit logs for a case */
export async function fetchAuditLogs(caseId: string): Promise<AuditLog[]> {
  // TODO: Replace with real API call
  await simulateLatency();
  return mockAuditLogs;
}

// ─── Mutation stubs ───

export async function createInvoice(
  _caseId: string,
  _payload: Partial<Invoice>
): Promise<Invoice> {
  // TODO: POST to API
  throw new Error("Not implemented — enable Lovable Cloud to persist data");
}

export async function processRefund(
  _caseId: string,
  _amount: number,
  _reason: string
): Promise<void> {
  // TODO: POST to refund API → Razorpay refund → ledger entries
  throw new Error("Not implemented — enable Lovable Cloud to persist data");
}

export async function generatePaymentLink(
  _invoiceId: string
): Promise<string> {
  // TODO: Call Razorpay payment link edge function
  throw new Error("Not implemented — enable Lovable Cloud to persist data");
}

// ─── Utility ───

function simulateLatency(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 120));
}
