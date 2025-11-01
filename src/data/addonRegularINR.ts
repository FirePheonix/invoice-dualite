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
  originalPrice?: number; // Original price before discount
  discountPrice?: number; // Discounted price
  isDiscounted?: boolean; // Whether this plan has a discount
  discountPercentage?: number; // Discount percentage
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