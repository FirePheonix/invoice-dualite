export const CURRENCY_RATES = {
  USD_TO_INR: 87.95,
};

export const TAX_RATES = {
  GST_RATE: 0.18, // 18% GST
  CGST_RATE: 0.09, // 9% CGST (half of 18%)
  SGST_RATE: 0.09, // 9% SGST (half of 18%)
  IGST_RATE: 0.18, // 18% IGST (full 18%)
};

export const RAJASTHAN_STATE_CODE = "08";

export const HARDCODED_TAX_VALUES = {
  PRO_MONTHLY_INR: {
    BASE_AMOUNT: 2542,
    RAJASTHAN: {
      CGST: 229, // 457/2 = 228.5 rounded to 229
      SGST: 229, // 457/2 = 228.5 rounded to 229
      IGST: 0,
      TOTAL: 3000, // 2542 + 229 + 229
    },
    OTHER_STATE: {
      CGST: 0,
      SGST: 0,
      IGST: 457, // 2999 - 2542 = 457
      TOTAL: 2999, // 2542 + 457
    },
    NO_TAX: {
      CGST: 0,
      SGST: 0,
      IGST: 0,
      TOTAL: 2542, // Just base amount
    }
  },
  PLAN_4235: {
    BASE_AMOUNT: 4235, // Base amount is 4235
    RAJASTHAN: {
      CGST: 381, // 762/2 = 381
      SGST: 381, // 762/2 = 381
      IGST: 0,
      TOTAL: 4997, // 4235 + 381 + 381
    },
    OTHER_STATE: {
      CGST: 0,
      SGST: 0,
      IGST: 762,
      TOTAL: 4997, // 4235 + 762
    },
    NO_TAX: {
      CGST: 0,
      SGST: 0,
      IGST: 0,
      TOTAL: 4235, // Just base amount
    }
  },
  PLAN_5931: {
    BASE_AMOUNT: 5931, // Base amount is 5931
    RAJASTHAN: {
      CGST: 534, // 1068/2 = 534
      SGST: 534, // 1068/2 = 534
      IGST: 0,
      TOTAL: 6999, // 5931 + 534 + 534
    },
    OTHER_STATE: {
      CGST: 0,
      SGST: 0,
      IGST: 1068,
      TOTAL: 6999, // 5931 + 1068
    },
    NO_TAX: {
      CGST: 0,
      SGST: 0,
      IGST: 0,
      TOTAL: 5931, // Just base amount
    }
  }
};

export const PRICING = {
  PRO_MONTHLY: {
    USD: 29,
    INR: 2542, // Base amount before tax (2999/1.18 = 2542)
    USD_EXCEPTION: 39,
  },
  PRO_ANNUAL: {
    USD: 279,
    INR: 29999,
  },
  LAUNCH_MONTHLY: {
    USD: 79,
    INR: 7999,
    DISCOUNTED_USD: 49,
    DISCOUNTED_INR: 4999,
  },
  LAUNCH_ANNUAL: {
    USD: 759,
    INR: 76999,
    DISCOUNTED_USD: 599,
    DISCOUNTED_INR: 59999,
  },
  PLAN_4235: {
    USD: 48, // Approximate USD equivalent (4235/87.95)
    INR: 4235, // Base amount (4235 is the base, tax is added on top)
  },
  PLAN_5931: {
    USD: 67, // Approximate USD equivalent (5931/87.95)  
    INR: 5931, // Base amount (5931 is the base, tax is added on top)
  },
  EXCEPTIONS: {
    PRO_MONTHLY_INR: 3250,
    LAUNCH_MONTHLY_INR: 6999,
  },
};

export type PlanType = 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'LAUNCH_MONTHLY' | 'LAUNCH_ANNUAL' | 'PLAN_4235' | 'PLAN_5931';
export type PricingVariant = 'STANDARD' | 'DISCOUNTED' | 'EXCEPTION';

export const getPlanPrice = (
  planType: PlanType,
  currency: 'USD' | 'INR',
  variant: PricingVariant = 'STANDARD'
): number => {
  if (variant === 'EXCEPTION') {
    if (planType === 'PRO_MONTHLY' && currency === 'INR') {
      return PRICING.EXCEPTIONS.PRO_MONTHLY_INR;
    }
    if (planType === 'LAUNCH_MONTHLY' && currency === 'INR') {
      return PRICING.EXCEPTIONS.LAUNCH_MONTHLY_INR;
    }
    if (planType === 'PRO_MONTHLY' && currency === 'USD') {
      return PRICING.PRO_MONTHLY.USD_EXCEPTION;
    }
  }
  
  if (variant === 'DISCOUNTED') {
    if (planType === 'LAUNCH_MONTHLY') {
      const launchMonthly = PRICING.LAUNCH_MONTHLY;
      return currency === 'USD' ? launchMonthly.DISCOUNTED_USD : launchMonthly.DISCOUNTED_INR;
    }
    if (planType === 'LAUNCH_ANNUAL') {
      const launchAnnual = PRICING.LAUNCH_ANNUAL;
      return currency === 'USD' ? launchAnnual.DISCOUNTED_USD : launchAnnual.DISCOUNTED_INR;
    }
  }
  
  const plan = PRICING[planType];
  return plan[currency];
};

export const formatPrice = (amount: number): string => {
  if (amount >= 1000) {
    return amount.toLocaleString();
  }
  return amount.toString();
};

export const convertCurrency = (amount: number, fromCurrency: 'USD' | 'INR', toCurrency: 'USD' | 'INR'): number => {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'USD' && toCurrency === 'INR') {
    return Math.round(amount * CURRENCY_RATES.USD_TO_INR);
  }
  
  if (fromCurrency === 'INR' && toCurrency === 'USD') {
    return Math.round(amount / CURRENCY_RATES.USD_TO_INR);
  }
  
  return amount;
};

export interface TaxCalculation {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  isRajasthan: boolean;
}

export const calculateTaxWithType = (taxType: 'rajasthan' | 'other_state' | 'no_tax', applyTax: boolean, currency: 'USD' | 'INR', planType: 'PRO_MONTHLY_INR' | 'PLAN_4235' | 'PLAN_5931' = 'PRO_MONTHLY_INR'): TaxCalculation => {
  // No tax for USD or when tax is disabled
  if (currency === 'USD' || !applyTax) {
    const baseAmount = currency === 'USD' ? 29 : HARDCODED_TAX_VALUES[planType].BASE_AMOUNT;
    return {
      subtotal: baseAmount,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: baseAmount,
      isRajasthan: false,
    };
  }

  // Use hardcoded values for INR with tax
  const taxData = HARDCODED_TAX_VALUES[planType];
  
  switch (taxType) {
    case 'rajasthan':
      return {
        subtotal: taxData.BASE_AMOUNT,
        cgst: taxData.RAJASTHAN.CGST,
        sgst: taxData.RAJASTHAN.SGST,
        igst: 0,
        total: taxData.RAJASTHAN.TOTAL,
        isRajasthan: true,
      };
      
    case 'other_state':
      return {
        subtotal: taxData.BASE_AMOUNT,
        cgst: 0,
        sgst: 0,
        igst: taxData.OTHER_STATE.IGST,
        total: taxData.OTHER_STATE.TOTAL,
        isRajasthan: false,
      };
      
    case 'no_tax':
    default:
      return {
        subtotal: taxData.BASE_AMOUNT,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: taxData.NO_TAX.TOTAL,
        isRajasthan: false,
      };
  }
};

export const formatTaxAmount = (amount: number, currency: 'USD' | 'INR'): string => {
  if (amount === 0) return '-';
  return `${currency === 'USD' ? '$' : '₹'}${formatPrice(amount)}`;
};

export const detectPlanTypeFromDescription = (description: string): 'PRO_MONTHLY_INR' | 'PLAN_4235' | 'PLAN_5931' => {
  if (description.includes('₹4,235') || description.includes('4235')) {
    return 'PLAN_4235';
  } else if (description.includes('₹5,931') || description.includes('5931')) {
    return 'PLAN_5931';
  } else {
    return 'PRO_MONTHLY_INR'; // Default fallback
  }
};