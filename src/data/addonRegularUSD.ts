export interface AddonRegularUSD {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  total: number;
  taxApplicable: boolean;
}

export const ADDON_REGULAR_USD: AddonRegularUSD[] = [
  {
    id: '300-messages-topup',
    name: '300 Messages Top Up',
    description: '300 Messages Top Up',
    basePrice: 39,
    total: 39,
    taxApplicable: false
  },
  {
    id: '50-messages-topup',
    name: '50 Messages Top Up',
    description: '50 Messages Top Up',
    basePrice: 9,
    total: 9,
    taxApplicable: false
  },
  {
    id: '100-messages-topup',
    name: '100 Messages Top Up',
    description: '100 Messages Top Up',
    basePrice: 15,
    total: 15,
    taxApplicable: false
  }
];