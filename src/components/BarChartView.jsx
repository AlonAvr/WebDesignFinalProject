import { BarChart3 } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// Placeholder "Year Overview" page (mapped to the bar chart view).
// The actual Recharts bar chart will be implemented in a later phase.
export function BarChartView() {
  return (
    <PageContainer
      eyebrow="Insights"
      title="Year Overview"
      description="Compare total spending across all months of a selected year."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Totals</CardTitle>
          <CardDescription>Bar chart will render here once cost data is available.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border text-muted-foreground">
            <BarChart3 className="h-8 w-8" strokeWidth={1.5} />
            <p className="text-sm">Chart placeholder</p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
