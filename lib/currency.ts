// Supported currencies with their symbols and locales
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB', flag: '🇬🇧' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', locale: 'en-NG', flag: '🇳🇬' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', locale: 'en-KE', flag: '🇰🇪' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', locale: 'en-GH', flag: '🇬🇭' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', locale: 'en-ZA', flag: '🇿🇦' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU', flag: '🇦🇺' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP', flag: '🇯🇵' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN', flag: '🇮🇳' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN', flag: '🇨🇳' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', locale: 'pt-BR', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', locale: 'es-MX', flag: '🇲🇽' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE', flag: '🇦🇪' },
];

// Get currency by code
export const getCurrency = (code: string): Currency => {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
};

// Format amount with currency
export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  const currency = getCurrency(currencyCode);
  
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
};

// Format with just symbol (for compact displays)
export const formatCurrencyCompact = (amount: number, currencyCode: string = 'USD'): string => {
  const currency = getCurrency(currencyCode);
  return `${currency.symbol}${amount.toFixed(2)}`;
};

// Get currency symbol only
export const getCurrencySymbol = (currencyCode: string = 'USD'): string => {
  return getCurrency(currencyCode).symbol;
};
