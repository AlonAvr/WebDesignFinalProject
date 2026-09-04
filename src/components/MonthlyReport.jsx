import { useMemo, useState } from 'react'
import { DollarSign, Receipt, TrendingUp, FileSearch } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

// "Monthly Report" page: lets the user pick month/year/currency, then
// renders a summary and a detailed table calculated from the real report.
export function MonthlyReport() {
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

  const stats = useMemo(() => {
    const { costs, total } = report
    const largestConverted = costs.reduce((max, item) => {
      const converted = convertCurrency(item.sum, item.currency, total.currency)
      return converted > max ? converted : max
    }, 0)
    return {
      count: costs.length,
      largest: largestConverted,
    }
  }, [report])

  function handleGenerate() {
    setAppliedFilters(filters)
  }

  return (
    <PageContainer
      eyebrow="Reports"
      title="Monthly Report"
      description="Review all recorded costs for the selected month."
    >
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <div className="space-y-1.5">
            <Label htmlFor="report-month">Month</Label>
            <Select
              value={String(filters.month)}
              onValueChange={(value) => setFilters((f) => ({ ...f, month: Number(value) }))}
            >
              <SelectTrigger id="report-month" className="w-36">
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
            <Label htmlFor="report-year">Year</Label>
            <Select
              value={String(filters.year)}
              onValueChange={(value) => setFilters((f) => ({ ...f, year: Number(value) }))}
            >
              <SelectTrigger id="report-year" className="w-28">
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
            <Label htmlFor="report-currency">Currency</Label>
            <Select
              value={filters.currency}
              onValueChange={(value) => setFilters((f) => ({ ...f, currency: value }))}
            >
              <SelectTrigger id="report-currency" className="w-28">
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
            View Report
          </Button>
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Spent"
          value={formatCurrency(report.total.sum, report.total.currency)}
          icon={DollarSign}
        />
        <StatCard label="Transactions" value={stats.count} icon={Receipt} />
        <StatCard
          label="Largest Expense"
          value={stats.count > 0 ? formatCurrency(stats.largest, report.total.currency) : '—'}
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Cost Entries &middot; {MONTH_OPTIONS[appliedFilters.month - 1].label} {appliedFilters.year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.costs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border py-12 text-center text-muted-foreground">
              <Receipt className="h-8 w-8" strokeWidth={1.5} />
              <p className="text-sm font-medium">No expenses recorded for this period.</p>
              <p className="text-xs">Try a different month, year, or add a new cost.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Original Amount</TableHead>
                  <TableHead>Original Currency</TableHead>
                  <TableHead className="text-right">
                    Value in {report.total.currency}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.costs.map((cost, index) => (
                  <TableRow key={`${cost.date.day}-${cost.description}-${index}`}>
                    <TableCell>{cost.date.day}</TableCell>
                    <TableCell>{cost.description}</TableCell>
                    <TableCell>{cost.category}</TableCell>
                    <TableCell className="text-right">{cost.sum}</TableCell>
                    <TableCell>{cost.currency}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(
                        convertCurrency(cost.sum, cost.currency, report.total.currency),
                        report.total.currency
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

