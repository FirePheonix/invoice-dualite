import React from 'react';
import { InvoiceData, InvoiceItem } from '../types/invoice';
import { formatCurrency } from '../utils/currency';
import { amountToWords } from 'amount-to-words';

interface InvoicePageProps {
  invoiceData: InvoiceData;
  items: InvoiceItem[];
  pageNumber: number;
  totalPages: number;
}

const InvoicePage: React.FC<InvoicePageProps> = ({ invoiceData, items, pageNumber, totalPages }) => {
  const { company, invoice, buyer, summary, bankDetails, declaration, signatory } = invoiceData;

  const isFirstPage = pageNumber === 1;
  const isLastPage = pageNumber === totalPages;

  return (
    <div className="A4-page bg-white shadow-lg font-montserrat">
      <div className="relative text-xxs leading-tight">
        {isFirstPage && (
          <>
            {/* Header with logo flush top-left */}
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <img src="/assets/logo-dualite.png" alt="Company Logo" className="h-16 w-16 object-contain" />
                <div className="ml-4 flex-1">
                  {/* Company Details Column */}
                  <div className="py-8 space-y-1">
                    <p className="font-bold leading-relaxed">{company.name}</p>
                    <p className="leading-relaxed">{company.address}</p>
                    <p className="leading-relaxed">{company.location}</p>
                    <div className="my-3"></div>
                    <p className="leading-relaxed">GSTIN/UIN: {company.gstin}</p>
                    <p className="leading-relaxed">{company.state}</p>
                    <p className="leading-relaxed">CIN: {company.cin}</p>
                    <p className="leading-relaxed">E-Mail : {company.email}</p>
                    <p className="leading-relaxed">Company's PAN/IEC: {company.pan}</p>
                    
                    {/* Buyer Info in the middle of the company section */}
                    <div className="mt-8 mb-4 space-y-0.5 py-10">
                      <p className="leading-tight">Buyer (Bill to)</p>
                      {buyer.fields.map((field, index) => (
                        field.value.trim() && (
                          <p key={field.id} className={`leading-tight ${index === 0 ? 'font-bold' : 'font-bold text-blue-600'}`}>
                            {field.label === 'State' && buyer.fields.find(f => f.label === 'State Code')?.value.trim() ? 
                              `${field.label}: ${field.value}, Code: ${buyer.fields.find(f => f.label === 'State Code')?.value}` :
                              field.label === 'State Code' ? null : // Skip State Code if already shown with State
                              field.value
                            }
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-left px-14 space-y-1 py-14">
                <p className="font-normal leading-relaxed">Invoice No.</p>
                <p className="font-bold leading-relaxed ">{invoice.number}</p>
                <p className="font-normal leading-relaxed">Dated</p>
                <p className="font-bold leading-relaxed ">{invoice.date}</p>
                <p className="font-normal leading-relaxed">Mode/Terms of Payment</p>
                <p className="font-bold leading-relaxed ">{invoice.modeOfPayment}</p>
                <p className="font-normal leading-relaxed">Reference No. and Date</p>
                <p className="font-bold leading-relaxed">{invoice.reference}/{invoice.referenceDate}</p>
              </div>
            </div>
          </>
        )}
        
        {!isFirstPage && (
            <div className="h-48"> {/* Placeholder for header space on subsequent pages */}
                <p className="text-right font-bold">Invoice No. {invoice.number} (Cont.)</p>
            </div>
        )}

        {/* Items Table */}
        <div className="px-8">
          <div className="grid grid-cols-12 gap- font-normal text-center py-1 border-b border-black">
            <div className="col-span-1 text-left">Sr.No</div>
            <div className="col-span-4 text-left">
              {invoiceData.type === 'addon' ? 'Description of Add-ons' : 'Description of Services'}
            </div>
            <div className="col-span-1">HSN/SAC</div>
            <div className="col-span-1" style={{fontSize: '7.5px'}}>GST RATE</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-1">Rate</div>
            <div className="col-span-1">per</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          <div className={`${!isLastPage ? 'border-b-0' : ''}`}>
            {items.map((item, index) => (
              <div key={item.id} className={`grid grid-cols-12 gap-2 items-start py-3 ${index < items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="col-span-1 text-center">{item.srNo}</div>
                <div className="col-span-4">
                  <div className="font-medium">{item.description}</div>
                  {item.subscription && <div className="font-medium">{item.subscription}</div>}
                  {item.period && <div className="mt-1 mb-2">{item.period}</div>}
                  <div className="space-y-0">
                    {item.features.map((feature, i) => (
                      <div key={i}>{feature}</div>
                    ))}
                  </div>
                </div>
                <div className="col-span-1 text-center">{item.hsnSac}</div>
                <div className="col-span-1 text-center">{item.gstRate}</div>
                <div className="col-span-1 text-center">{item.qty}</div>
                <div className="col-span-1 text-center">{formatCurrency(item.rate, invoiceData.currency)}</div>
                <div className="col-span-1 text-center">{item.per}</div>
                <div className="col-span-2 text-right font-bold">{formatCurrency(item.amount, invoiceData.currency)}</div>
              </div>
            ))}
            
            {isLastPage && (
              <>
                {/* Summary rows aligned with table columns */}
                <div className="grid grid-cols-12 gap-2 py-1 border-t border-black">
                  <div className="col-span-1"></div>
                  <div className="col-span-9 font-bold">Gross Amount(including Discount)</div>
                  <div className="col-span-2 text-right font-bold">{formatCurrency(summary.grossAmount, invoiceData.currency)}</div>
                </div>
                <div className="grid grid-cols-12 gap-2 py-0.2">
                  <div className="col-span-1"></div>
                  <div className="col-span-9 font-bold">CGST</div>
                  <div className="col-span-2 text-right">{summary.cgst}</div>
                </div>
                <div className="grid grid-cols-12 gap-2 py-0.2">
                  <div className="col-span-1"></div>
                  <div className="col-span-9 font-bold">SGST</div>
                  <div className="col-span-2 text-right">{summary.sgst}</div>
                </div>
                <div className="grid grid-cols-12 gap-2 py-1">
                  <div className="col-span-1"></div>
                  <div className="col-span-9 font-bold">IGST</div>
                  <div className="col-span-2 text-right">{summary.igst}</div>
                </div>
                <div className="grid grid-cols-12 gap-2 py-1 border-t border-black">
                  <div className="col-span-1"></div>
                  <div className="col-span-9 font-bold">Total</div>
                  <div className="col-span-2 text-right font-bold">{formatCurrency(summary.total, invoiceData.currency)}</div>
                </div>
              </>
            )}
          </div>
          
          {/* Amount Chargeable section moved inside table container */}
          {isLastPage && (
            <div className="flex justify-between mt-2 px-8">
                <div>
                    <p>Amount Chargeable (In Words)</p>
                    <p className="font-bold">
                      {(() => {
                        try {
                          const result = amountToWords(summary.total, 2);
                          const currencyPrefix = invoiceData.currency === 'USD' ? 'USD ' : 'INR ';
                          const mainAmount = result.numberInWords || 'Zero';
                          const decimal = result.decimalInWords && result.decimalInWords !== 'Zero' ? ' And ' + result.decimalInWords + ' Paise' : '';
                          return currencyPrefix + mainAmount + decimal + ' Only';
                        } catch (error) {
                          console.error('Amount to words conversion error:', error);
                          return `${invoiceData.currency} ${summary.total} (conversion error)`;
                        }
                      })()}
                    </p>
                </div>
                <p className="font-sans">E. & O.E</p>
            </div>
          )}
        </div>
        
        {isLastPage && (
          <>

            {/* Footer */}
            <div className="mt-8 px-8">
                <div className="flex justify-between">
                    <div>
                        <p className="font-medium">Declaration</p>
                        <p className="w-64">{declaration}</p>
                        <br/>
                        <p>{signatory.for}</p>
                        <img src="/assets/signature-rohan.png" alt="Signature" className="h-16 w-36 my-2 object-contain" />
                        <p>{signatory.title}</p>
                    </div>
                    <div className="text-left">
                        <p>Company's Bank Details</p>
                        <p>A/c Holder’s Name: {bankDetails.holderName}</p>
                        <p>Bank Name: {bankDetails.bankName}</p>
                        <p>A/c No.: {bankDetails.accountNumber}</p>
                        <p>Branch & IFS Code: {bankDetails.branchIfs}</p>
                    </div>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InvoicePage;
