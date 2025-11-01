export interface PlanRegularINR {
  id: string;
  name: string;
  description: string;
  subscription?: string;
  period?: string;
  features?: string[];
  hsnSac?: string;
  gstRate?: string;
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
    description: 'Dualite Alpha Pro Plan',
    subscription: 'Pro-Monthly',
    period: '',
    features: ['200 messages', 'Figma support', 'Github Import','Premium e-mail support'],
    hsnSac: '998313',
    gstRate: 'NA',
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
    description: 'Dualite Alpha Pro Plan',
    subscription: 'Launch-Monthly',
    period: '',
    features: ['Unlimited messages', 'Figma Import', 'Github Import', 'Dedicated Manager'],
    hsnSac: '998313',
    gstRate: 'NA',
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
    description: 'Dualite Alpha Pro Plan',
    subscription: 'Pro-Monthly',
    period: '',
    features: ['Unlimited messages', 'Figma Import', 'Github Import', 'Dedicated Manager'],
    hsnSac: '998313',
    gstRate: 'NA',
    basePrice: 4345,
    igst: 764,
    cgst: 382,
    sgst: 382,
    total: 4999,
    taxApplicable: true
  }
];