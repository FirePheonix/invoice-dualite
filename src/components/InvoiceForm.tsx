import React from 'react';
import { InvoiceData } from '../types/invoice';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import { getPlanPrice, PlanType, PricingVariant, formatPrice } from '../utils/pricing';
import { amountToWords } from 'amount-to-words';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  onDataChange: (updateFn: (prev: InvoiceData) => InvoiceData) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceData, onDataChange }) => {

  const handleChange = (section: keyof InvoiceData, field: string, value: any) => {
    onDataChange(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...(prev[section] as object), [field]: value }
        : value
    }));
  };

  const handleItemChange = (id: number, field: string, value: any) => {
    onDataChange(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleFeatureChange = (itemId: number, featureIndex: number, value: string) => {
    onDataChange(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const newFeatures = [...item.features];
          newFeatures[featureIndex] = value;
          return { ...item, features: newFeatures };
        }
        return item;
      })
    }));
  };

  const handleAddItem = () => {
    onDataChange(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          srNo: prev.items.length + 1,
          description: "New Item",
          subscription: "",
          period: "",
          features: [],
          hsnSac: "",
          gstRate: "NA",
          qty: 1,
          rate: 0,
          per: "Nos",
          amount: 0,
        }
      ]
    }));
  };

  const handleRemoveItem = (id: number) => {
    onDataChange(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <FormSection title="Company Details">
        <Input label="Company Name" value={invoiceData.company.name} onChange={e => handleChange('company', 'name', e.target.value)} />
        <Input label="Address" value={invoiceData.company.address} onChange={e => handleChange('company', 'address', e.target.value)} />
        <Input label="Location" value={invoiceData.company.location} onChange={e => handleChange('company', 'location', e.target.value)} />
        <Input label="GSTIN" value={invoiceData.company.gstin} onChange={e => handleChange('company', 'gstin', e.target.value)} />
        <Input label="State" value={invoiceData.company.state} onChange={e => handleChange('company', 'state', e.target.value)} />
        <Input label="CIN" value={invoiceData.company.cin} onChange={e => handleChange('company', 'cin', e.target.value)} />
        <Input label="Email" value={invoiceData.company.email} onChange={e => handleChange('company', 'email', e.target.value)} />
        <Input label="PAN/IEC" value={invoiceData.company.pan} onChange={e => handleChange('company', 'pan', e.target.value)} />
      </FormSection>

      <FormSection title="Invoice Details">
        <Input label="Invoice No." value={invoiceData.invoice.number} onChange={e => handleChange('invoice', 'number', e.target.value)} />
        <Input label="Invoice Date" value={invoiceData.invoice.date} onChange={e => handleChange('invoice', 'date', e.target.value)} />
        <Input label="Payment Mode" value={invoiceData.invoice.modeOfPayment} onChange={e => handleChange('invoice', 'modeOfPayment', e.target.value)} />
        <Input label="Reference No." value={invoiceData.invoice.reference} onChange={e => handleChange('invoice', 'reference', e.target.value)} />
        <Input label="Reference Date" value={invoiceData.invoice.referenceDate} onChange={e => handleChange('invoice', 'referenceDate', e.target.value)} />
      </FormSection>

      <FormSection title="Quick Pricing">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const planType = e.target.value as PlanType;
                const price = getPlanPrice(planType, invoiceData.currency);
                handleItemChange(invoiceData.items[0]?.id || 1, 'rate', price);
                handleItemChange(invoiceData.items[0]?.id || 1, 'description', 
                  planType === 'PRO_MONTHLY' ? 'Dualite Alpha Pro Plan (Monthly)' :
                  planType === 'PRO_ANNUAL' ? 'Dualite Alpha Pro Plan (Annual)' :
                  planType === 'LAUNCH_MONTHLY' ? 'Dualite Launch Plan (Monthly)' :
                  'Dualite Launch Plan (Annual)'
                );
              }}
            >
              <option value="">Select a plan...</option>
              <option value="PRO_MONTHLY">Pro Monthly ({formatPrice(getPlanPrice('PRO_MONTHLY', invoiceData.currency))})</option>
              <option value="PRO_ANNUAL">Pro Annual ({formatPrice(getPlanPrice('PRO_ANNUAL', invoiceData.currency))})</option>
              <option value="LAUNCH_MONTHLY">Launch Monthly ({formatPrice(getPlanPrice('LAUNCH_MONTHLY', invoiceData.currency))})</option>
              <option value="LAUNCH_ANNUAL">Launch Annual ({formatPrice(getPlanPrice('LAUNCH_ANNUAL', invoiceData.currency))})</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Variant</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const variant = e.target.value as PricingVariant;
                // Get current plan type from the item description or default to PRO_MONTHLY
                const currentItem = invoiceData.items[0];
                let planType: PlanType = 'PRO_MONTHLY';
                if (currentItem?.description.includes('Launch')) {
                  planType = currentItem.description.includes('Annual') ? 'LAUNCH_ANNUAL' : 'LAUNCH_MONTHLY';
                } else if (currentItem?.description.includes('Annual')) {
                  planType = 'PRO_ANNUAL';
                }
                
                const price = getPlanPrice(planType, invoiceData.currency, variant);
                handleItemChange(currentItem?.id || 1, 'rate', price);
              }}
            >
              <option value="STANDARD">Standard</option>
              <option value="DISCOUNTED">Discounted</option>
              <option value="EXCEPTION">Exception</option>
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          <p>Select a plan to automatically set the price based on current currency ({invoiceData.currency})</p>
        </div>
      </FormSection>

      <FormSection title="Buyer Details">
        <Input label="Buyer Name" value={invoiceData.buyer.name} onChange={e => handleChange('buyer', 'name', e.target.value)} />
        <Input label="Address" value={invoiceData.buyer.address} onChange={e => handleChange('buyer', 'address', e.target.value)} />
        <Input label="Country" value={invoiceData.buyer.country} onChange={e => handleChange('buyer', 'country', e.target.value)} />
        <Input label="State" value={invoiceData.buyer.state} onChange={e => handleChange('buyer', 'state', e.target.value)} />
        <Input label="State Code" value={invoiceData.buyer.stateCode} onChange={e => handleChange('buyer', 'stateCode', e.target.value)} />
        <Input label="Email" value={invoiceData.buyer.email} onChange={e => handleChange('buyer', 'email', e.target.value)} />
        <Input label="Buyer ID" value={invoiceData.buyer.id} onChange={e => handleChange('buyer', 'id', e.target.value)} />
      </FormSection>

      <FormSection title="Line Items">
        {invoiceData.items.map((item) => (
          <div key={item.id} className="p-4 border rounded-md space-y-4 relative bg-gray-50">
            <h4 className="font-medium text-gray-800">Item #{item.srNo}</h4>
            {invoiceData.items.length > 1 && (
              <button onClick={() => handleRemoveItem(item.id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors">
                <Trash2 size={16} />
              </button>
            )}
            <Input label="Description" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} />
            <Input label="Subscription" value={item.subscription} onChange={e => handleItemChange(item.id, 'subscription', e.target.value)} />
            <Input label="Period" value={item.period} onChange={e => handleItemChange(item.id, 'period', e.target.value)} />
            {item.features.map((feature, index) => (
              <Input key={index} label={`Feature ${index + 1}`} value={feature} onChange={e => handleFeatureChange(item.id, index, e.target.value)} />
            ))}
            <Input label="HSN/SAC" value={item.hsnSac} onChange={e => handleItemChange(item.id, 'hsnSac', e.target.value)} />
            <Input label="GST Rate" value={item.gstRate} onChange={e => handleItemChange(item.id, 'gstRate', e.target.value)} />
            <div className="grid grid-cols-3 gap-4">
              <Input label="Quantity" type="number" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || 0)} />
              <Input label="Rate" type="number" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)} />
              <Input label="Amount" type="number" value={item.amount} readOnly className="bg-gray-100" />
            </div>
          </div>
        ))}
        <button onClick={handleAddItem} className="flex items-center gap-2 w-full justify-center px-4 py-2 border border-dashed border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
          <PlusCircle size={18} />
          Add Item
        </button>
      </FormSection>

      <FormSection title="Summary">
        <Input label="Gross Amount" type="number" value={invoiceData.summary.grossAmount} readOnly className="bg-gray-100" />
        <Input label="CGST" value={invoiceData.summary.cgst} onChange={e => handleChange('summary', 'cgst', e.target.value)} />
        <Input label="IGST" value={invoiceData.summary.igst} onChange={e => handleChange('summary', 'igst', e.target.value)} />
        <Input label="Total" type="number" value={invoiceData.summary.total} readOnly className="bg-gray-100" />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Amount in Words (Auto-calculated)</label>
          <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-600 min-h-[40px] flex items-center">
            {(() => {
              try {
                const result = amountToWords(invoiceData.summary.total, 2);
                const currencyPrefix = invoiceData.currency === 'USD' ? 'USD ' : 'INR ';
                const mainAmount = result.numberInWords || 'Zero';
                const decimal = result.decimalInWords && result.decimalInWords !== 'Zero' ? ' And ' + result.decimalInWords + ' Paise' : '';
                return currencyPrefix + mainAmount + decimal + ' Only';
              } catch (error) {
                return `${invoiceData.currency} ${invoiceData.summary.total} (auto-calculated)`;
              }
            })()}
          </div>
        </div>
      </FormSection>

      <FormSection title="Bank & Declaration">
        <Input label="Account Holder" value={invoiceData.bankDetails.holderName} onChange={e => handleChange('bankDetails', 'holderName', e.target.value)} />
        <Input label="Bank Name" value={invoiceData.bankDetails.bankName} onChange={e => handleChange('bankDetails', 'bankName', e.target.value)} />
        <Input label="Account Number" value={invoiceData.bankDetails.accountNumber} onChange={e => handleChange('bankDetails', 'accountNumber', e.target.value)} />
        <Input label="Branch & IFS" value={invoiceData.bankDetails.branchIfs} onChange={e => handleChange('bankDetails', 'branchIfs', e.target.value)} />
        <Textarea label="Declaration" value={invoiceData.declaration} onChange={e => handleChange('declaration', '', e.target.value)} />
        <Input label="For Company" value={invoiceData.signatory.for} onChange={e => handleChange('signatory', 'for', e.target.value)} />
        <Input label="Signatory Title" value={invoiceData.signatory.title} onChange={e => handleChange('signatory', 'title', e.target.value)} />
      </FormSection>
    </div>
  );
};

const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <details className="space-y-4 group" open>
    <summary className="text-lg font-semibold cursor-pointer list-none">
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
            <span>{title}</span>
            <svg className="w-5 h-5 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
    </summary>
    <div className="pt-4 space-y-4 border-t">{children}</div>
  </details>
);

export default InvoiceForm;
