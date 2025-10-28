import { useState, useRef, useEffect } from 'react';
import { InvoiceData } from './types/invoice';
import { createInitialInvoiceData } from './data/initialData';
import { getPlanPrice, calculateTaxWithType, formatTaxAmount, detectPlanTypeFromDescription } from './utils/pricing';
import { getNextInvoiceNumber, saveInvoiceToHistory, type StoredInvoice } from './data/invoiceHistory';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import ClientsPanel from './components/ClientsPanel';
import InvoiceHistory from './components/InvoiceHistory';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Plus } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'invoice' | 'history'>('invoice');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'plan' | 'addon'>('plan');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(() => {
    const initial = createInitialInvoiceData(invoiceType, currency);
    // Use the initial number and only increment if it conflicts
    return {
      ...initial,
      invoice: {
        ...initial.invoice,
        number: getNextInvoiceNumber(invoiceType)
      }
    };
  });
  const invoicePreviewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [clientsOpen, setClientsOpen] = useState(false);

  // This effect recalculates totals whenever the source data changes.
  useEffect(() => {
    const updatedItems = invoiceData.items.map(item => ({
      ...item,
      amount: item.qty * item.rate,
    }));

    const grossAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Detect plan type from first item description
    const planType = invoiceData.items.length > 0 ? 
      detectPlanTypeFromDescription(invoiceData.items[0].description) : 
      'PRO_MONTHLY_INR';
    
    // Calculate tax based on tax type and settings
    const taxCalc = calculateTaxWithType(invoiceData.summary.taxType, invoiceData.summary.applyTax, invoiceData.currency, planType);

    // Use a functional update to avoid stale state, but check for actual changes
    // to prevent infinite loops.
    setInvoiceData(prev => {
      const needsUpdate = JSON.stringify(prev.items) !== JSON.stringify(updatedItems) ||
                          prev.summary.grossAmount !== grossAmount ||
                          prev.summary.total !== taxCalc.total;
      if (needsUpdate) {
        return {
          ...prev,
          items: updatedItems,
          summary: {
            ...prev.summary,
            grossAmount: taxCalc.subtotal,
            cgst: formatTaxAmount(taxCalc.cgst, invoiceData.currency),
            sgst: formatTaxAmount(taxCalc.sgst, invoiceData.currency),
            igst: formatTaxAmount(taxCalc.igst, invoiceData.currency),
            total: taxCalc.total,
          },
        };
      }
      return prev;
    });
  }, [invoiceData.items, invoiceData.buyer.stateCode, invoiceData.currency]);


  const handleDataChange = (updateFn: (prev: InvoiceData) => InvoiceData) => {
    setInvoiceData(prevData => {
      const newData = updateFn(prevData);

      const updatedItems = newData.items.map(item => ({
        ...item,
        amount: item.qty * item.rate
      }));

      const grossAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      
      // Detect plan type from first item description
      const planType = newData.items.length > 0 ? 
        detectPlanTypeFromDescription(newData.items[0].description) : 
        'PRO_MONTHLY_INR';
      
      // Calculate tax based on tax type and settings
      const taxCalc = calculateTaxWithType(newData.summary.taxType, newData.summary.applyTax, newData.currency, planType);

      return {
        ...newData,
        items: updatedItems,
        summary: {
          ...newData.summary,
          grossAmount: taxCalc.subtotal,
          cgst: formatTaxAmount(taxCalc.cgst, newData.currency),
          sgst: formatTaxAmount(taxCalc.sgst, newData.currency),
          igst: formatTaxAmount(taxCalc.igst, newData.currency),
          total: taxCalc.total,
        }
      };
    });
  };

  const handleDownloadPdf = async () => {
    const invoiceContainer = invoicePreviewRef.current;
    if (!invoiceContainer) return;

    setIsDownloading(true);
    document.body.classList.add('print-friendly');

    const pageElements = invoiceContainer.querySelectorAll('.A4-page');
    if (pageElements.length === 0) {
        console.error("No pages found to print.");
        setIsDownloading(false);
        return;
    }

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pageElements.length; i++) {
        const pageElement = pageElements[i] as HTMLElement;
        const canvas = await html2canvas(pageElement, {
            scale: 3,
            useCORS: true,
            width: pageElement.offsetWidth,
            height: pageElement.offsetHeight,
        });
        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
            pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    document.body.classList.remove('print-friendly');
    pdf.save(`invoice-${invoiceData.invoice.number}.pdf`);
    
    // Save invoice to history only if it's not already in preview mode
    if (!isPreviewMode) {
      saveInvoiceToHistory(invoiceData);
    }
    
    setIsDownloading(false);
  };

  const handleSelectClient = (client: any, type: 'plan' | 'addon') => {
    const clientItems = type === 'plan' ? client.planItems : client.addonItems;
    handleDataChange(prev => ({
      ...prev,
      buyer: {
        ...prev.buyer,
        ...client.buyer,
      },
      items: clientItems && clientItems.length > 0 ? clientItems : prev.items,
    }));
    setClientsOpen(false);
  };

  const handleInvoiceTypeChange = (type: 'plan' | 'addon') => {
    setInvoiceType(type);
    
    // Don't change the invoice structure if we're in preview mode
    if (isPreviewMode) {
      return;
    }
    
    // Create fresh data for the new invoice type
    const newInvoiceData = createInitialInvoiceData(type, currency);
    setInvoiceData({
      ...newInvoiceData,
      // Preserve some existing data
      company: invoiceData.company,
      buyer: invoiceData.buyer,
      bankDetails: invoiceData.bankDetails,
      declaration: invoiceData.declaration,
      signatory: invoiceData.signatory,
      invoice: {
        ...newInvoiceData.invoice,
        number: getNextInvoiceNumber(type),
        date: invoiceData.invoice.date,
        modeOfPayment: invoiceData.invoice.modeOfPayment,
        reference: invoiceData.invoice.reference,
        referenceDate: invoiceData.invoice.referenceDate,
      }
    });
  };

  const updateItemPricing = (items: any[], currency: 'USD' | 'INR') => {
    return items.map(item => {
      let newRate = item.rate;
      
      // Map subscription types to pricing plans
      if (item.subscription?.toLowerCase().includes('pro-monthly') || item.subscription?.toLowerCase().includes('pro monthly')) {
        newRate = getPlanPrice('PRO_MONTHLY', currency);
      } else if (item.subscription?.toLowerCase().includes('pro-annual') || item.subscription?.toLowerCase().includes('pro annual')) {
        newRate = getPlanPrice('PRO_ANNUAL', currency);
      } else if (item.subscription?.toLowerCase().includes('launch-monthly') || item.subscription?.toLowerCase().includes('launch monthly')) {
        newRate = getPlanPrice('LAUNCH_MONTHLY', currency);
      } else if (item.subscription?.toLowerCase().includes('launch-annual') || item.subscription?.toLowerCase().includes('launch annual')) {
        newRate = getPlanPrice('LAUNCH_ANNUAL', currency);
      }
      
      return {
        ...item,
        rate: newRate,
        amount: item.qty * newRate
      };
    });
  };

  const handleCurrencyChange = (newCurrency: 'USD' | 'INR') => {
    setCurrency(newCurrency);
    handleDataChange(prev => {
      const updatedItems = updateItemPricing(prev.items, newCurrency);
      const grossAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      
      return {
        ...prev,
        currency: newCurrency,
        items: updatedItems,
        summary: {
          ...prev.summary,
          grossAmount,
          total: grossAmount,
        }
      };
    });
  };

  const handleViewInvoice = (storedInvoice: StoredInvoice) => {
    setInvoiceData(storedInvoice.invoiceData);
    setInvoiceType(storedInvoice.invoiceData.type);
    setCurrency(storedInvoice.invoiceData.currency);
    setIsPreviewMode(true); // Set preview mode when viewing existing invoice
    setCurrentView('invoice');
  };

  const handleCreateNew = () => {
    const newInvoiceData = createInitialInvoiceData(invoiceType, currency);
    setInvoiceData({
      ...newInvoiceData,
      invoice: {
        ...newInvoiceData.invoice,
        number: getNextInvoiceNumber(invoiceType)
      }
    });
    setIsPreviewMode(false); // Exit preview mode when creating new invoice
    setCurrentView('invoice');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isPreviewMode ? `Invoice Preview - ${invoiceData.invoice.number}` : 'Invoice Generator'}
            </h1>
            
            {!isPreviewMode && (
              /* View Toggle */
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('invoice')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'invoice' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Create
                </button>
                <button
                  onClick={() => setCurrentView('history')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'history' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  History
                </button>
              </div>
            )}

            {currentView === 'invoice' && (
              <>
                {/* Invoice Type Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleInvoiceTypeChange('plan')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      invoiceType === 'plan' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Plan
                  </button>
                  <button
                    onClick={() => handleInvoiceTypeChange('addon')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      invoiceType === 'addon' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Add-on
                  </button>
                </div>
                
                {/* Currency Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleCurrencyChange('USD')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currency === 'USD' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => handleCurrencyChange('INR')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currency === 'INR' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    INR
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {isPreviewMode && (
              <button 
                onClick={() => setCurrentView('history')}
                className="px-3 py-2 bg-gray-50 border rounded text-sm hover:bg-gray-100 transition-colors"
              >
                ← Back to History
              </button>
            )}
            
            {currentView === 'history' && !isPreviewMode && (
              <button 
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={16} />
                New Invoice
              </button>
            )}
            
            {currentView === 'invoice' && (
              <>
                {!isPreviewMode && (
                  <button onClick={() => setClientsOpen(true)} className="px-3 py-2 bg-gray-50 border rounded text-sm">Clients</button>
                )}
                
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Download size={18} />
                  {isDownloading ? 'Downloading...' : (isPreviewMode ? 'Download This Invoice' : 'Download PDF')}
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'invoice' ? (
          isPreviewMode ? (
            // Preview mode - show only the invoice preview centered
            <div className="flex justify-center">
              <div className="max-w-4xl w-full">
                <InvoicePreview ref={invoicePreviewRef} invoiceData={invoiceData} />
              </div>
            </div>
          ) : (
            // Edit mode - show form and preview side by side
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <InvoiceForm invoiceData={invoiceData} onDataChange={handleDataChange} />
              </div>
              <div className="lg:col-span-3">
                 <div className="sticky top-24">
                    <InvoicePreview ref={invoicePreviewRef} invoiceData={invoiceData} />
                 </div>
              </div>
            </div>
          )
        ) : (
          <InvoiceHistory onInvoiceSelect={handleViewInvoice} />
        )}
      </main>
      <ClientsPanel 
        open={clientsOpen} 
        onClose={() => setClientsOpen(false)} 
        onSelectClient={handleSelectClient} 
        invoiceType={invoiceType}
      />
    </div>
  );
}

export default App;
