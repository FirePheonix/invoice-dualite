export interface PlanRegularUSD {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  total: number;
  taxApplicable: boolean;
}

export const PLAN_REGULAR_USD: PlanRegularUSD[] = [
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    description: 'Dualite Alpha Pro Plan (Monthly)',
    basePrice: 29,
    total: 29,
    taxApplicable: false
  },
  {
    id: 'launch-monthly',
    name: 'Launch Monthly',
    description: 'Dualite Launch Plan (Monthly)',
    basePrice: 79,
    total: 79,
    taxApplicable: false
  },
  {
    id: 'pro-monthly-discounted',
    name: 'Pro Monthly (Discounted)',
    description: 'Dualite Alpha Pro Plan (Monthly) - Discounted',
    basePrice: 49,
    total: 49,
    taxApplicable: false
  }
];