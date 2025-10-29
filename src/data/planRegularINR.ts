export interface PlanRegularINR {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  igst?: number;
  cgst?: number;
  sgst?: number;
  total: number;
  taxApplicable: boolean;
}

export const PLAN_REGULAR_INR: PlanRegularINR[] = [
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    description: 'Dualite Alpha Pro Plan (Monthly)',
    basePrice: 2541,
    igst: 458,
    cgst: 229,
    sgst: 229,
    total: 2999,
    taxApplicable: true
  },
  {
    id: 'launch-monthly',
    name: 'Launch Monthly',
    description: 'Dualite Launch Plan (Monthly)',
    basePrice: 5931,
    igst: 1068,
    cgst: 534,
    sgst: 534,
    total: 6999,
    taxApplicable: true
  },
  {
    id: 'pro-monthly-discounted',
    name: 'Pro Monthly (Discounted)',
    description: 'Dualite Alpha Pro Plan (Monthly) - Discounted',
    basePrice: 4345,
    igst: 764,
    cgst: 382,
    sgst: 382,
    total: 4999,
    taxApplicable: true
  }
];