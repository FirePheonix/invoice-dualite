export interface PlanFigmaUSD {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  total: number;
  taxApplicable: boolean;
}

export const PLAN_FIGMA_USD: PlanFigmaUSD[] = [
  {
    id: 'figma-to-code',
    name: 'Figma to Code',
    description: 'Figma to Code Service',
    basePrice: 19,
    total: 19,
    taxApplicable: false
  }
];