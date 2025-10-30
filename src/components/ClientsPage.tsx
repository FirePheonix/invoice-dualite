import React, { useEffect, useState } from 'react';
import { Client } from '../types/client';
import { getClients, addClient, updateClient, deleteClient, generateClientId } from '../data/clientsStorage';
import { Input } from './ui/Input';
import { PlusCircle, Trash2, Edit3 } from 'lucide-react';
import { getAvailablePlans, getPlanById } from '../data/planUtils';

interface ClientsPageProps {
  onSelectClient: (client: Client) => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ onSelectClient }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [editing, setEditing] = useState<Client | null>(null);

  useEffect(() => {
    setClients(getClients());
  }, []);

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
          description: "New Item",
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
    // Only set editing state - client will be saved when user clicks "Save Changes"
    setEditing(newClient);
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
    setClients(getClients());
  };

  const handleSaveEdit = (c: Client) => {
    // Check if client exists in the current clients list
    const exists = clients.some(x => x.id === c.id);
    if (exists) {
      // Update existing client
      updateClient(c);
    } else {
      // Add new client
      addClient(c);
    }
    // Refresh clients list from localStorage
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
          <button 
            onClick={handleNew} 
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusCircle size={18} /> New Client
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Client List</h3>
            <div className="space-y-2">
              {clients.map(c => (
                <div key={c.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => onSelectClient(c)}
                      className="text-left flex-1"
                      title="Select this client to autofill invoice"
                    >
                      <div className="font-medium text-gray-900">{c.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {c.buyer.fields.find(f => f.id === 'address')?.value || 'No address'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {c.planConfig.currency} • {c.planConfig.serviceType} • {c.planConfig.invoiceType}
                        {c.planConfig.selectedPlanId !== undefined ? (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            Predefined
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                            Manual
                          </span>
                        )}
                      </div>
                    </button>
                    <div className="ml-3 flex items-center gap-1">
                      <button 
                        onClick={() => setEditing(c)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {clients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No clients yet.</p>
                  <p className="text-sm">Create your first client to get started.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {editing ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Edit Client</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveEdit(editing)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => setEditing(null)} 
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Input 
                      label="Client Name" 
                      value={editing.name} 
                      onChange={e => handleChangeEditing('name', e.target.value)} 
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-4">Client Configuration</h4>
                    
                    {/* Configuration Mode Toggle */}
                    <div className="mb-4 p-3 bg-white rounded-md border">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Configuration Mode</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`configMode-${editing.id}`}
                            value="predefined"
                            checked={editing.planConfig.selectedPlanId !== undefined}
                            onChange={() => {
                              setEditing(prev => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  planConfig: {
                                    ...prev.planConfig,
                                    selectedPlanId: ''
                                  }
                                };
                              });
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">Use Predefined Plan Configuration</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`configMode-${editing.id}`}
                            value="manual"
                            checked={editing.planConfig.selectedPlanId === undefined}
                            onChange={() => {
                              setEditing(prev => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  planConfig: {
                                    ...prev.planConfig,
                                    selectedPlanId: undefined
                                  }
                                };
                              });
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">Manual Configuration</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
                        <select 
                          value={editing.planConfig.invoiceType}
                          onChange={e => {
                            const newValue = e.target.value as 'plan' | 'addon';
                            setEditing(prev => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                planConfig: {
                                  ...prev.planConfig,
                                  invoiceType: newValue,
                                  selectedPlanId: prev.planConfig.selectedPlanId !== undefined ? '' : undefined
                                }
                              };
                            });
                          }}
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
                          onChange={e => {
                            const newValue = e.target.value as 'USD' | 'INR';
                            setEditing(prev => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                planConfig: {
                                  ...prev.planConfig,
                                  currency: newValue,
                                  selectedPlanId: prev.planConfig.selectedPlanId !== undefined ? '' : undefined
                                }
                              };
                            });
                          }}
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
                          onChange={e => {
                            const newValue = e.target.value as 'regular' | 'figma';
                            setEditing(prev => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                planConfig: {
                                  ...prev.planConfig,
                                  serviceType: newValue,
                                  selectedPlanId: prev.planConfig.selectedPlanId !== undefined ? '' : undefined
                                }
                              };
                            });
                          }}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="regular">Regular</option>
                          <option value="figma">Figma</option>
                        </select>
                      </div>
                    </div>

                    {/* Predefined Plan Selection - show when selectedPlanId is defined (even if empty string) */}
                    {editing.planConfig.selectedPlanId !== undefined && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Selected {editing.planConfig.invoiceType === 'plan' ? 'Plan' : 'Add-on'}
                        </label>
                        <select 
                          key={`plan-select-${editing.id}-${editing.planConfig.invoiceType}-${editing.planConfig.currency}-${editing.planConfig.serviceType}`}
                          value={editing.planConfig.selectedPlanId || ''}
                          onChange={e => {
                            const planId = e.target.value;
                            // Only update the selectedPlanId - don't modify line items or tax settings
                            setEditing(prev => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                planConfig: {
                                  ...prev.planConfig,
                                  selectedPlanId: planId || ''
                                }
                              };
                            });
                          }}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        >
                          <option value="">Select {editing.planConfig.invoiceType === 'plan' ? 'a plan' : 'an add-on'}...</option>
                          {getAvailablePlans(
                            editing.planConfig.invoiceType, 
                            editing.planConfig.serviceType, 
                            editing.planConfig.currency
                          ).map((plan) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name} ({editing.planConfig.currency === 'USD' ? '$' : '₹'}{plan.basePrice})
                            </option>
                          ))}
                        </select>
                        {editing.planConfig.selectedPlanId && editing.planConfig.selectedPlanId !== '' && (
                          <div className="mt-2 text-sm text-green-700">
                            {(() => {
                              const selectedPlan = getPlanById(
                                editing.planConfig.selectedPlanId, 
                                editing.planConfig.invoiceType, 
                                editing.planConfig.serviceType, 
                                editing.planConfig.currency
                              );
                              return selectedPlan ? (
                                <div>
                                  <p><strong>✓ Selected:</strong> {selectedPlan.name}</p>
                                  <p><strong>Price:</strong> {editing.planConfig.currency === 'USD' ? '$' : '₹'}{selectedPlan.basePrice}</p>
                                  <p><strong>Description:</strong> {selectedPlan.description}</p>
                                  <p><strong>Tax Applicable:</strong> {'taxApplicable' in selectedPlan ? (selectedPlan.taxApplicable ? 'Yes' : 'No') : 'No'}</p>
                                  <p className="mt-1 text-xs">This client will use this predefined configuration with automatic pricing and tax settings.</p>
                                </div>
                              ) : (
                                <p>⚠️ Selected plan not found. Please choose a valid plan.</p>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Manual Tax Configuration - only show if not using predefined plan */}
                    {(editing.planConfig.selectedPlanId === undefined) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">Buyer Details</h4>
                    <div className="space-y-4">
                      {editing.buyer.fields.map((field) => (
                        <div key={field.id} className="flex items-end gap-4">
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
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove field"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={handleAddBuyerFieldToEditing}
                        className="flex items-center gap-2 w-full justify-center px-4 py-3 border border-dashed border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      >
                        <PlusCircle size={18} />
                        Add Buyer Field
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">Default Line Items</h4>
                    
                    {/* Show manual mode info */}
                    {editing.planConfig.selectedPlanId === undefined && (
                      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <h5 className="font-medium text-orange-800 mb-2">Manual Configuration Mode</h5>
                        <div className="text-sm text-orange-700">
                          <p>In manual mode, you have full control over line items, descriptions, rates, and tax settings. Configure everything manually as needed.</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Show predefined plan info in predefined mode */}
                    {editing.planConfig.selectedPlanId !== undefined && (
                      <div key={editing.planConfig.selectedPlanId} className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-3">Predefined Configuration Mode</h5>
                        <div className="text-sm text-blue-700">
                          {(() => {
                            if (!editing.planConfig.selectedPlanId || editing.planConfig.selectedPlanId === '') {
                              return <p>📋 Please select a {editing.planConfig.invoiceType} above to configure this client with predefined settings.</p>;
                            }
                            const selectedPlan = getPlanById(
                              editing.planConfig.selectedPlanId, 
                              editing.planConfig.invoiceType, 
                              editing.planConfig.serviceType, 
                              editing.planConfig.currency
                            );
                            return selectedPlan ? (
                              <p>✓ This client uses predefined configuration: <strong>{selectedPlan.name}</strong> ({editing.planConfig.currency === 'USD' ? '$' : '₹'}{selectedPlan.basePrice}). Line items and tax settings are automatically configured when this client is selected.</p>
                            ) : (
                              <p>⚠️ Selected plan not found. Please choose a valid {editing.planConfig.invoiceType} above.</p>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {getCurrentItems().map(item => (
                        <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
                          {getCurrentItems().length > 0 && (
                            <button 
                              onClick={() => handleRemoveEditingItem(item.id)} 
                              className="absolute top-3 right-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          <div className="pr-10">
                            <Input 
                              label="Description" 
                              value={item.description} 
                              onChange={e => handleEditingItemChange(item.id, 'description', e.target.value)} 
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                              <Input 
                                label="Quantity" 
                                type="number" 
                                value={item.qty} 
                                onChange={e => handleEditingItemChange(item.id, 'qty', Number(e.target.value) || 0)} 
                              />
                              <Input 
                                label="Rate" 
                                type="number" 
                                value={item.rate} 
                                onChange={e => handleEditingItemChange(item.id, 'rate', Number(e.target.value) || 0)} 
                              />
                              <Input 
                                label="Amount" 
                                type="number" 
                                value={item.amount} 
                                readOnly 
                                className="bg-gray-100" 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={handleAddItemToEditing} 
                        className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <PlusCircle size={16} /> Add Line Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">Select a client to edit</p>
                  <p className="text-sm">Choose a client from the list or create a new one to get started.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;