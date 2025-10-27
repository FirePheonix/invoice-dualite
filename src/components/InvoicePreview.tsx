import { useState, useEffect, useRef, forwardRef } from 'react';
import { InvoiceData, InvoiceItem } from '../types/invoice';
import InvoicePage from './InvoicePage';

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
}

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(({ invoiceData }, ref) => {
  const [paginatedItems, setPaginatedItems] = useState<InvoiceItem[][]>([invoiceData.items]);
  
  const measurementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measureAndPaginate = () => {
      if (!measurementRef.current) return;

      const PAGE_CONTENT_HEIGHT = 842 - 64; // 842px A4 height, 32px top/bottom padding (p-8)

      const headerEl = measurementRef.current.querySelector('.measurement-header') as HTMLElement;
      const buyerEl = measurementRef.current.querySelector('.measurement-buyer') as HTMLElement;
      const tableHeadEl = measurementRef.current.querySelector('.measurement-table-head') as HTMLElement;
      const footerEl = measurementRef.current.querySelector('.measurement-footer') as HTMLElement;
      const itemEls = measurementRef.current.querySelectorAll('.measurement-item');

      if (!headerEl || !buyerEl || !tableHeadEl || !footerEl) return;

      const headerHeight = headerEl.offsetHeight;
      const buyerHeight = buyerEl.offsetHeight;
      const tableHeadHeight = tableHeadEl.offsetHeight;
      const footerHeight = footerEl.offsetHeight;
      const itemHeights = Array.from(itemEls).map(el => (el as HTMLElement).offsetHeight);

      const pages: InvoiceItem[][] = [];
      let currentPageItems: InvoiceItem[] = [];
      let currentPageHeight = 0;

      // First page setup
      let availableHeight = PAGE_CONTENT_HEIGHT - headerHeight - buyerHeight - tableHeadHeight;
      
      invoiceData.items.forEach((item, index) => {
        const itemHeight = itemHeights[index];

        // Check if the current item plus the footer can fit on the current page
        if (currentPageHeight + itemHeight + footerHeight <= availableHeight) {
          currentPageItems.push(item);
          currentPageHeight += itemHeight;
        } else {
          // Page is full, push current items and start a new page
          pages.push(currentPageItems);
          currentPageItems = [item];
          
          // Subsequent pages have more space (no main header/buyer info)
          availableHeight = PAGE_CONTENT_HEIGHT - tableHeadHeight;
          currentPageHeight = itemHeight;

          // Edge case: if the very first item on a new page + footer overflows, it must go on this page anyway.
          if (itemHeight + footerHeight > availableHeight) {
             // This can be handled by allowing page to overflow slightly or adjusting logic.
             // For now, we assume an item + footer fits on an empty page.
          }
        }
      });

      // Add the last page
      if (currentPageItems.length > 0) {
        pages.push(currentPageItems);
      }

      setPaginatedItems(pages.length > 0 ? pages : [[]]);
    };

    // Use a timeout to ensure DOM is fully rendered before measuring
    const timer = setTimeout(measureAndPaginate, 100);
    return () => clearTimeout(timer);

  }, [invoiceData]);

  return (
    <>
      {/* Visible paginated output */}
      <div ref={ref} className="space-y-8">
        {paginatedItems.map((items, pageIndex) => (
          <InvoicePage
            key={pageIndex}
            invoiceData={invoiceData}
            items={items}
            pageNumber={pageIndex + 1}
            totalPages={paginatedItems.length}
          />
        ))}
      </div>

      {/* Hidden container for measurements */}
      <div ref={measurementRef} className="measurement-container">
        <div className="A4-page bg-white p-8 font-montserrat">
           <div className="measurement-header">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-start">
                        <img src="/assets/logo-dualite.png" alt="" className="h-16 w-16 mr-4 object-contain" />
                        <div>
                        <p className="font-bold text-xxs">{invoiceData.company.name}</p>
                        <p className="w-40">{invoiceData.company.address}</p>
                        <p className="w-48">{invoiceData.company.location}</p>
                        <br />
                        <p>GSTIN/UIN: {invoiceData.company.gstin}</p>
                        <p>{invoiceData.company.state}</p>
                        <p>CIN: {invoiceData.company.cin}</p>
                        <p>E-Mail : {invoiceData.company.email}</p>
                        <p>Company's PAN/IEC: {invoiceData.company.pan}</p>
                        </div>
                    </div>
                    <div className="text-right text-xxs">
                        <p className="font-normal">Invoice No.</p>
                        <p className="font-bold mb-2">{invoiceData.invoice.number}</p>
                        <p className="font-normal">Dated</p>
                        <p className="font-bold mb-2">{invoiceData.invoice.date}</p>
                    </div>
                </div>
           </div>
           <div className="measurement-buyer text-xxs mb-4">
                <p>Buyer (Bill to)</p>
                <p className="font-bold">{invoiceData.buyer.name}</p>
           </div>
           <div className="measurement-table-head border-t border-black text-xxs">
                <div className="grid grid-cols-12 gap-2 font-normal text-center py-1 border-b border-black">
                    <div className="col-span-1 text-left">Sr.No</div>
                    <div className="col-span-4 text-left">Description</div>
                </div>
           </div>
           <div>
            {invoiceData.items.map((item) => (
                <div key={item.id} className="measurement-item grid grid-cols-12 gap-2 items-start py-2 text-xxs">
                    <div className="col-span-1 text-center">{item.srNo}</div>
                    <div className="col-span-4">
                        <p>{item.description}</p>
                        <p>{item.subscription}</p>
                        <p className="my-2">{item.period}</p>
                        {item.features.map((feature, i) => <p key={i}>{feature}</p>)}
                    </div>
                </div>
            ))}
           </div>
           <div className="measurement-footer text-xxs">
                <div className="flex justify-end mt-2">
                    <div className="w-1/2">
                        <div className="flex justify-between font-bold border-t border-black pt-1">
                        <span>Total</span>
                        <span>{invoiceData.summary.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-auto">
                    <div className="flex justify-between">
                        <div>
                            <p className="font-medium">Declaration</p>
                            <p className="w-64">{invoiceData.declaration}</p>
                        </div>
                        <div className="text-left">
                            <p>Company's Bank Details</p>
                        </div>
                    </div>
                </div>
           </div>
        </div>
      </div>
    </>
  );
});

export default InvoicePreview;
