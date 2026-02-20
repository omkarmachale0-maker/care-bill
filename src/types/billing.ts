// Shared types for the hospital billing module

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "OVERDUE"
  | "REFUNDABLE"
  | "REFUNDED"
  | "BALANCE_DUE"
  | "PARTIALLY_PAID";

export type InvoiceMode = "SYSTEM" | "UPLOAD";
export type InvoiceType = "PROFORMA" | "INTERIM" | "FINAL";

export interface LineItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxPercent: number;
  taxAmount: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  mode: InvoiceMode;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  lineItems?: LineItem[];
  subtotal: number;
  totalTax: number;
  grossTotal: number;
  pdfUrl?: string;
  razorpayLink?: string;
  notes?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  date: string;
  amount: number;
  type: "SYSTEM" | "HOSPITAL";
  invoiceId: string;
  gatewayRef?: string;
  pdfUrl?: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  ledger: string;
  debit: number;
  credit: number;
  balance: number;
  reference: string;
  eventType: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
}

export interface CaseFinancials {
  quotationTotal: number;
  advancePaid: number;
  interimRaised: number;
  interimPaid: number;
  finalTotal: number;
  finalPaid: number;
  refundable: number;
  outstanding: number;
}

export interface PatientCase {
  id: string;
  caseNumber: string;
  patientName: string;
  patientId: string;
  uhid: string;
  ward: string;
  admissionDate: string;
  expectedDischarge: string;
  diagnosis: string;
  consultant: string;
  insuranceProvider?: string;
  financials: CaseFinancials;
}

export const ITEM_CATEGORIES = [
  "Consultation",
  "Surgery",
  "Medication",
  "Diagnostics",
  "Room & Board",
  "Nursing",
  "Physiotherapy",
  "Radiology",
  "ICU Charges",
  "OT Charges",
  "Anaesthesia",
  "Blood Bank",
  "Pharmacy",
  "Miscellaneous",
];
