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
    basePrice: 1599,
    total: 1599,
    taxApplicable: false
  }
];