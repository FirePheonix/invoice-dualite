import React, { useEffect, useState } from 'react';
import { InvoiceData, InvoiceItem } from '../types/invoice';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { PlusCircle, Trash2, Edit3 } from 'lucide-react';

// New Client type that stores complete invoice data
interface Client {
  id: string;
  name: string; // Display name for the client
  invoiceData: InvoiceData; // Complete invoice form data
}

// Simple localStorage functions for clients
const getClients = (): Client[] => {
  try {
    const stored = localStorage.getItem('invoice-clients');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveClients = (clients: Client[]) => {
  localStorage.setItem('invoice-clients', JSON.stringify(clients));
};

const generateClientId = () => {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

interface ClientsPageProps {
  onSelectClient: (invoiceData: InvoiceData) => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ onSelectClient }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [editing, setEditing] = useState<Client | null>(null);

  useEffect(() => {
    setClients(getClients());
  }, []);

  const createDefaultInvoiceData = (): InvoiceData => ({
    type: 'plan',
    currency: 'USD',
    company: {
      name: 'Dualite Software Private Limited',
      address: '4th Floor, RBI Apartment, Green Park',
      location: 'Alwar, Rajasthan 301001',
      gstin: '08ABFCD1234A1Z5',
      state: 'Rajasthan, Code : 08',
      cin: 'U72200RJ2023PTC087291',
      email: 'info@dualite.com',
      pan: 'ABFCD1234A'
    },
    invoice: {
      number: 'INV-001',
      date: new Date().toISOString().split('T')[0],
      modeOfPayment: 'Online Transfer',
      reference: 'REF-001',
      referenceDate: new Date().toISOString().split('T')[0]
    },
    buyer: {
      fields: [
        { id: 'name', label: 'Buyer Name', value: 'New Client' },
        { id: 'address', label: 'Address', value: '' },
        { id: 'country', label: 'Country', value: '' },
        { id: 'state', label: 'State', value: '' },
        { id: 'stateCode', label: 'State Code', value: '' },
        { id: 'email', label: 'Email', value: '' },
        { id: 'id', label: 'Buyer ID', value: generateClientId() }
      ]
    },
    items: [
      {
        id: 1,
        srNo: 1,
        description: "Dualite Alpha Pro Plan",
        subscription: "Monthly Subscription",
        period: "1 Month",
        features: ["AI-powered development", "Premium support", "Advanced features"],
        hsnSac: "998313",
        gstRate: "18%",
        qty: 1,
        rate: 49,
        per: "Nos",
        amount: 49
      }
    ],
    summary: {
      grossAmount: 49,
      cgst: "₹0.00",
      sgst: "₹0.00", 
      igst: "₹0.00",
      total: 49,
      applyTax: false,
      taxType: 'no_tax'
    },
    bankDetails: {
      holderName: 'Dualite Software Private Limited',
      bankName: 'HDFC Bank',
      accountNumber: '1234567890123',
      branchIfs: 'HDFC0001234'
    },
    declaration: 'We declare that this invoice shows the actual price of the services described and that all particulars are true and correct.',
    signatory: {
      for: 'Dualite Software Private Limited',
      title: 'Authorized Signatory'
    }
  });

  const handleNew = () => {
    const newClient: Client = {
      id: generateClientId(),
      name: 'New Client',
      invoiceData: createDefaultInvoiceData()
    };
    setEditing(newClient);
  };

  const handleDelete = (id: string) => {
    const updatedClients = clients.filter(c => c.id !== id);
    setClients(updatedClients);
    saveClients(updatedClients);
  };

  const handleSaveEdit = (client: Client) => {
    const updatedClients = clients.some(c => c.id === client.id)
      ? clients.map(c => c.id === client.id ? client : c)
      : [...clients, client];
    
    setClients(updatedClients);
    saveClients(updatedClients);
    setEditing(null);
  };

  // Helper functions for updating invoice data
  const updateInvoiceData = (section: keyof InvoiceData, field: string, value: any) => {
    if (!editing) return;
    
    setEditing({
      ...editing,
      invoiceData: {
        ...editing.invoiceData,
        [section]: typeof editing.invoiceData[section] === 'object' && editing.invoiceData[section] !== null
          ? { ...(editing.invoiceData[section] as object), [field]: value }
          : value
      }
    });
  };

  const updateBuyerField = (fieldId: string, property: 'label' | 'value', newValue: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      invoiceData: {
        ...editing.invoiceData,
        buyer: {
          ...editing.invoiceData.buyer,
          fields: editing.invoiceData.buyer.fields.map(field => 
            field.id === fieldId ? { ...field, [property]: newValue } : field
          )
        }
      }
    });
  };

  const addBuyerField = () => {
    if (!editing) return;
    const newFieldId = `field_${Date.now()}`;
    setEditing({
      ...editing,
      invoiceData: {
        ...editing.invoiceData,
        buyer: {
          ...editing.invoiceData.buyer,
          fields: [...editing.invoiceData.buyer.fields, {
            id: newFieldId,
            label: 'New Field',
            value: ''
          }]
        }
      }
    });
  };

  const removeBuyerField = (fieldId: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      invoiceData: {
        ...editing.invoiceData,
        buyer: {
          ...editing.invoiceData.buyer,
          fields: editing.invoiceData.buyer.fields.filter(field => field.id !== fieldId)
        }
      }
    });
  };

  const updateItem = (itemId: number, field: string, value: any) => {
    if (!editing) return;
    setEditing({
      ...editing,
      invoiceData: {
        ...editing.invoiceData,
        items: editing.invoiceData.items.map(item => {
          if (item.id === itemId) {
            const updated = { ...item, [field]: value };
            if (field === 'qty' || field === 'rate') {
              const qty = field === 'qty' ? Number(value) : Number(item.qty);
              const rate = field === 'rate' ? Number(value) : Number(item.rate);
              updated.amount = (qty || 0) * (rate || 0);
            }
            return updated;
          }
          return item;
        })
      }
    });
  };

  const addItem = () => {
    if (!editing) return;
    const newItem: InvoiceItem = {
      id: Date.now(),
      srNo: editing.invoiceData.items.length + 1,
      description: 'New Item',
      subscription: '',
      period: '',
      features: [],
      hsnSac: '998313',
      gstRate: '18%',
      qty: 1,
      rate: 0,
      per: 'Nos',
      amount: 0
    };
    
    setEditing({
      ...editing,
      invoiceData: {
        ...editing.invoiceData,
        items: [...editing.invoiceData.items, newItem]
      }
    });
  };

  const removeItem = (itemId: number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      invoiceData: {
        ...editing.invoiceData,
        items: editing.invoiceData.items.filter(item => item.id !== itemId)
          .map((item, index) => ({ ...item, srNo: index + 1 }))
      }
    });
  };

  const updateFeature = (itemId: number, featureIndex: number, value: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      invoiceData: {
        ...editing.invoiceData,
        items: editing.invoiceData.items.map(item => {
          if (item.id === itemId) {
            const newFeatures = [...item.features];
            newFeatures[featureIndex] = value;
            return { ...item, features: newFeatures };
          }
          return item;
        })
      }
    });
  };

  const addFeature = (itemId: number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      invoiceData: {
        ...editing.invoiceData,
        items: editing.invoiceData.items.map(item => {
          return item.id === itemId 
            ? { ...item, features: [...item.features, 'New Feature'] }
            : item;
        })
      }
    });
  };

  const removeFeature = (itemId: number, featureIndex: number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      invoiceData: {
        ...editing.invoiceData,
        items: editing.invoiceData.items.map(item => {
          if (item.id === itemId) {
            const newFeatures = [...item.features];
            newFeatures.splice(featureIndex, 1);
            return { ...item, features: newFeatures };
          }
          return item;
        })
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
                      onClick={() => onSelectClient(c.invoiceData)}
                      className="text-left flex-1"
                      title="Select this client to autofill entire invoice"
                    >
                      <div className="font-medium text-gray-900">{c.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {c.invoiceData.buyer.fields.find(f => f.id === 'name')?.value || 'No buyer name'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {c.invoiceData.currency} • {c.invoiceData.type} • Items: {c.invoiceData.items.length}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Total: {c.invoiceData.currency === 'USD' ? '$' : '₹'}{c.invoiceData.summary.total}
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
                  <h3 className="text-lg font-semibold">
                    {clients.some(c => c.id === editing.id) ? 'Edit Client' : 'New Client'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveEdit(editing)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Client
                    </button>
                    <button 
                      onClick={() => setEditing(null)} 
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="space-y-6 max-h-[80vh] overflow-y-auto">
                  {/* Client Name */}
                  <div>
                    <Input 
                      label="Client Display Name" 
                      value={editing.name} 
                      onChange={e => setEditing({...editing, name: e.target.value})} 
                    />
                  </div>

                  {/* Invoice Type and Currency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
                      <select 
                        value={editing.invoiceData.type}
                        onChange={e => updateInvoiceData('type', '', e.target.value as 'plan' | 'addon')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="plan">Plan</option>
                        <option value="addon">Add-on</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select 
                        value={editing.invoiceData.currency}
                        onChange={e => updateInvoiceData('currency', '', e.target.value as 'USD' | 'INR')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="USD">USD</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  </div>

                  {/* Company Details */}
                  <FormSection title="Company Details">
                    <Input label="Company Name" value={editing.invoiceData.company.name} onChange={e => updateInvoiceData('company', 'name', e.target.value)} />
                    <Input label="Address" value={editing.invoiceData.company.address} onChange={e => updateInvoiceData('company', 'address', e.target.value)} />
                    <Input label="Location" value={editing.invoiceData.company.location} onChange={e => updateInvoiceData('company', 'location', e.target.value)} />
                    <Input label="GSTIN" value={editing.invoiceData.company.gstin} onChange={e => updateInvoiceData('company', 'gstin', e.target.value)} />
                    <Input label="State" value={editing.invoiceData.company.state} onChange={e => updateInvoiceData('company', 'state', e.target.value)} />
                    <Input label="CIN" value={editing.invoiceData.company.cin} onChange={e => updateInvoiceData('company', 'cin', e.target.value)} />
                    <Input label="Email" value={editing.invoiceData.company.email} onChange={e => updateInvoiceData('company', 'email', e.target.value)} />
                    <Input label="PAN/IEC" value={editing.invoiceData.company.pan} onChange={e => updateInvoiceData('company', 'pan', e.target.value)} />
                  </FormSection>

                  {/* Invoice Details */}
                  <FormSection title="Invoice Details">
                    <Input label="Invoice No." value={editing.invoiceData.invoice.number} onChange={e => updateInvoiceData('invoice', 'number', e.target.value)} />
                    <Input label="Invoice Date" value={editing.invoiceData.invoice.date} onChange={e => updateInvoiceData('invoice', 'date', e.target.value)} />
                    <Input label="Payment Mode" value={editing.invoiceData.invoice.modeOfPayment} onChange={e => updateInvoiceData('invoice', 'modeOfPayment', e.target.value)} />
                    <Input label="Reference No." value={editing.invoiceData.invoice.reference} onChange={e => updateInvoiceData('invoice', 'reference', e.target.value)} />
                    <Input label="Reference Date" value={editing.invoiceData.invoice.referenceDate} onChange={e => updateInvoiceData('invoice', 'referenceDate', e.target.value)} />
                  </FormSection>

                  {/* Buyer Details */}
                  <FormSection title="Buyer Details">
                    {editing.invoiceData.buyer.fields.map((field) => (
                      <div key={field.id} className="flex items-end gap-4">
                        <div className="flex-1">
                          <Input 
                            label={field.label} 
                            value={field.value} 
                            onChange={e => updateBuyerField(field.id, 'value', e.target.value)} 
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={e => updateBuyerField(field.id, 'label', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Field label"
                          />
                        </div>
                        <button
                          onClick={() => removeBuyerField(field.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove field"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addBuyerField}
                      className="flex items-center gap-2 w-full justify-center px-4 py-3 border border-dashed border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      <PlusCircle size={18} />
                      Add Buyer Field
                    </button>
                  </FormSection>

                  {/* Line Items */}
                  <FormSection title="Line Items">
                    {editing.invoiceData.items.map((item) => (
                      <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium text-gray-700">Item #{item.srNo}</h5>
                          {editing.invoiceData.items.length > 1 && (
                            <button 
                              onClick={() => removeItem(item.id)} 
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input 
                            label="Description" 
                            value={item.description} 
                            onChange={e => updateItem(item.id, 'description', e.target.value)} 
                          />
                          <Input 
                            label="Subscription" 
                            value={item.subscription} 
                            onChange={e => updateItem(item.id, 'subscription', e.target.value)} 
                          />
                          <Input 
                            label="Period" 
                            value={item.period} 
                            onChange={e => updateItem(item.id, 'period', e.target.value)} 
                          />
                          <Input 
                            label="HSN/SAC" 
                            value={item.hsnSac} 
                            onChange={e => updateItem(item.id, 'hsnSac', e.target.value)} 
                          />
                          <Input 
                            label="GST Rate" 
                            value={item.gstRate} 
                            onChange={e => updateItem(item.id, 'gstRate', e.target.value)} 
                          />
                          <Input 
                            label="Per" 
                            value={item.per} 
                            onChange={e => updateItem(item.id, 'per', e.target.value)} 
                          />
                          <Input 
                            label="Quantity" 
                            type="number" 
                            value={item.qty} 
                            onChange={e => updateItem(item.id, 'qty', Number(e.target.value) || 0)} 
                          />
                          <Input 
                            label="Rate" 
                            type="number" 
                            value={item.rate} 
                            onChange={e => updateItem(item.id, 'rate', Number(e.target.value) || 0)} 
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                          <div className="space-y-2">
                            {item.features.map((feature, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={feature}
                                  onChange={e => updateFeature(item.id, index, e.target.value)}
                                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Feature description"
                                />
                                <button
                                  onClick={() => removeFeature(item.id, index)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                  title="Remove feature"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addFeature(item.id)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <PlusCircle size={14} />
                              Add Feature
                            </button>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded border">
                          <Input 
                            label="Amount (Auto-calculated)" 
                            type="number" 
                            value={item.amount} 
                            readOnly 
                            className="bg-gray-100" 
                          />
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={addItem} 
                      className="flex items-center gap-2 w-full justify-center px-4 py-3 border border-dashed border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      <PlusCircle size={18} />
                      Add Line Item
                    </button>
                  </FormSection>

                  {/* Summary & Tax */}
                  <FormSection title="Summary & Tax">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Gross Amount" type="number" value={editing.invoiceData.summary.grossAmount} onChange={e => updateInvoiceData('summary', 'grossAmount', Number(e.target.value) || 0)} />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apply Tax</label>
                        <select 
                          value={editing.invoiceData.summary.applyTax ? 'true' : 'false'}
                          onChange={e => updateInvoiceData('summary', 'applyTax', e.target.value === 'true')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="false">No Tax</option>
                          <option value="true">Apply Tax</option>
                        </select>
                      </div>
                      {editing.invoiceData.summary.applyTax && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tax Type</label>
                          <select 
                            value={editing.invoiceData.summary.taxType}
                            onChange={e => updateInvoiceData('summary', 'taxType', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="no_tax">No Tax</option>
                            <option value="rajasthan">Rajasthan (CGST + SGST)</option>
                            <option value="other_state">Other State (IGST)</option>
                          </select>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input label="CGST" value={editing.invoiceData.summary.cgst} onChange={e => updateInvoiceData('summary', 'cgst', e.target.value)} />
                      <Input label="SGST" value={editing.invoiceData.summary.sgst} onChange={e => updateInvoiceData('summary', 'sgst', e.target.value)} />
                      <Input label="IGST" value={editing.invoiceData.summary.igst} onChange={e => updateInvoiceData('summary', 'igst', e.target.value)} />
                      <Input label="Total" type="number" value={editing.invoiceData.summary.total} onChange={e => updateInvoiceData('summary', 'total', Number(e.target.value) || 0)} />
                    </div>
                  </FormSection>

                  {/* Bank Details */}
                  <FormSection title="Bank Details">
                    <Input label="Account Holder" value={editing.invoiceData.bankDetails.holderName} onChange={e => updateInvoiceData('bankDetails', 'holderName', e.target.value)} />
                    <Input label="Bank Name" value={editing.invoiceData.bankDetails.bankName} onChange={e => updateInvoiceData('bankDetails', 'bankName', e.target.value)} />
                    <Input label="Account Number" value={editing.invoiceData.bankDetails.accountNumber} onChange={e => updateInvoiceData('bankDetails', 'accountNumber', e.target.value)} />
                    <Input label="Branch & IFS" value={editing.invoiceData.bankDetails.branchIfs} onChange={e => updateInvoiceData('bankDetails', 'branchIfs', e.target.value)} />
                  </FormSection>

                  {/* Declaration & Signatory */}
                  <FormSection title="Declaration & Signatory">
                    <Textarea label="Declaration" value={editing.invoiceData.declaration} onChange={e => updateInvoiceData('declaration', '', e.target.value)} />
                    <Input label="For Company" value={editing.invoiceData.signatory.for} onChange={e => updateInvoiceData('signatory', 'for', e.target.value)} />
                    <Input label="Signatory Title" value={editing.invoiceData.signatory.title} onChange={e => updateInvoiceData('signatory', 'title', e.target.value)} />
                  </FormSection>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">Select a client to edit</p>
                  <p className="text-sm">Choose a client from the list or create a new one to get started.</p>
                  <p className="text-xs mt-4 text-blue-600">
                    💡 Clients store complete invoice data - when selected, they'll autofill ALL form sections
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// FormSection component for collapsible sections
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <details className="space-y-4 group" open>
    <summary className="text-lg font-semibold cursor-pointer list-none">
      <div className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 border border-gray-200">
        <span>{title}</span>
        <svg className="w-5 h-5 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </summary>
    <div className="pt-4 pb-2 px-4 space-y-4 border-l-2 border-blue-200 ml-4">
      {children}
    </div>
  </details>
);

export default ClientsPage;