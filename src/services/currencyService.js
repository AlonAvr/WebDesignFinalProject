// Exchange rate service for the Costly application. Fetches live rates via
// the Fetch API, validates the payload, and caches them in localStorage
// under the shared key read synchronously by src/services/db.js and
// vanilla/db.js.

import {
  SUPPORTED_CURRENCIES,
  EXCHANGE_RATES_STORAGE_KEY,
  RATES_URL_STORAGE_KEY,
  DEFAULT_EXCHANGE_RATES,
} from '@/utils/constants'

// Resolves the URL to fetch exchange rates from: a custom URL saved by the
// user in Settings, or the bundled public/rates.json by default.
function resolveRatesUrl() {
  const customUrl = window.localStorage.getItem(RATES_URL_STORAGE_KEY)
  if (customUrl && customUrl.trim() !== '') {
    return customUrl.trim()
  }
  return `${window.location.origin}/rates.json`
}

// Validates that a fetched rates payload contains all required currencies
// with positive numeric values, and that USD is present and valid.
function validateRates(rates) {
  if (!rates || typeof rates !== 'object') {
    throw new Error('Exchange rates response must be an object.')
  }
  for (const currency of SUPPORTED_CURRENCIES) {
    const value = rates[currency]
    if (typeof value !== 'number' || !isFinite(value) || value <= 0) {
      throw new Error(`Exchange rates are missing a valid positive value for "${currency}".`)
    }
  }
  if (rates.USD !== 1 && (typeof rates.USD !== 'number' || rates.USD <= 0)) {
    throw new Error('Exchange rates must include a valid USD value.')
  }
}

// Reads whatever rates are currently cached in localStorage, if any.
export function getCachedExchangeRates() {
  try {
    const raw = window.localStorage.getItem(EXCHANGE_RATES_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch (e) {
    return null
  }
}

// Persists a validated rates object to localStorage.
function cacheExchangeRates(rates) {
  window.localStorage.setItem(EXCHANGE_RATES_STORAGE_KEY, JSON.stringify(rates))
}

// Fetches exchange rates from the configured URL (or the default
// public/rates.json), validates them, and caches them on success.
//
// On failure, falls back to any existing cached rates, and finally to the
// built-in default rates, so the app never becomes unusable if the rates
// server is unreachable. Returns { rates, source, error }.
export async function refreshExchangeRates() {
  const url = resolveRatesUrl()

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Rates request failed with status ${response.status}.`)
    }
    const data = await response.json()
    validateRates(data)
    cacheExchangeRates(data)
    return { rates: data, source: 'network', error: null }
  } catch (error) {
    const cached = getCachedExchangeRates()
    if (cached) {
      return { rates: cached, source: 'cache', error: error.message }
    }
    return { rates: DEFAULT_EXCHANGE_RATES, source: 'default', error: error.message }
  }
}

// Backward/utility-compatible alias used by earlier scaffolding.
export async function getExchangeRates() {
  const { rates } = await refreshExchangeRates()
  return rates
}
