import { PieChart as PieChartIcon } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// Placeholder "Categories" page (mapped to the pie chart view).
// The actual Recharts pie chart will be implemented in a later phase.
export function PieChartView() {
  return (
    <PageContainer
      eyebrow="Insights"
      title="Categories"
      description="See how your spending is distributed across categories for a selected month."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending by Category</CardTitle>
          <CardDescription>Pie chart will render here once cost data is available.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border text-muted-foreground">
            <PieChartIcon className="h-8 w-8" strokeWidth={1.5} />
            <p className="text-sm">Chart placeholder</p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
