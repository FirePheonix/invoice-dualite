import { InvoiceData } from '../types/invoice';

export interface StoredInvoice {
  id: string;
  invoiceData: InvoiceData;
  createdAt: string;
  downloadedAt: string;
  amount: number;
  currency: 'USD' | 'INR';
}

const STORAGE_KEY = 'dualite_invoice_history';
const COUNTER_KEY = 'dualite_invoice_counter';

export const getInvoiceHistory = (): StoredInvoice[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const invoices = stored ? JSON.parse(stored) : [];
    
    // Sort by invoice number (descending)
    return invoices.sort((a: StoredInvoice, b: StoredInvoice) => {
      const getInvoiceNum = (invoice: StoredInvoice) => {
        const match = invoice.invoiceData.invoice.number.match(/A(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getInvoiceNum(b) - getInvoiceNum(a);
    });
  } catch (error) {
    console.error('Error loading invoice history:', error);
    return [];
  }
};

export const saveInvoiceToHistory = (invoiceData: InvoiceData): StoredInvoice => {
  const history = getInvoiceHistory();
  const newInvoice: StoredInvoice = {
    id: crypto.randomUUID(),
    invoiceData: { ...invoiceData },
    createdAt: new Date().toISOString(),
    downloadedAt: new Date().toISOString(),
    amount: invoiceData.summary.total,
    currency: invoiceData.currency,
  };

  const updatedHistory = [...history, newInvoice];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  
  return newInvoice;
};

export const getNextInvoiceNumber = (type: 'plan' | 'addon' = 'plan'): string => {
  try {
    const invoices = getInvoiceHistory();
    let highestNumber = 210; // Default starting number
    
    // Find the highest invoice number from existing invoices
    invoices.forEach(invoice => {
      const match = invoice.invoiceData.invoice.number.match(/A(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > highestNumber) {
          highestNumber = num;
        }
      }
    });
    
    // Also check the counter from localStorage as fallback
    const storedCounter = parseInt(localStorage.getItem(COUNTER_KEY) || '210', 10);
    if (storedCounter > highestNumber) {
      highestNumber = storedCounter;
    }
    
    const nextNumber = highestNumber + 1;
    localStorage.setItem(COUNTER_KEY, nextNumber.toString());
    
    const prefix = type === 'addon' ? 'DTPL-ADDON/25-26/A' : 'DTPL/25-26/A';
    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    const prefix = type === 'addon' ? 'DTPL-ADDON/25-26/A' : 'DTPL/25-26/A';
    return `${prefix}00210`;
  }
};

export const resetInvoiceCounter = (startNumber: number = 210): void => {
  localStorage.setItem(COUNTER_KEY, startNumber.toString());
};

export const deleteInvoiceFromHistory = (id: string): void => {
  const history = getInvoiceHistory();
  const updatedHistory = history.filter(invoice => invoice.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
};

// Revenue calculation utilities
export const calculateTodayRevenue = (invoices: StoredInvoice[]): { usd: number; inr: number } => {
  const today = new Date().toDateString();
  const todayInvoices = invoices.filter(invoice => 
    new Date(invoice.downloadedAt).toDateString() === today
  );

  return todayInvoices.reduce(
    (acc, invoice) => ({
      usd: acc.usd + (invoice.currency === 'USD' ? invoice.amount : 0),
      inr: acc.inr + (invoice.currency === 'INR' ? invoice.amount : 0),
    }),
    { usd: 0, inr: 0 }
  );
};

export const calculateMRR = (invoices: StoredInvoice[]): { usd: number; inr: number } => {
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  
  const monthlyInvoices = invoices.filter(invoice => 
    new Date(invoice.downloadedAt) >= oneMonthAgo
  );

  return monthlyInvoices.reduce(
    (acc, invoice) => ({
      usd: acc.usd + (invoice.currency === 'USD' ? invoice.amount : 0),
      inr: acc.inr + (invoice.currency === 'INR' ? invoice.amount : 0),
    }),
    { usd: 0, inr: 0 }
  );
};

export const calculateARR = (invoices: StoredInvoice[]): { usd: number; inr: number } => {
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  
  const yearlyInvoices = invoices.filter(invoice => 
    new Date(invoice.downloadedAt) >= oneYearAgo
  );

  return yearlyInvoices.reduce(
    (acc, invoice) => ({
      usd: acc.usd + (invoice.currency === 'USD' ? invoice.amount : 0),
      inr: acc.inr + (invoice.currency === 'INR' ? invoice.amount : 0),
    }),
    { usd: 0, inr: 0 }
  );
};