// Currency formatting helpers shared across the Costly application.
// Internally and in stored data we always use the currency codes
// USD / ILS / GBP / EURO exactly. These helpers are for display only.

const CURRENCY_SYMBOLS = {
  USD: '$',
  ILS: '₪',
  GBP: '£',
  EURO: '€',
}

// Intl.NumberFormat needs a real ISO 4217 code; EURO is our internal
// label for the euro so it must be mapped to "EUR" for formatting.
const INTL_CURRENCY_CODES = {
  USD: 'USD',
  ILS: 'ILS',
  GBP: 'GBP',
  EURO: 'EUR',
}

// Returns the display symbol for a supported currency code.
export function getCurrencySymbol(currencyCode) {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode
}

/**
 * Formats a numeric amount as a currency string using Intl.NumberFormat,
 * e.g. formatCurrency(1234.5, 'ILS') -> "₪1,234.50"
 */
export function formatCurrency(amount, currencyCode = 'USD') {
  const isoCode = INTL_CURRENCY_CODES[currencyCode] || currencyCode
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: isoCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (e) {
    // Fallback in case Intl doesn't recognize the currency code.
    return `${getCurrencySymbol(currencyCode)}${Number(amount).toFixed(2)}`
  }
}

// Formats a plain number without a currency symbol, e.g. for axis labels.
export function formatNumber(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

