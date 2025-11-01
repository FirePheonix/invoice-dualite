export interface AddonRegularINR {
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

export const ADDON_REGULAR_INR: AddonRegularINR[] = [
  {
    id: '50-messages-topup',
    name: '50 Messages Top Up',
    description: 'Dualite Alpha Pro Plan',
    subscription: '50 Messages Top-Up',
    period: '',
    features: [''],
    hsnSac: '998313',
    gstRate: 'NA',
    basePrice: 999,
    total: 999,
    taxApplicable: false
  }
];