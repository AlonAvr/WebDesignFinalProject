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

function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border/80 bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-accent">
        {formatCurrency(payload[0].value, currency)}
      </p>
    </div>
  )
}

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
        <CardHeader className="flex-row items-center justify-between border-b border-border/70 bg-secondary/30">
          <div>
            <CardTitle className="text-base">Chart filters</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Compare monthly totals in one currency.</p>
          </div>
          <span className="hidden text-xs font-medium text-muted-foreground sm:block">12 month view</span>
        </CardHeader>
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
        <CardHeader className="border-b border-border/70">
          <CardTitle className="text-base">Monthly Totals</CardTitle>
          <CardDescription>
            {appliedFilters.year} &middot; converted to {appliedFilters.currency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.yearlyTotal === 0 && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/25 px-4 py-3 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 shrink-0 text-accent" />
              No expenses recorded for this year yet.
            </div>
          )}
          <div className="h-80 w-full" role="img" aria-label={`Monthly spending totals for ${appliedFilters.year}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTotals} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={(value) => formatNumber(value)}
                  width={56}
                />
                <Tooltip
                  content={<ChartTooltip currency={appliedFilters.currency} />}
                  cursor={{ fill: 'hsl(var(--muted) / 0.7)' }}
                />
                <Bar dataKey="total" radius={[6, 6, 2, 2]} isAnimationActive animationDuration={350} barSize={28}>
                  {monthlyTotals.map((entry) => (
                    <Cell key={entry.month} fill="hsl(var(--accent))" />
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
