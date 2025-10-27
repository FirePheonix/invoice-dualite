import { InvoiceItem } from './invoice';

export interface Client {
  id: string;
  name: string;
  buyer: {
    name: string;
    address: string;
    country: string;
    state: string;
    stateCode: string;
    email: string;
    id: string;
  };
  planItems: InvoiceItem[];
  addonItems: InvoiceItem[];
}

export type Clients = Client[];
