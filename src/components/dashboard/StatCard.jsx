import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

const TREND_STYLES = {
  positive: 'text-success',
  negative: 'text-destructive',
  neutral: 'text-muted-foreground',
}

// Reusable metric card for future dashboard statistics (e.g. total spend,
// monthly average, top category). No live data is wired up yet.
export function StatCard({ label, value, icon: Icon, trend, trendDirection = 'neutral' }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10">
            <Icon className="h-4 w-4 text-accent" strokeWidth={2} />
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {trend && (
        <p className={cn('mt-1 text-xs font-medium', TREND_STYLES[trendDirection])}>
          {trend}
        </p>
      )}
    </motion.div>
  )
}
