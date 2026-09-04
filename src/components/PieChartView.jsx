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
import { convertCurrency, formatCurrency } from '@/utils/currency'
import {
  SUPPORTED_CURRENCIES,
  MONTH_OPTIONS,
  YEAR_OPTIONS,
  DATABASE_NAME,
  DATABASE_VERSION,
} from '@/utils/constants'

const now = new Date()
const CURRENT_YEAR = now.getFullYear()
const CURRENT_MONTH = now.getMonth() + 1

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

function ChartTooltip({ active, payload, currency }) {
  if (!active || !payload?.length) return null

  const item = payload[0]
  return (
    <div className="rounded-lg border border-border/80 bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground">{item.name}</p>
      <p className="mt-1 text-sm font-medium text-accent">
        {formatCurrency(item.value, currency)}
      </p>
    </div>
  )
}

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
      const converted = convertCurrency(cost.sum, cost.currency, report.total.currency)
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
        <CardHeader className="flex-row items-center justify-between border-b border-border/70 bg-secondary/30">
          <div>
            <CardTitle className="text-base">Chart filters</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">See the category mix for a selected period.</p>
          </div>
          <span className="hidden text-xs font-medium text-muted-foreground sm:block">Category mix</span>
        </CardHeader>
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
        <CardHeader className="border-b border-border/70">
          <CardTitle className="text-base">Spending by Category</CardTitle>
          <CardDescription>
            {MONTH_OPTIONS[appliedFilters.month - 1].label} {appliedFilters.year} &middot; converted to{' '}
            {appliedFilters.currency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/25 py-16 text-center text-muted-foreground">
              <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <PieChartIcon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium">No expenses recorded for this period.</p>
              <p className="text-xs">Add a cost to see the category breakdown.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="relative h-80 w-full" role="img" aria-label="Spending distribution by category">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={110}
                      paddingAngle={3}
                      isAnimationActive
                      animationDuration={350}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={entry.category}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<ChartTooltip currency={appliedFilters.currency} />}
                      cursor={false}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      formatter={(value) => <span className="text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
                  <span className="text-xl font-semibold tracking-tight text-foreground">
                    {formatCurrency(totalValue, appliedFilters.currency)}
                  </span>
                  <span className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Total
                  </span>
                </div>
              </div>

              {/* Text-based breakdown, also serving as an accessible
                  alternative to the chart for the same information. */}
              <ul className="space-y-2 self-center" aria-label="Category breakdown">
                {categoryData.map((entry, index) => (
                  <li
                    key={entry.category}
                    className="flex items-center justify-between rounded-lg border border-border/70 bg-background/50 px-3 py-3 text-sm"
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
