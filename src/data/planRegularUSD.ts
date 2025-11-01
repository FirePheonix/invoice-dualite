export interface PlanRegularUSD {
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

export const PLAN_REGULAR_USD: PlanRegularUSD[] = [
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    description: 'Dualite Alpha Pro Plan',
    subscription: 'Pro Monthly',
    period: '',
    features: ['200 messages', 'Figma support', 'Github Import','Premium e-mail support'],
    hsnSac: '998313',
    gstRate: 'NA',
    basePrice: 29,
    total: 29,
    taxApplicable: false
  },
  {
    id: 'launch-monthly',
    name: 'Launch Monthly(Disounted)',
    description: 'Dualite Alpha Pro Plan',
    subscription: 'Launch Monthly',
    period: '28 September, 2025 to 28 October, 2025',
    features: ['Unlimited messages', 'Figma Import', 'Github Import', 'Dedicated manager'],
    hsnSac: '998313',
    gstRate: 'NA',
    originalPrice: 79,
    discountPrice: 49,
    basePrice: 49,
    isDiscounted: true,
    discountPercentage: 38,
    total: 49,
    taxApplicable: false
  },
  {
    id: 'pro-monthly-advanced',
    name: 'Launch Monthly',
    description: 'Dualite Alpha Pro Plan',
    subscription: 'Launch Monthly',
    period: '',
    features: ['Unlimited messages', 'Figma Import', 'Github Import', 'Dedicated manager'],
    hsnSac: '998313',
    gstRate: 'NA',
    basePrice: 79,
    total: 79,
    taxApplicable: false
  }
];