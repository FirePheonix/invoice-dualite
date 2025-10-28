import { InvoiceData } from '../types/invoice';

export const createInitialInvoiceData = (type: 'plan' | 'addon', currency: 'USD' | 'INR' = 'USD'): InvoiceData => {
  return {
    type,
    currency,
    company: {
      name: "Dualite Technology Private Ltd.",
      address: "29-1, Kewal Raj Singhvi Marg",
      location: "Light Industrial Area, Jodhpur, Rajasthan,342003",
      gstin: "08AAJCD1232H1ZW",
      state: "State Name : Rajasthan, Code : 08",
      cin: "U72900RJ2022PTC080011",
      email: "rohan@dualite.dev; prakhar@dualite.dev",
      pan: "AAJCD1232H",
    },
    invoice: {
      number: type === 'addon' ? "DTPL-ADDON/25-26/A00073" : "DTPL/25-26/A00073",
      date: "16 Aug, 2025",
      modeOfPayment: "Paypal",
      reference: "3VJ380822M7765403",
      referenceDate: "16 Aug, 2025",
    },
    buyer: {
      name: "Mitchell Newby",
      address: "2900 Phoenix dr Killeen tx, 76543",
      country: "United States",
      state: "Texas",
      stateCode: "97",
      email: "scraftstudio@gmail.com",
      id: "9674b405-12dd-4613-9496-d88353585ee9",
    },
    items: [
      {
        id: 1,
        srNo: 1,
        description: type === 'addon' ? "Dualite Alpha Pro Plan" : "Dualite Alpha Pro Plan",
        subscription: type === 'addon' ? "" : "Pro-Monthly",
        period: type === 'addon' ? "" : "3 October, 2025 to 3 November, 2025",
        features: type === 'addon' 
          ? ["300 Messages, Top-up"] 
          : ["200 messages", "Figma Import", "Github Import", "Premium e-mail support"],
        hsnSac: "998313",
        gstRate: "NA",
        qty: 1,
        rate: 39,
        per: "Nos",
        amount: 39,
      },
    ],
    summary: {
      grossAmount: 39,
      cgst: "-",
      sgst: "-",
      igst: "-",
      total: 39,
      applyTax: false,
      taxType: 'no_tax' as const,
    },
    bankDetails: {
      holderName: "Dualite Technology Private Limited",
      bankName: "HDFC Bank Account",
      accountNumber: "59209314027777",
      branchIfs: "JODHPUR & HDFC0000142",
    },
    declaration: "We declare that this invoice shows the actual price of the services described and that all particulars are true and correct.",
    signatory: {
      for: "For Dualite Technology Private Limited",
      title: "Authorized Signatory",
    },
  };
};

export const initialInvoiceData: InvoiceData = createInitialInvoiceData('plan');
