import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { FileSearch, TrendingUp, Wallet, CalendarDays } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { StatCard } from '@/components/dashboard/StatCard'
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
import { formatCurrency, formatNumber } from '@/utils/currency'
import {
  SUPPORTED_CURRENCIES,
  MONTH_NAMES,
  YEAR_OPTIONS,
  DATABASE_NAME,
  DATABASE_VERSION,
} from '@/utils/constants'

const now = new Date()
const CURRENT_YEAR = now.getFullYear()

const BAR_COLOR = '#1d4ed8' // single restrained accent color, no rainbow bars

// "Year Overview" page: shows all 12 months for the selected year,
// converting each month's total into the selected currency. Months with
// no spending still appear with a zero value.
export function BarChartView() {
  const costsDb = useMemo(() => openCostsDB(DATABASE_NAME, DATABASE_VERSION), [])

  const [filters, setFilters] = useState({ year: CURRENT_YEAR, currency: 'USD' })
  const [appliedFilters, setAppliedFilters] = useState(filters)

  // Build one report per month for the selected year/currency. getReport
  // is synchronous, so this is a cheap, safe loop of exactly 12 calls.
  const monthlyTotals = useMemo(() => {
    return MONTH_NAMES.map((label, index) => {
      const month = index + 1
      const report = costsDb.getReport(appliedFilters.currency, appliedFilters.year, month)
      return { month: label, total: report.total.sum }
    })
  }, [costsDb, appliedFilters])

  const stats = useMemo(() => {
    const yearlyTotal = monthlyTotals.reduce((sum, m) => sum + m.total, 0)
    const average = yearlyTotal / 12
    const highest = monthlyTotals.reduce(
      (max, m) => (m.total > max.total ? m : max),
      monthlyTotals[0]
    )
    return { yearlyTotal, average, highest }
  }, [monthlyTotals])

  function handleGenerate() {
    setAppliedFilters(filters)
  }

  return (
    <PageContainer
      eyebrow="Insights"
      title="Year Overview"
      description="Compare total spending across all months of a selected year."
    >
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <div className="space-y-1.5">
            <Label htmlFor="bar-year">Year</Label>
            <Select
              value={String(filters.year)}
              onValueChange={(value) => setFilters((f) => ({ ...f, year: Number(value) }))}
            >
              <SelectTrigger id="bar-year" className="w-28">
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
            <Label htmlFor="bar-currency">Currency</Label>
            <Select
              value={filters.currency}
              onValueChange={(value) => setFilters((f) => ({ ...f, currency: value }))}
            >
              <SelectTrigger id="bar-currency" className="w-28">
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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Yearly Total"
          value={formatCurrency(stats.yearlyTotal, appliedFilters.currency)}
          icon={Wallet}
        />
        <StatCard
          label="Average / Month"
          value={formatCurrency(stats.average, appliedFilters.currency)}
          icon={TrendingUp}
        />
        <StatCard
          label="Highest Month"
          value={`${stats.highest.month} · ${formatCurrency(stats.highest.total, appliedFilters.currency)}`}
          icon={CalendarDays}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Totals</CardTitle>
          <CardDescription>
            {appliedFilters.year} &middot; converted to {appliedFilters.currency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.yearlyTotal === 0 && (
            <p className="mb-3 text-sm text-muted-foreground">
              No expenses recorded for this year.
            </p>
          )}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTotals} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => formatNumber(value)}
                  width={56}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value, appliedFilters.currency)}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={400}>
                  {monthlyTotals.map((entry) => (
                    <Cell key={entry.month} fill={BAR_COLOR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Text-based summary as an accessible alternative to the chart. */}
          <table className="sr-only">
            <caption>Monthly totals for {appliedFilters.year} in {appliedFilters.currency}</caption>
            <thead>
              <tr>
                <th>Month</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTotals.map((entry) => (
                <tr key={entry.month}>
                  <td>{entry.month}</td>
                  <td>{formatCurrency(entry.total, appliedFilters.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
