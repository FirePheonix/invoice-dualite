import { Clients, Client } from '../types/client';

const STORAGE_KEY = 'dualite_clients_v1';

const sampleClients: Clients = [
  {
    id: 'client-1',
    name: 'Mitchell Newby',
    buyer: {
      name: 'Mitchell Newby',
      address: '2900 Phoenix dr Killeen tx, 76543',
      country: 'United States',
      state: 'Texas',
      stateCode: '97',
      email: 'scraftstudio@gmail.com',
      id: '9674b405-12dd-4613-9496-d88353585ee9',
    },
    planItems: [],
    addonItems: [],
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
