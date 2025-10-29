export interface PlanFigmaINR {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  total: number;
  taxApplicable: boolean;
}

export const PLAN_FIGMA_INR: PlanFigmaINR[] = [
  {
    id: 'figma-to-code',
    name: 'Figma to Code',
    description: 'Figma to Code Service',
    basePrice: 1599,
    total: 1599,
    taxApplicable: false
  }
];