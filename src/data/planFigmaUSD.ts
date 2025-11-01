export interface PlanFigmaUSD {
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

export const PLAN_FIGMA_USD: PlanFigmaUSD[] = [
  {
    id: 'figma-to-code-discounted',
    name: 'Figma to Code Discounted',
    description: 'Dualite Pro Plan',
    subscription: 'Pro Monthly',
    period: '',
    features: ['Unlimited Projects', '24x7 Premium Slack Support', 'Weekly 4 hours developer support'],
    hsnSac: '998313',
    gstRate: 'NA',
    originalPrice: 35, // Original price before discount
    discountPrice: 19, // Discounted price
    basePrice: 19, // What we actually charge (same as discountPrice)
    isDiscounted: true,
    discountPercentage: 34, // (29-19)/29 * 100
    total: 19,
    taxApplicable: false
  }
];