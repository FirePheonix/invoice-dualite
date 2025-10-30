import React, { useEffect, useState } from 'react';
import { Client } from '../types/client';
import { getClients, addClient, updateClient, deleteClient, generateClientId, saveClients } from '../data/clientsStorage';
import { Input } from './ui/Input';
import { PlusCircle, Trash2, Edit3 } from 'lucide-react';

interface ClientsPanelProps {
  open: boolean;
  onClose: () => void;
  onSelectClient: (client: Client) => void;
}

const ClientsPanel: React.FC<ClientsPanelProps> = ({ open, onClose, onSelectClient }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [editing, setEditing] = useState<Client | null>(null);


  useEffect(() => {
    setClients(getClients());
  }, [open]);

  const handleNew = () => {
    const newClient: Client = {
      id: generateClientId(),
      name: 'New Client',
      planConfig: {
        invoiceType: 'plan',
        currency: 'USD',
        serviceType: 'regular',
        selectedPlanId: undefined
      },
      buyer: {
        fields: [
          { id: 'name', label: 'Buyer Name', value: 'New Client' },
          { id: 'address', label: 'Address', value: '' },
          { id: 'country', label: 'Country', value: '' },
          { id: 'state', label: 'State', value: '' },
          { id: 'stateCode', label: 'State Code', value: '' },
          { id: 'email', label: 'Email', value: '' },
          { id: 'id', label: 'Buyer ID', value: generateClientId() },
        ],
      },
      items: [
        {
          id: 1,
          srNo: 1,
          description: "Select a plan",
          subscription: "",
          period: "",
          features: [],
          hsnSac: "998313",
          gstRate: "NA",
          qty: 1,
          rate: 0,
          per: "Nos",
          amount: 0,
        }
      ],
      taxConfig: {
        applyTax: false,
        taxType: 'no_tax'
      }
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
    return editing.items;
  };

  const handleAddItemToEditing = () => {
    if (!editing) return;
    const currentItems = getCurrentItems();
    const newItem = {
      id: Date.now(),
      srNo: currentItems.length + 1,
      description: 'New Item',
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
    
    setEditing({ ...editing, items: [...editing.items, newItem] });
  };

  const handleRemoveEditingItem = (id: number) => {
    if (!editing) return;
    setEditing({ 
      ...editing, 
      items: editing.items.filter(it => it.id !== id).map((it, idx) => ({ ...it, srNo: idx + 1 })) 
    });
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

    setEditing({ ...editing, items: updateItems(editing.items) });
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

  const handleChangeBuyerField = (fieldId: string, property: 'label' | 'value', newValue: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      buyer: {
        ...editing.buyer,
        fields: editing.buyer.fields.map(field => 
          field.id === fieldId ? { ...field, [property]: newValue } : field
        )
      }
    });
  };

  const handleAddBuyerFieldToEditing = () => {
    if (!editing) return;
    const newFieldId = `field_${Date.now()}`;
    setEditing({
      ...editing,
      buyer: {
        ...editing.buyer,
        fields: [...editing.buyer.fields, {
          id: newFieldId,
          label: 'New Field',
          value: ''
        }]
      }
    });
  };

  const handleRemoveBuyerFieldFromEditing = (fieldId: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      buyer: {
        ...editing.buyer,
        fields: editing.buyer.fields.filter(field => field.id !== fieldId)
      }
    });
  };

  const handleChangePlanConfig = (field: string, value: any) => {
    if (!editing) return;
    setEditing({
      ...editing,
      planConfig: {
        ...editing.planConfig,
        [field]: value
      }
    });
  };

  const handleChangeTaxConfig = (field: string, value: any) => {
    if (!editing) return;
    setEditing({
      ...editing,
      taxConfig: {
        ...editing.taxConfig,
        [field]: value
      }
    });
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
                    onClick={() => onSelectClient(c)}
                    className="text-left w-full"
                    title="Select this client to autofill invoice"
                  >
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {c.buyer.fields.find(f => f.id === 'address')?.value || 'No address'}
                    </div>
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

                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800">Plan Configuration</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
                      <select 
                        value={editing.planConfig.invoiceType}
                        onChange={e => handleChangePlanConfig('invoiceType', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="plan">Plan</option>
                        <option value="addon">Add-on</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select 
                        value={editing.planConfig.currency}
                        onChange={e => handleChangePlanConfig('currency', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="USD">USD</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                      <select 
                        value={editing.planConfig.serviceType}
                        onChange={e => handleChangePlanConfig('serviceType', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="regular">Regular</option>
                        <option value="figma">Figma</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apply Tax</label>
                      <select 
                        value={editing.taxConfig.applyTax ? 'true' : 'false'}
                        onChange={e => handleChangeTaxConfig('applyTax', e.target.value === 'true')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="false">No Tax</option>
                        <option value="true">Apply Tax</option>
                      </select>
                    </div>
                    
                    {editing.taxConfig.applyTax && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tax Type</label>
                        <select 
                          value={editing.taxConfig.taxType}
                          onChange={e => handleChangeTaxConfig('taxType', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="no_tax">No Tax</option>
                          <option value="rajasthan">Rajasthan (CGST + SGST)</option>
                          <option value="other_state">Other State (IGST)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Buyer Fields</h4>
                  {editing.buyer.fields.map((field) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input 
                          label={field.label} 
                          value={field.value} 
                          onChange={e => handleChangeBuyerField(field.id, 'value', e.target.value)} 
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={e => handleChangeBuyerField(field.id, 'label', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Field label"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveBuyerFieldFromEditing(field.id)}
                        className="mt-6 p-2 text-red-500 hover:text-red-700 transition-colors"
                        title="Remove field"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddBuyerFieldToEditing}
                    className="flex items-center gap-2 w-full justify-center px-4 py-2 border border-dashed border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    <PlusCircle size={18} />
                    Add Buyer Field
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h4 className="font-medium">Default Line Items</h4>
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
                      <PlusCircle size={14} /> Add Item
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
