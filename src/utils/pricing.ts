export const CURRENCY_RATES = {
  USD_TO_INR: 87.95,
};

export const PRICING = {
  PRO_MONTHLY: {
    USD: 29,
    INR: 2999,
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
  EXCEPTIONS: {
    PRO_MONTHLY_INR: 3250,
    LAUNCH_MONTHLY_INR: 6999,
  },
};

export type PlanType = 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'LAUNCH_MONTHLY' | 'LAUNCH_ANNUAL';
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