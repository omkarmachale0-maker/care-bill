/**
 * React Query hooks for all billing data.
 * Components consume these hooks instead of importing mock data directly.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchCaseSummary,
  fetchInvoices,
  fetchInvoicesByType,
  fetchInvoiceById,
  fetchReceipts,
  fetchPayments,
  fetchEscrowSummary,
  fetchLedgerEntries,
  fetchLedgerBalances,
  fetchAuditLogs,
} from "@/services/billingApi";

const STALE_TIME = 30_000; // 30s — data refreshes after payment webhooks

export function useCaseSummary(caseId: string) {
  return useQuery({
    queryKey: ["caseSummary", caseId],
    queryFn: () => fetchCaseSummary(caseId),
    staleTime: STALE_TIME,
  });
}

export function useInvoices(caseId: string) {
  return useQuery({
    queryKey: ["invoices", caseId],
    queryFn: () => fetchInvoices(caseId),
    staleTime: STALE_TIME,
  });
}

export function useInvoicesByType(caseId: string, type: "PROFORMA" | "INTERIM" | "FINAL") {
  return useQuery({
    queryKey: ["invoices", caseId, type],
    queryFn: () => fetchInvoicesByType(caseId, type),
    staleTime: STALE_TIME,
  });
}

export function useInvoiceById(invoiceId: string) {
  return useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => fetchInvoiceById(invoiceId),
    enabled: !!invoiceId,
    staleTime: STALE_TIME,
  });
}

export function useReceipts(caseId: string) {
  return useQuery({
    queryKey: ["receipts", caseId],
    queryFn: () => fetchReceipts(caseId),
    staleTime: STALE_TIME,
  });
}

export function usePayments(caseId: string) {
  return useQuery({
    queryKey: ["payments", caseId],
    queryFn: () => fetchPayments(caseId),
    staleTime: STALE_TIME,
  });
}

export function useEscrowSummary(caseId: string) {
  return useQuery({
    queryKey: ["escrowSummary", caseId],
    queryFn: () => fetchEscrowSummary(caseId),
    staleTime: STALE_TIME,
  });
}

export function useLedgerEntries(caseId: string, ledgerFilter?: string) {
  return useQuery({
    queryKey: ["ledgerEntries", caseId, ledgerFilter],
    queryFn: () => fetchLedgerEntries(caseId, ledgerFilter),
    staleTime: STALE_TIME,
  });
}

export function useLedgerBalances(caseId: string) {
  return useQuery({
    queryKey: ["ledgerBalances", caseId],
    queryFn: () => fetchLedgerBalances(caseId),
    staleTime: STALE_TIME,
  });
}

export function useAuditLogs(caseId: string) {
  return useQuery({
    queryKey: ["auditLogs", caseId],
    queryFn: () => fetchAuditLogs(caseId),
    staleTime: STALE_TIME,
  });
}
