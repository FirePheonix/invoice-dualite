export interface AddonRegularINR {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  total: number;
  taxApplicable: boolean;
}

export const ADDON_REGULAR_INR: AddonRegularINR[] = [
  {
    id: '50-messages-topup',
    name: '50 Messages Top Up',
    description: '50 Messages Top Up',
    basePrice: 999,
    total: 999,
    taxApplicable: false
  }
];