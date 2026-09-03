import { DollarSign, TrendingUp, Receipt, Calendar } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Placeholder "Monthly Report" page. Stat cards and a table skeleton are
// shown to establish the shell; real data and charts arrive in a later phase.
export function MonthlyReport() {
  return (
    <PageContainer
      eyebrow="Reports"
      title="Monthly Report"
      description="Review all recorded costs for the selected month."
    >
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Spent" value="—" icon={DollarSign} trend="No data yet" trendDirection="neutral" />
        <StatCard label="Transactions" value="—" icon={Receipt} trend="No data yet" trendDirection="neutral" />
        <StatCard label="Avg / Day" value="—" icon={TrendingUp} trend="No data yet" trendDirection="neutral" />
        <StatCard label="Period" value="—" icon={Calendar} trend="No data yet" trendDirection="neutral" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost Entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-2/3" />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
