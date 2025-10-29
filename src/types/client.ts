import { InvoiceItem } from './invoice';

export interface Client {
  id: string;
  name: string;
  buyer: {
    fields: Array<{
      id: string;
      label: string;
      value: string;
    }>;
  };
  planItems: InvoiceItem[];
  addonItems: InvoiceItem[];
}

export type Clients = Client[];
