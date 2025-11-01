export interface AddonRegularUSD {
  id: string;
  name: string;
  description: string;
  subscription?: string;
  period?: string;
  features?: string[];
  hsnSac?: string;
  gstRate?: string;
  basePrice: number;
  total: number;
  taxApplicable: boolean;
}

export const ADDON_REGULAR_USD: AddonRegularUSD[] = [
  {
    id: '300-messages-topup',
    name: '300 Messages Top Up',
    description: 'Dualite Alpha Pro Plan',
    subscription: '300 Messages Top-Up',
    period: '',
    features: [''],
    hsnSac: '998313',
    gstRate: 'NA',
    basePrice: 39,
    total: 39,
    taxApplicable: false
  },
  {
    id: '50-messages-topup',
    name: '50 Messages Top Up',
    description: 'Dualite Alpha Pro Plan',
    subscription: '50 Messages Top-Up',
    period: '',
    features: [''],
    hsnSac: '998313',
    gstRate: 'NA',
    basePrice: 9,
    total: 9,
    taxApplicable: false
  },
  {
    id: '100-messages-topup',
    name: '100 Messages Top Up',
    description: 'Dualite Alpha Pro Plan',
    subscription: '100 Messages Top-Up',
    period: '',
    features: [''],
    hsnSac: '998313',
    gstRate: 'NA',
    basePrice: 15,
    total: 15,
    taxApplicable: false
  }
];