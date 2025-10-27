import React, { useEffect, useState } from 'react';
import { Client } from '../types/client';
import { getClients, addClient, updateClient, deleteClient, generateClientId, saveClients } from '../data/clientsStorage';
import { Input } from './ui/Input';
import { PlusCircle, Trash2, Edit3 } from 'lucide-react';

interface ClientsPanelProps {
  open: boolean;
  onClose: () => void;
  onSelectClient: (client: Client, type: 'plan' | 'addon') => void;
  invoiceType: 'plan' | 'addon';
}

const ClientsPanel: React.FC<ClientsPanelProps> = ({ open, onClose, onSelectClient, invoiceType }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [editing, setEditing] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'addon'>('plan');

  useEffect(() => {
    setClients(getClients());
  }, [open]);

  const handleNew = () => {
    const newClient: Client = {
      id: generateClientId(),
      name: 'New Client',
      buyer: {
        name: 'New Client',
        address: '',
        country: '',
        state: '',
        stateCode: '',
        email: '',
        id: generateClientId(),
      },
      planItems: [],
      addonItems: [],
    };
    const updated = [...clients, newClient];
    setClients(updated);
    saveClients(updated);
    setEditing(newClient);
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
    setClients(getClients());
  };

  const handleSaveEdit = (c: Client) => {
    // If exists, update; else add
    const exists = clients.some(x => x.id === c.id);
    if (exists) {
      updateClient(c);
    } else {
      addClient(c);
    }
    setClients(getClients());
    setEditing(null);
  };

  const getCurrentItems = () => {
    if (!editing) return [];
    return activeTab === 'plan' ? editing.planItems : editing.addonItems;
  };

  const handleAddItemToEditing = () => {
    if (!editing) return;
    const currentItems = getCurrentItems();
    const newItem = {
      id: Date.now(),
      srNo: currentItems.length + 1,
      description: activeTab === 'plan' ? 'New Plan Item' : 'New Add-on Item',
      subscription: '',
      period: '',
      features: [],
      hsnSac: '',
      gstRate: 'NA',
      qty: 1,
      rate: 0,
      per: 'Nos',
      amount: 0,
    };
    
    if (activeTab === 'plan') {
      setEditing({ ...editing, planItems: [...editing.planItems, newItem] });
    } else {
      setEditing({ ...editing, addonItems: [...editing.addonItems, newItem] });
    }
  };

  const handleRemoveEditingItem = (id: number) => {
    if (!editing) return;
    if (activeTab === 'plan') {
      setEditing({ 
        ...editing, 
        planItems: editing.planItems.filter(it => it.id !== id).map((it, idx) => ({ ...it, srNo: idx + 1 })) 
      });
    } else {
      setEditing({ 
        ...editing, 
        addonItems: editing.addonItems.filter(it => it.id !== id).map((it, idx) => ({ ...it, srNo: idx + 1 })) 
      });
    }
  };

  const handleEditingItemChange = (id: number, field: string, value: any) => {
    if (!editing) return;
    const updateItems = (items: any[]) => items.map((it: any) => {
      if (it.id === id) {
        const updated = { ...it, [field]: value };
        if (field === 'qty' || field === 'rate') {
          const qty = field === 'qty' ? Number(value) : Number(it.qty);
          const rate = field === 'rate' ? Number(value) : Number(it.rate);
          updated.amount = (qty || 0) * (rate || 0);
        }
        return updated;
      }
      return it;
    });

    if (activeTab === 'plan') {
      setEditing({ ...editing, planItems: updateItems(editing.planItems) });
    } else {
      setEditing({ ...editing, addonItems: updateItems(editing.addonItems) });
    }
  };

  const handleChangeEditing = (field: string, value: any) => {
    if (!editing) return;
    if (field.startsWith('buyer.')) {
      const key = field.split('.')[1];
      setEditing({ ...editing, buyer: { ...editing.buyer, [key]: value } });
    } else {
      setEditing({ ...editing, [field]: value });
    }
  };

  return open ? (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Clients</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleNew} className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md">
              <PlusCircle size={16} /> New
            </button>
            <button onClick={onClose} className="px-3 py-1 bg-gray-100 rounded-md">Close</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 border-r pr-4">
            <ul className="space-y-2">
              {clients.map(c => (
                <li key={c.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <button
                    onClick={() => onSelectClient(c, invoiceType)}
                    className="text-left w-full"
                    title="Select this client to autofill invoice"
                  >
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500 truncate">{c.buyer.address}</div>
                  </button>
                  <div className="ml-2 flex items-center gap-1">
                    <button onClick={() => setEditing(c)} className="text-blue-600 p-1 rounded hover:bg-gray-100" title="Edit">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 p-1 rounded hover:bg-gray-100" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2">
            {editing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Input label="Client Name" value={editing.name} onChange={e => handleChangeEditing('name', e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Buyer Name" value={editing.buyer.name} onChange={e => handleChangeEditing('buyer.name', e.target.value)} />
                  <Input label="Buyer ID" value={editing.buyer.id} onChange={e => handleChangeEditing('buyer.id', e.target.value)} />
                  <Input label="Email" value={editing.buyer.email} onChange={e => handleChangeEditing('buyer.email', e.target.value)} />
                  <Input label="Country" value={editing.buyer.country} onChange={e => handleChangeEditing('buyer.country', e.target.value)} />
                  <Input label="State" value={editing.buyer.state} onChange={e => handleChangeEditing('buyer.state', e.target.value)} />
                  <Input label="State Code" value={editing.buyer.stateCode} onChange={e => handleChangeEditing('buyer.stateCode', e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea className="w-full border rounded p-2 h-24" value={editing.buyer.address} onChange={e => handleChangeEditing('buyer.address', e.target.value)} />
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h4 className="font-medium">Default Line Items</h4>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setActiveTab('plan')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          activeTab === 'plan' 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Plan Items
                      </button>
                      <button
                        onClick={() => setActiveTab('addon')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          activeTab === 'addon' 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Add-on Items
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {getCurrentItems().map(item => (
                      <div key={item.id} className="p-3 border rounded bg-gray-50 relative">
                        {getCurrentItems().length > 0 && (
                          <button onClick={() => handleRemoveEditingItem(item.id)} className="absolute top-2 right-2 text-red-500">
                            <Trash2 size={14} />
                          </button>
                        )}
                        <Input label="Description" value={item.description} onChange={e => handleEditingItemChange(item.id, 'description', e.target.value)} />
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          <Input label="Qty" type="number" value={item.qty} onChange={e => handleEditingItemChange(item.id, 'qty', Number(e.target.value) || 0)} />
                          <Input label="Rate" type="number" value={item.rate} onChange={e => handleEditingItemChange(item.id, 'rate', Number(e.target.value) || 0)} />
                          <Input label="Amount" type="number" value={item.amount} readOnly className="bg-gray-100" />
                        </div>
                      </div>
                    ))}
                    <button onClick={handleAddItemToEditing} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded text-sm">
                      <PlusCircle size={14} /> Add {activeTab === 'plan' ? 'Plan' : 'Add-on'} Item
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveEdit(editing)}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Save
                  </button>
                  <button onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Select a client or create a new one to edit its details. Click a client name to autofill the invoice.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default ClientsPanel;
