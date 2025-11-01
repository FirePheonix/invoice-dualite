import { PLAN_REGULAR_INR, PlanRegularINR } from './planRegularINR';
import { PLAN_FIGMA_INR, PlanFigmaINR } from './planFigmaINR';
import { ADDON_REGULAR_INR, AddonRegularINR } from './addonRegularINR';
import { PLAN_REGULAR_USD, PlanRegularUSD } from './planRegularUSD';
import { PLAN_FIGMA_USD, PlanFigmaUSD } from './planFigmaUSD';
import { ADDON_REGULAR_USD, AddonRegularUSD } from './addonRegularUSD';

export type ServiceType = 'regular' | 'figma';
export type InvoiceType = 'plan' | 'addon';
export type Currency = 'USD' | 'INR';

// Custom plan interface that extends the base plan types
export interface CustomPlan {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  total: number;
  taxApplicable: boolean;
  category: string;
  currency: Currency;
  serviceType: ServiceType;
  invoiceType: InvoiceType;
  // Optional tax fields (for INR plans)
  cgst?: number;
  sgst?: number;
  igst?: number;
}

export type PlanData = PlanRegularINR | PlanFigmaINR | AddonRegularINR | PlanRegularUSD | PlanFigmaUSD | AddonRegularUSD | CustomPlan;

// Helper function to get custom plans from localStorage
function getCustomPlans(): CustomPlan[] {
  try {
    const stored = localStorage.getItem('custom-plans');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getAvailablePlans(
  invoiceType: InvoiceType,
  serviceType: ServiceType,
  currency: Currency
): PlanData[] {
  // Get predefined plans
  let predefinedPlans: PlanData[] = [];
  
  if (invoiceType === 'plan') {
    if (serviceType === 'regular') {
      predefinedPlans = currency === 'USD' ? PLAN_REGULAR_USD : PLAN_REGULAR_INR;
    } else {
      predefinedPlans = currency === 'USD' ? PLAN_FIGMA_USD : PLAN_FIGMA_INR;
    }
  } else {
    if (serviceType === 'regular') {
      predefinedPlans = currency === 'USD' ? ADDON_REGULAR_USD : ADDON_REGULAR_INR;
    } else {
      // No figma addons for now
      predefinedPlans = [];
    }
  }

  // Get custom plans that match the criteria
  const customPlans = getCustomPlans().filter(
    plan => plan.invoiceType === invoiceType && 
            plan.serviceType === serviceType && 
            plan.currency === currency
  );

  // Combine predefined and custom plans
  return [...predefinedPlans, ...customPlans];
}

export function getPlanById(
  planId: string,
  invoiceType: InvoiceType,
  serviceType: ServiceType,
  currency: Currency
): PlanData | undefined {
  const plans = getAvailablePlans(invoiceType, serviceType, currency);
  return plans.find(plan => plan.id === planId);
}

// Alternative function to get plan by ID without needing other parameters (searches all custom plans)
export function getCustomPlanById(planId: string): CustomPlan | undefined {
  const customPlans = getCustomPlans();
  return customPlans.find(plan => plan.id === planId);
}

export function calculateTaxForPlan(
  plan: PlanData,
  taxType: 'rajasthan' | 'other_state' | 'no_tax',
  applyTax: boolean
): {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
} {
  if (!applyTax || !plan.taxApplicable) {
    return {
      subtotal: plan.basePrice,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: plan.basePrice
    };
  }

  if (taxType === 'rajasthan') {
    return {
      subtotal: plan.basePrice,
      cgst: (plan as any).cgst || 0,
      sgst: (plan as any).sgst || 0,
      igst: 0,
      total: plan.total || plan.basePrice
    };
  } else if (taxType === 'other_state') {
    return {
      subtotal: plan.basePrice,
      cgst: 0,
      sgst: 0,
      igst: (plan as any).igst || 0,
      total: plan.total || plan.basePrice
    };
  } else {
    return {
      subtotal: plan.basePrice,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: plan.basePrice
    };
  }
}

export function formatTaxAmount(amount: number, _currency: Currency): string {
  return amount.toString();
}