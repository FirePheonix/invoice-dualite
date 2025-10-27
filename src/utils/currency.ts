export const formatCurrency = (amount: number, currency: 'USD' | 'INR'): string => {
  if (currency === 'USD') {
    return `$${amount}`;
  } else {
    return `₹${amount}`;
  }
};

export const getCurrencySymbol = (currency: 'USD' | 'INR'): string => {
  return currency === 'USD' ? '$' : '₹';
};