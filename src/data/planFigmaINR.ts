export interface PlanFigmaINR {
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
  igst?: number;
  cgst?: number;
  sgst?: number;
  total: number;
  taxApplicable: boolean;
}

export const PLAN_FIGMA_INR: PlanFigmaINR[] = [
  {
    id: 'figma-to-code',
    name: 'Figma to Code',
    description: 'Figma to Code Service',
    subscription: 'One-time',
    period: '',
    features: ['Unlimited Projects', '24x7 Premium Slack Support', 'Weekly 4 hours developer support'],
    hsnSac: '998313',
    gstRate: 'NA',
    originalPrice: 2999, // Original price before discount
    discountPrice: 1355, // Discounted price
    basePrice: 1355, // What we actually charge (same as discountPrice)
    isDiscounted: true,
    discountPercentage: 55, // (2999-1355)/2999 * 100 ≈ 55%
    igst: 244, // 18% of 1355
    cgst: 122, // 9% of 1355
    sgst: 122, // 9% of 1355
    total: 1599, // 1355 + 244 (or 1355 + 122 + 122)
    taxApplicable: true
  }
];