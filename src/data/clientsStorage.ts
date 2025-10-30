import { Clients, Client } from '../types/client';

const STORAGE_KEY = 'dualite_clients_v2';

const sampleClients: Clients = [
  {
    id: 'client-1',
    name: 'Mitchell Newby',
    planConfig: {
      invoiceType: 'plan',
      currency: 'USD',
      serviceType: 'regular',
      selectedPlanId: undefined
    },
    buyer: {
      fields: [
        { id: 'name', label: 'Buyer Name', value: 'Mitchell Newby' },
        { id: 'address', label: 'Address', value: '2900 Phoenix dr Killeen tx, 76543' },
        { id: 'country', label: 'Country', value: 'United States' },
        { id: 'state', label: 'State', value: 'Texas' },
        { id: 'stateCode', label: 'State Code', value: '97' },
        { id: 'email', label: 'Email', value: 'scraftstudio@gmail.com' },
        { id: 'id', label: 'Buyer ID', value: '9674b405-12dd-4613-9496-d88353585ee9' },
      ],
    },
    items: [
      {
        id: 1,
        srNo: 1,
        description: "Dualite Alpha Pro Plan",
        subscription: "Pro-Monthly",
        period: "3 October, 2025 to 3 November, 2025",
        features: ["200 messages", "Figma Import", "Github Import", "Premium e-mail support"],
        hsnSac: "998313",
        gstRate: "NA",
        qty: 1,
        rate: 39,
        per: "Nos",
        amount: 39,
      }
    ],
    taxConfig: {
      applyTax: false,
      taxType: 'no_tax'
    }
  },
];

export function getClients(): Clients {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleClients));
      return sampleClients;
    }
    return JSON.parse(raw) as Clients;
  } catch (e) {
    console.error('Failed to read clients from localStorage', e);
    return sampleClients;
  }
}

export function saveClients(clients: Clients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function addClient(client: Client) {
  const clients = getClients();
  clients.push(client);
  saveClients(clients);
}

export function updateClient(updated: Client) {
  const clients = getClients();
  const idx = clients.findIndex(c => c.id === updated.id);
  if (idx !== -1) {
    clients[idx] = updated;
    saveClients(clients);
  }
}

export function deleteClient(id: string) {
  const clients = getClients().filter(c => c.id !== id);
  saveClients(clients);
}

export function generateClientId() {
  return `client-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
