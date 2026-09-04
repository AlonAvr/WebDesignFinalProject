import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PieChart as PieChartIcon, FileSearch } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { openCostsDB } from '@/services/db'
import { formatCurrency } from '@/utils/currency'
import {
  SUPPORTED_CURRENCIES,
  MONTH_OPTIONS,
  DATABASE_NAME,
  DATABASE_VERSION,
} from '@/utils/constants'

const now = new Date()
const CURRENT_YEAR = now.getFullYear()
const CURRENT_MONTH = now.getMonth() + 1
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3]

// Restrained, cohesive categorical palette (reused in the same order every
// render so colors never appear random between renders or reloads).
const CATEGORY_COLORS = [
  '#1d4ed8', // accent blue
  '#0f766e', // teal
  '#b45309', // amber
  '#6d28d9', // violet
  '#be123c', // rose
  '#15803d', // green
  '#0369a1', // sky
  '#78716c', // stone (for "Other")
]

// "Categories" page: aggregates costs by category for the selected
// month/year, converting every cost into the selected currency first.
export function PieChartView() {
  const costsDb = useMemo(() => openCostsDB(DATABASE_NAME, DATABASE_VERSION), [])

  const [filters, setFilters] = useState({
    month: CURRENT_MONTH,
    year: CURRENT_YEAR,
    currency: 'USD',
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)

  const report = useMemo(
    () => costsDb.getReport(appliedFilters.currency, appliedFilters.year, appliedFilters.month),
    [costsDb, appliedFilters]
  )

  // Aggregate the already-converted-friendly costs by category. Each cost
  // is converted individually (mirroring db.js's own conversion) so the
  // category breakdown sums to the same total shown in the report.
  const categoryData = useMemo(() => {
    const totalsByCategory = new Map()
    for (const cost of report.costs) {
      const converted = convertToCurrency(cost.sum, cost.currency, report.total.currency)
      totalsByCategory.set(cost.category, (totalsByCategory.get(cost.category) || 0) + converted)
    }
    return Array.from(totalsByCategory.entries())
      .map(([category, value]) => ({ category, value: Math.round((value + Number.EPSILON) * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
  }, [report])

  const totalValue = categoryData.reduce((sum, item) => sum + item.value, 0)

  function handleGenerate() {
    setAppliedFilters(filters)
  }

  return (
    <PageContainer
      eyebrow="Insights"
      title="Categories"
      description="See how your spending is distributed across categories for a selected month."
    >
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <div className="space-y-1.5">
            <Label htmlFor="pie-month">Month</Label>
            <Select
              value={String(filters.month)}
              onValueChange={(value) => setFilters((f) => ({ ...f, month: Number(value) }))}
            >
              <SelectTrigger id="pie-month" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pie-year">Year</Label>
            <Select
              value={String(filters.year)}
              onValueChange={(value) => setFilters((f) => ({ ...f, year: Number(value) }))}
            >
              <SelectTrigger id="pie-year" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pie-currency">Currency</Label>
            <Select
              value={filters.currency}
              onValueChange={(value) => setFilters((f) => ({ ...f, currency: value }))}
            >
              <SelectTrigger id="pie-currency" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerate}>
            <FileSearch className="h-4 w-4" />
            View Chart
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending by Category</CardTitle>
          <CardDescription>
            {MONTH_OPTIONS[appliedFilters.month - 1].label} {appliedFilters.year} &middot; converted to{' '}
            {appliedFilters.currency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border py-16 text-center text-muted-foreground">
              <PieChartIcon className="h-8 w-8" strokeWidth={1.5} />
              <p className="text-sm font-medium">No expenses recorded for this period.</p>
              <p className="text-xs">Add a cost to see the category breakdown.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={2}
                      isAnimationActive
                      animationDuration={400}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={entry.category}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value, appliedFilters.currency)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Text-based breakdown, also serving as an accessible
                  alternative to the chart for the same information. */}
              <ul className="space-y-2 self-center" aria-label="Category breakdown">
                {categoryData.map((entry, index) => (
                  <li
                    key={entry.category}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                        aria-hidden="true"
                      />
                      {entry.category}
                    </span>
                    <span className="flex items-center gap-3 text-muted-foreground">
                      <span>{totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(1) : '0.0'}%</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(entry.value, appliedFilters.currency)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

// Converts an amount between currencies using the cached exchange rates,
// matching the same USD-pivot formula used by db.js.
function convertToCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount
  const rates = readRatesForDisplay()
  const amountInUsd = amount / rates[fromCurrency]
  return amountInUsd * rates[toCurrency]
}

function readRatesForDisplay() {
  try {
    const raw = window.localStorage.getItem('costManagerExchangeRates')
    if (!raw) return { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 }
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 }
  } catch (e) {
    return { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 }
  }
}

