export interface InvoiceItem {
  id: number;
  srNo: number;
  description: string;
  subscription: string;
  period: string;
  features: string[];
  hsnSac: string;
  gstRate: string;
  qty: number;
  rate: number;
  per: string;
  amount: number;
}

export interface InvoiceData {
  type: 'plan' | 'addon';
  currency: 'USD' | 'INR';
  company: {
    name: string;
    address: string;
    location: string;
    gstin: string;
    state: string;
    cin: string;
    email: string;
    pan: string;
  };
  invoice: {
    number: string;
    date: string;
    modeOfPayment: string;
    reference: string;
    referenceDate: string;
  };
  buyer: {
    fields: Array<{
      id: string;
      label: string;
      value: string;
    }>;
  };
  items: InvoiceItem[];
  summary: {
    grossAmount: number;
    cgst: string;
    sgst: string;
    igst: string;
    total: number;
    applyTax: boolean;
    taxType: 'rajasthan' | 'other_state' | 'no_tax';
  };
  bankDetails: {
    holderName: string;
    bankName: string;
    accountNumber: string;
    branchIfs: string;
  };
  declaration: string;
  signatory: {
    for: string;
    title: string;
  };
}
