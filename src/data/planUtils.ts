import { PLAN_REGULAR_INR, PlanRegularINR } from './planRegularINR';
import { PLAN_FIGMA_INR, PlanFigmaINR } from './planFigmaINR';
import { ADDON_REGULAR_INR, AddonRegularINR } from './addonRegularINR';
import { PLAN_REGULAR_USD, PlanRegularUSD } from './planRegularUSD';
import { PLAN_FIGMA_USD, PlanFigmaUSD } from './planFigmaUSD';
import { ADDON_REGULAR_USD, AddonRegularUSD } from './addonRegularUSD';

export type ServiceType = 'regular' | 'figma';
export type InvoiceType = 'plan' | 'addon';
export type Currency = 'USD' | 'INR';

export type PlanData = PlanRegularINR | PlanFigmaINR | AddonRegularINR | PlanRegularUSD | PlanFigmaUSD | AddonRegularUSD;

export function getAvailablePlans(
  invoiceType: InvoiceType,
  serviceType: ServiceType,
  currency: Currency
): PlanData[] {
  if (invoiceType === 'plan') {
    if (serviceType === 'regular') {
      return currency === 'USD' ? PLAN_REGULAR_USD : PLAN_REGULAR_INR;
    } else {
      return currency === 'USD' ? PLAN_FIGMA_USD : PLAN_FIGMA_INR;
    }
  } else {
    if (serviceType === 'regular') {
      return currency === 'USD' ? ADDON_REGULAR_USD : ADDON_REGULAR_INR;
    } else {
      // No figma addons for now
      return [];
    }
  }
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

export function calculateTaxForPlan(
  plan: PlanRegularINR,
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
      cgst: plan.cgst || 0,
      sgst: plan.sgst || 0,
      igst: 0,
      total: plan.total
    };
  } else if (taxType === 'other_state') {
    return {
      subtotal: plan.basePrice,
      cgst: 0,
      sgst: 0,
      igst: plan.igst || 0,
      total: plan.total
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