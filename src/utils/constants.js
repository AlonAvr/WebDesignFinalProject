// Shared constants for the Costly application.

export const APP_NAME = 'Costly'

export const NAV_ITEMS = {
  ADD_COST: 'add-cost',
  MONTHLY_REPORT: 'monthly-report',
  CATEGORIES: 'categories',
  YEAR_OVERVIEW: 'year-overview',
  SETTINGS: 'settings',
}

// Must match the currencies supported by src/services/db.js and vanilla/db.js.
export const SUPPORTED_CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO']

// Fixed set of expense categories offered in the Add Cost form.
export const COST_CATEGORIES = [
  'Food',
  'Transportation',
  'Education',
  'Entertainment',
  'Health',
  'Shopping',
  'Housing',
  'Other',
]

export const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export const MONTH_OPTIONS = MONTH_NAMES.map((label, index) => ({
  value: index + 1,
  label,
}))

// The name of the "database" used across the app (localStorage namespace).
export const DATABASE_NAME = 'costsdb'
export const DATABASE_VERSION = 1

// localStorage keys shared with the currency service and db implementations.
export const EXCHANGE_RATES_STORAGE_KEY = 'costManagerExchangeRates'
export const RATES_URL_STORAGE_KEY = 'costManagerRatesUrl'

// Built-in fallback rates used only if nothing else is available.
export const DEFAULT_EXCHANGE_RATES = { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 }
