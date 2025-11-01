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
  total: number;
  taxApplicable: boolean;
}

export const PLAN_FIGMA_USD: PlanFigmaUSD[] = [
  {
    id: 'figma-to-code',
    name: 'Figma to Code',
    description: 'Figma to Code Service',
    subscription: 'One-time',
    period: '',
    features: ['Unlimited Projects', '24x7 Premium Slack Support', 'Weekly 4 hours developer support'],
    hsnSac: '998313',
    gstRate: 'NA',
    basePrice: 19,
    total: 19,
    taxApplicable: false
  }
];