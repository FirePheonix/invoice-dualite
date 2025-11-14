import React, { useMemo } from 'react';
import { InvoiceData } from '../types/invoice';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import { amountToWords } from 'amount-to-words';
import { getAvailablePlans, getPlanById, calculateTaxForPlan, formatTaxAmount } from '../data/planUtils';
import { PlanRegularINR } from '../data/planRegularINR';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  onDataChange: (updateFn: (prev: InvoiceData) => InvoiceData) => void;
  serviceType?: 'regular' | 'figma';
  onServiceTypeChange?: (serviceType: 'regular' | 'figma') => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  invoiceData, 
  onDataChange, 
  serviceType: externalServiceType, 
  onServiceTypeChange 
}) => {
  const [internalServiceType, setInternalServiceType] = React.useState<'regular' | 'figma'>('regular');
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>('');
  
  // Use external service type if provided, otherwise use internal
  const serviceType = externalServiceType || internalServiceType;
  
  // Reset service type when currency or invoice type changes
  React.useEffect(() => {
    if (onServiceTypeChange) {
      onServiceTypeChange('regular');
    } else {
      setInternalServiceType('regular');
    }
    // Clear selected plan when currency or invoice type changes
    setSelectedPlanId('');
  }, [invoiceData.currency, invoiceData.type, onServiceTypeChange]);
  
  // Get current plan based on the first item's rate and description
  const currentPlan = useMemo(() => {
    const firstItem = invoiceData.items[0];
    if (!firstItem) return null;
    
    const availablePlans = getAvailablePlans(invoiceData.type, serviceType, invoiceData.currency);
    return availablePlans.find(plan => 
      plan.basePrice === firstItem.rate || 
      plan.description === firstItem.description
    ) || null;
  }, [invoiceData.items[0]?.rate, invoiceData.items[0]?.description, invoiceData.type, serviceType, invoiceData.currency]);

  // Handle service type change and recalculate everything
  const handleServiceTypeChange = (newServiceType: 'regular' | 'figma') => {
    if (onServiceTypeChange) {
      onServiceTypeChange(newServiceType);
    } else {
      setInternalServiceType(newServiceType);
    }
    
    // Clear current plan selection when switching service types
    setSelectedPlanId('');
    if (invoiceData.items[0]) {
      // Reset the first item price and amount when switching service types so preview updates predictably
      handleItemChange(invoiceData.items[0].id, 'rate', 0);
      handleItemChange(invoiceData.items[0].id, 'amount', 0);
      handleItemChange(invoiceData.items[0].id, 'description', 'Select a plan');
      // Reset tax settings
      handleChange('summary', 'applyTax', false);
      handleChange('summary', 'taxType', 'no_tax');
    }
  };

  // Only recalculate totals when manually editing items (not when using plan selection)
  React.useEffect(() => {
    // Skip automatic recalculation if we have a selected plan - use plan values instead
    if (selectedPlanId) return;

    const updatedItems = invoiceData.items.map(item => ({
      ...item,
      amount: item.qty * item.rate,
    }));

    const grossAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    
    let finalCalculation = {
      subtotal: grossAmount,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: grossAmount
    };

    // If we have a current plan and it supports tax
    if (currentPlan && 'taxApplicable' in currentPlan && currentPlan.taxApplicable && invoiceData.summary.applyTax) {
      const planRegularINR = currentPlan as PlanRegularINR;
      finalCalculation = calculateTaxForPlan(planRegularINR, invoiceData.summary.taxType as any, invoiceData.summary.applyTax);
    }

    // Create a debounced update to prevent rapid-fire updates
    const timeoutId = setTimeout(() => {
      onDataChange(prev => ({
        ...prev,
        items: updatedItems,
        summary: {
          ...prev.summary,
          grossAmount: finalCalculation.subtotal,
          cgst: formatTaxAmount(finalCalculation.cgst, invoiceData.currency),
          sgst: formatTaxAmount(finalCalculation.sgst, invoiceData.currency),
          igst: formatTaxAmount(finalCalculation.igst, invoiceData.currency),
          total: finalCalculation.total,
        }
      }));
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [
    // Only depend on the values that actually matter for calculations
    invoiceData.items.map(item => `${item.qty}-${item.rate}`).join(','),
    invoiceData.summary.applyTax,
    invoiceData.summary.taxType,
    currentPlan?.id,
    invoiceData.currency,
    onDataChange,
    selectedPlanId  // Add selectedPlanId to dependencies so it skips when plan is selected
  ]);

  // Handle plan selection
  const handlePlanSelection = (planId: string, type: 'plan' | 'addon') => {
    if (!planId) {
      setSelectedPlanId('');
      return;
    }

    const plan = getPlanById(planId, type, serviceType, invoiceData.currency);
    if (!plan) return;

    // Update selected plan state so dropdown shows the selection
    setSelectedPlanId(planId);

    // Update the first item and summary in a single onDataChange call with values directly from plan
    onDataChange(prev => {
      const firstItemId = prev.items[0]?.id ?? 1;
      const newItems = prev.items.map(item => {
        if (item.id !== firstItemId) return item;

        const qty = item.qty || 1;
        
        // For discounted plans, show original price in Rate/Amount, but use discounted price for calculations
        let rate, amount;
        if ('isDiscounted' in plan && plan.isDiscounted && plan.originalPrice) {
          // Show original price in Rate and Amount columns
          rate = plan.originalPrice;
          amount = qty * plan.originalPrice;
        } else {
          // Regular pricing
          rate = plan.basePrice ?? item.rate;
          amount = qty * rate;
        }
        
        // For tax-applicable plans (INR), use the plan's total as amount, otherwise use qty * rate
        if ('total' in plan && plan.total && 'taxApplicable' in plan && plan.taxApplicable) {
          amount = plan.total; // Use the total from plan data (includes tax calculations)
        }

        // Use clean description without discount text
        const fullDescription = plan.description ?? item.description;

        return {
          ...item,
          rate,
          amount,
          description: fullDescription,
          subscription: 'subscription' in plan ? (plan.subscription ?? item.subscription) : item.subscription,
          period: 'period' in plan ? (plan.period ?? item.period) : item.period,
          features: 'features' in plan ? (plan.features ?? item.features) : item.features,
          hsnSac: 'hsnSac' in plan ? (plan.hsnSac ?? item.hsnSac) : item.hsnSac,
          gstRate: 'gstRate' in plan ? (plan.gstRate ?? item.gstRate) : item.gstRate,
        };
      });

      // Update summary with values directly from plan data
      const newSummary = { ...prev.summary };
      
      // For discounted plans, use discounted price as Gross Amount, otherwise use basePrice
      if ('isDiscounted' in plan && plan.isDiscounted && plan.discountPrice) {
        newSummary.grossAmount = plan.discountPrice;
      } else if ('basePrice' in plan) {
        newSummary.grossAmount = plan.basePrice;
      }
      
      // Set tax applicability first
      if ('taxApplicable' in plan) {
        newSummary.applyTax = plan.taxApplicable;
        
        // If tax is applicable, set default tax type to rajasthan, otherwise no_tax
        if (plan.taxApplicable) {
          newSummary.taxType = 'rajasthan'; // Default to Rajasthan
          
          // Apply taxes based on default selection (Rajasthan = CGST + SGST)
          if ('cgst' in plan && 'sgst' in plan) {
            newSummary.cgst = formatTaxAmount(plan.cgst || 0, invoiceData.currency);
            newSummary.sgst = formatTaxAmount(plan.sgst || 0, invoiceData.currency);
            newSummary.igst = formatTaxAmount(0, invoiceData.currency); // Set IGST to 0 for Rajasthan
          }
        } else {
          newSummary.taxType = 'no_tax';
          // No tax - set all to 0 and total = discount price or base price
          newSummary.cgst = formatTaxAmount(0, invoiceData.currency);
          newSummary.sgst = formatTaxAmount(0, invoiceData.currency);
          newSummary.igst = formatTaxAmount(0, invoiceData.currency);
        }
      }
      
      // Set total based on tax type
      if ('total' in plan) {
        if (newSummary.taxType === 'no_tax') {
          // For no tax, total = discount price or base price (without tax)
          if ('isDiscounted' in plan && plan.isDiscounted && plan.discountPrice) {
            newSummary.total = plan.discountPrice;
          } else if ('basePrice' in plan) {
            newSummary.total = plan.basePrice;
          }
        } else {
          // For tax applicable, use plan's total (includes tax)
          newSummary.total = plan.total;
        }
      }

      return { 
        ...prev, 
        items: newItems,
        summary: newSummary
      };
    });
  };

  const handleChange = (section: keyof InvoiceData, field: string, value: any) => {
    onDataChange(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...(prev[section] as object), [field]: value }
        : value
    }));
  };

  // Handle tax type changes to update CGST/SGST/IGST dynamically
  const handleTaxTypeChange = (taxType: string) => {
    // Update the tax type first
    handleChange('summary', 'taxType', taxType);
    
    // If we have a selected plan, update taxes based on the new tax type
    if (selectedPlanId) {
      // Get the plan directly using selectedPlanId to ensure we have the correct plan
      const plan = getPlanById(selectedPlanId, invoiceData.type, serviceType, invoiceData.currency);
      if (!plan || !('taxApplicable' in plan) || !plan.taxApplicable) return;
      
      onDataChange(prev => {
        const newSummary = { ...prev.summary, taxType: taxType as 'rajasthan' | 'other_state' | 'no_tax' };
        
        if (taxType === 'rajasthan' && 'cgst' in plan && 'sgst' in plan) {
          // Rajasthan: Use CGST + SGST, set IGST to 0
          newSummary.cgst = formatTaxAmount(plan.cgst || 0, invoiceData.currency);
          newSummary.sgst = formatTaxAmount(plan.sgst || 0, invoiceData.currency);
          newSummary.igst = formatTaxAmount(0, invoiceData.currency);
        } else if (taxType === 'other_state' && 'igst' in plan) {
          // Other State: Use IGST, set CGST + SGST to 0
          newSummary.cgst = formatTaxAmount(0, invoiceData.currency);
          newSummary.sgst = formatTaxAmount(0, invoiceData.currency);
          newSummary.igst = formatTaxAmount(plan.igst || 0, invoiceData.currency);
        } else if (taxType === 'no_tax') {
          // No Tax: Set all to 0 and total = discount price or base price
          newSummary.cgst = formatTaxAmount(0, invoiceData.currency);
          newSummary.sgst = formatTaxAmount(0, invoiceData.currency);
          newSummary.igst = formatTaxAmount(0, invoiceData.currency);
          
          // Set total to discount price (for discounted plans) or base price (for regular plans)
          if ('isDiscounted' in plan && plan.isDiscounted && plan.discountPrice) {
            newSummary.total = plan.discountPrice;
          } else if ('basePrice' in plan) {
            newSummary.total = plan.basePrice;
          }
        }
        
        return { ...prev, summary: newSummary };
      });
    }
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

  const handleAddFeature = (itemId: number) => {
    onDataChange(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          return { ...item, features: [...item.features, 'New Feature'] };
        }
        return item;
      })
    }));
  };

  const handleRemoveFeature = (itemId: number, featureIndex: number) => {
    onDataChange(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const newFeatures = item.features.filter((_, index) => index !== featureIndex);
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
          features: ["New Feature"],
          hsnSac: "998313",
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

  const handleBuyerFieldChange = (fieldId: string, property: 'label' | 'value', newValue: string) => {
    onDataChange(prev => ({
      ...prev,
      buyer: {
        ...prev.buyer,
        fields: prev.buyer.fields.map(field => 
          field.id === fieldId ? { ...field, [property]: newValue } : field
        )
      }
    }));
  };

  const handleAddBuyerField = () => {
    const newFieldId = `field_${Date.now()}`;
    onDataChange(prev => ({
      ...prev,
      buyer: {
        ...prev.buyer,
        fields: [...prev.buyer.fields, {
          id: newFieldId,
          label: 'New Field',
          value: ''
        }]
      }
    }));
  };

  const handleRemoveBuyerField = (fieldId: string) => {
    onDataChange(prev => ({
      ...prev,
      buyer: {
        ...prev.buyer,
        fields: prev.buyer.fields.filter(field => field.id !== fieldId)
      }
    }));
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      {/* Service Type Toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleServiceTypeChange('regular')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              serviceType === 'regular' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Regular
          </button>
          <button
            onClick={() => handleServiceTypeChange('figma')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              serviceType === 'figma' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Figma
          </button>
        </div>
      </div>
      
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

      {invoiceData.type === 'plan' && (
        <FormSection title="Quick Pricing">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handlePlanSelection(e.target.value, 'plan')}
                value={selectedPlanId}
              >
                <option value="">Select a plan...</option>
                {getAvailablePlans('plan', serviceType, invoiceData.currency).map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ({invoiceData.currency === 'USD' ? '$' : '₹'}{plan.basePrice})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            <p>Select a plan to automatically set the price based on current service type ({serviceType}) and currency ({invoiceData.currency})</p>
          </div>
        </FormSection>
      )}

      {invoiceData.type === 'addon' && (
        <FormSection title="Add-on Pricing">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add-on Type</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handlePlanSelection(e.target.value, 'addon')}
                value={selectedPlanId}
              >
                <option value="">Select an add-on...</option>
                {getAvailablePlans('addon', serviceType, invoiceData.currency).map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ({invoiceData.currency === 'USD' ? '$' : '₹'}{plan.basePrice})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            <p>Select an add-on to automatically set the price based on current service type ({serviceType}) and currency ({invoiceData.currency})</p>
          </div>
        </FormSection>
      )}

      <FormSection title="Buyer Details">
        {invoiceData.buyer.fields.map((field) => (
          <div key={field.id} className="flex items-center gap-2">
            <div className="flex-1">
              <Input 
                label={field.label} 
                value={field.value} 
                onChange={e => handleBuyerFieldChange(field.id, 'value', e.target.value)} 
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
              <input
                type="text"
                value={field.label}
                onChange={e => handleBuyerFieldChange(field.id, 'label', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Field label"
              />
            </div>
            <button
              onClick={() => handleRemoveBuyerField(field.id)}
              className="mt-6 p-2 text-red-500 hover:text-red-700 transition-colors"
              title="Remove field"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          onClick={handleAddBuyerField}
          className="flex items-center gap-2 w-full justify-center px-4 py-2 border border-dashed border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <PlusCircle size={18} />
          Add Buyer Field
        </button>
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
            
            {/* Subscription and Period fields for all types */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Subscription" value={item.subscription} onChange={e => handleItemChange(item.id, 'subscription', e.target.value)} />
              <Input label="Period" value={item.period} onChange={e => handleItemChange(item.id, 'period', e.target.value)} />
            </div>

            {/* Features section with add/remove functionality */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Features</label>
                <button
                  onClick={() => handleAddFeature(item.id)}
                  className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <PlusCircle size={14} />
                  Add Feature
                </button>
              </div>
              {item.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    label={`Feature ${index + 1}`} 
                    value={feature} 
                    onChange={e => handleFeatureChange(item.id, index, e.target.value)} 
                    className="flex-1"
                  />
                  {item.features.length > 1 && (
                    <button
                      onClick={() => handleRemoveFeature(item.id, index)}
                      className="mt-6 p-2 text-red-500 hover:text-red-700 transition-colors"
                      title="Remove feature"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {item.features.length === 0 && (
                <button
                  onClick={() => handleAddFeature(item.id)}
                  className="w-full py-2 px-4 border border-dashed border-gray-300 text-gray-500 rounded-md hover:bg-gray-50 text-sm"
                >
                  Add first feature
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="HSN/SAC" value={item.hsnSac} onChange={e => handleItemChange(item.id, 'hsnSac', e.target.value)} />
              <Input label="GST Rate" value={item.gstRate} onChange={e => handleItemChange(item.id, 'gstRate', e.target.value)} />
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <Input label="Quantity" type="number" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || 0)} />
              <Input label="Rate" type="number" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)} />
              <Input label="Per" value={item.per} onChange={e => handleItemChange(item.id, 'per', e.target.value)} />
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
        
        {/* Tax Application Checker */}
        <div key={`${currentPlan?.id || 'no-plan'}-${invoiceData.items[0]?.description || 'default'}`} className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800">Tax Application</h4>
          
          {currentPlan && 'taxApplicable' in currentPlan && currentPlan.taxApplicable ? (
            <>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="applyTax"
                  checked={invoiceData.summary.applyTax}
                  onChange={(e) => handleChange('summary', 'applyTax', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="applyTax" className="text-sm font-medium text-gray-900">
                  Apply Tax (GST) - {currentPlan && 'total' in currentPlan ? (
                    invoiceData.summary.applyTax ? `Tax Applied: ₹${currentPlan.total}` : `No Tax: ₹${currentPlan.basePrice}`
                  ) : 'Select a plan first'}
                </label>
              </div>

              {invoiceData.summary.applyTax && invoiceData.currency === 'INR' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Tax Type</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="rajasthan"
                        name="taxType"
                        value="rajasthan"
                        checked={invoiceData.summary.taxType === 'rajasthan'}
                        onChange={(e) => handleTaxTypeChange(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="rajasthan" className="ml-2 text-sm text-gray-900">
                        Rajasthan (CGST + SGST) - {currentPlan && 'cgst' in currentPlan && 'sgst' in currentPlan ? (
                          `Base: ₹${currentPlan.basePrice} + CGST: ₹${currentPlan.cgst} + SGST: ₹${currentPlan.sgst} = Total: ₹${currentPlan.total}`
                        ) : 'Tax info unavailable'}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="other_state"
                        name="taxType"
                        value="other_state"
                        checked={invoiceData.summary.taxType === 'other_state'}
                        onChange={(e) => handleTaxTypeChange(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="other_state" className="ml-2 text-sm text-gray-900">
                        Other State (IGST) - {currentPlan && 'igst' in currentPlan ? (
                          `Base: ₹${currentPlan.basePrice} + IGST: ₹${currentPlan.igst} = Total: ₹${currentPlan.total}`
                        ) : 'Tax info unavailable'}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="no_tax"
                        name="taxType"
                        value="no_tax"
                        checked={invoiceData.summary.taxType === 'no_tax'}
                        onChange={(e) => handleTaxTypeChange(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="no_tax" className="ml-2 text-sm text-gray-900">
                        No Tax - Base: ₹{currentPlan.basePrice}
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-600">
              <p>Tax not applicable for this service/plan.</p>
            </div>
          )}
        </div>

        <Input label="CGST" value={invoiceData.summary.cgst} readOnly className="bg-gray-100" />
        <Input label="SGST" value={invoiceData.summary.sgst} readOnly className="bg-gray-100" />
        <Input label="IGST" value={invoiceData.summary.igst} readOnly className="bg-gray-100" />
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
