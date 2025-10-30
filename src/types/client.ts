import { InvoiceItem } from './invoice';

export interface Client {
  id: string;
  name: string;
  // Plan configuration for quick pricing
  planConfig: {
    invoiceType: 'plan' | 'addon';
    currency: 'USD' | 'INR';
    serviceType: 'regular' | 'figma';
    selectedPlanId?: string; // The ID of the selected plan/addon
  };
  // Dynamic buyer details
  buyer: {
    fields: Array<{
      id: string;
      label: string;
      value: string;
    }>;
  };
  // Line items (can be multiple)
  items: InvoiceItem[];
  // Tax configuration
  taxConfig: {
    applyTax: boolean;
    taxType: 'rajasthan' | 'other_state' | 'no_tax';
  };
}

export type Clients = Client[];
