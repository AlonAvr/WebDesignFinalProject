// ES module Cost Manager database for the React app, backed only by
// localStorage. Behavior must stay identical to vanilla/db.js so both
// implementations are interchangeable.

const SUPPORTED_CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO']
const RATES_KEY = 'costManagerExchangeRates'
const DEFAULT_RATES = { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 }

// Builds the localStorage key used to store all costs for a given
// database name, so multiple "databases" can coexist without collisions.
function costsStorageKey(databaseName) {
  return `costManagerDB::${databaseName}::costs`
}

// Reads the exchange rates cached in localStorage, falling back to the
// hard-coded defaults if nothing is cached or the cache is invalid.
function readExchangeRates() {
  try {
    const raw = window.localStorage.getItem(RATES_KEY)
    if (!raw) return DEFAULT_RATES
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return DEFAULT_RATES
    return parsed
  } catch (e) {
    return DEFAULT_RATES
  }
}

// Reads the raw array of stored cost records for a given database name.
function readCosts(databaseName) {
  try {
    const raw = window.localStorage.getItem(costsStorageKey(databaseName))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

// Persists the full array of cost records for a given database name.
function writeCosts(databaseName, costs) {
  window.localStorage.setItem(costsStorageKey(databaseName), JSON.stringify(costs))
}

// Converts an amount from one currency to another using USD as the
// pivot currency, per the provided (or default) exchange rate table.
function convert(amount, fromCurrency, toCurrency, rates) {
  const amountInUsd = amount / rates[fromCurrency]
  const converted = amountInUsd * rates[toCurrency]
  // Round to 2 decimal places to avoid floating point artifacts.
  return Math.round((converted + Number.EPSILON) * 100) / 100
}

// Validates the shape of a cost object passed to addCost, throwing a
// descriptive Error for any obviously invalid data.
function validateCost(cost) {
  if (!cost || typeof cost !== 'object') {
    throw new Error('Cost must be an object.')
  }
  if (typeof cost.sum !== 'number' || !isFinite(cost.sum) || cost.sum <= 0) {
    throw new Error('Cost "sum" must be a positive number.')
  }
  if (typeof cost.currency !== 'string' || !SUPPORTED_CURRENCIES.includes(cost.currency)) {
    throw new Error(`Cost "currency" must be one of: ${SUPPORTED_CURRENCIES.join(', ')}.`)
  }
  if (typeof cost.category !== 'string' || cost.category.trim() === '') {
    throw new Error('Cost "category" must be a non-empty string.')
  }
  if (typeof cost.description !== 'string') {
    throw new Error('Cost "description" must be a string.')
  }
}

// Validates the requested month/year values used by getReport.
function validateMonthYear(year, month) {
  if (typeof year !== 'number' || !isFinite(year)) {
    throw new Error('Report "year" must be a number.')
  }
  if (typeof month !== 'number' || !isFinite(month) || month < 1 || month > 12) {
    throw new Error('Report "month" must be a number between 1 and 12.')
  }
}

// Opens (or creates) a costs "database" identified by databaseName.
// databaseVersion is accepted for API-compatibility but is not currently
// used to trigger any migration logic.
export function openCostsDB(databaseName, databaseVersion) {
  if (typeof databaseName !== 'string' || databaseName.trim() === '') {
    throw new Error('openCostsDB requires a non-empty "databaseName" string.')
  }

  return {
    databaseName,
    databaseVersion,

    // Adds a new cost entry, stamping it with today's date, and returns
    // an object with exactly { sum, currency, category, description }.
    addCost(cost) {
      validateCost(cost)

      const now = new Date()
      const record = {
        sum: cost.sum,
        currency: cost.currency,
        category: cost.category,
        description: cost.description,
        date: {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          day: now.getDate(),
        },
      }

      const costs = readCosts(databaseName)
      costs.push(record)
      writeCosts(databaseName, costs)

      return {
        sum: record.sum,
        currency: record.currency,
        category: record.category,
        description: record.description,
      }
    },

    // Builds a monthly report for the requested output currency.
    // Defaults to the current year/month when omitted. Runs fully
    // synchronously so callers can read data.total.sum immediately.
    getReport(currency, year, month) {
      if (typeof currency !== 'string' || !SUPPORTED_CURRENCIES.includes(currency)) {
        throw new Error(`getReport "currency" must be one of: ${SUPPORTED_CURRENCIES.join(', ')}.`)
      }

      const now = new Date()
      const targetYear = typeof year === 'number' ? year : now.getFullYear()
      const targetMonth = typeof month === 'number' ? month : now.getMonth() + 1
      validateMonthYear(targetYear, targetMonth)

      const rates = readExchangeRates()
      const allCosts = readCosts(databaseName)

      const matching = allCosts.filter(
        (item) => item.date.year === targetYear && item.date.month === targetMonth
      )

      let totalSum = 0
      const reportCosts = matching.map((item) => {
        totalSum += convert(item.sum, item.currency, currency, rates)
        // Return a fresh object (never the stored reference) with only
        // the day portion of the date, per the required report shape.
        return {
          sum: item.sum,
          currency: item.currency,
          category: item.category,
          description: item.description,
          date: { day: item.date.day },
        }
      })

      return {
        year: targetYear,
        month: targetMonth,
        costs: reportCosts,
        total: {
          currency,
          sum: Math.round((totalSum + Number.EPSILON) * 100) / 100,
        },
      }
    },
  }
}

export const db = { openCostsDB }
