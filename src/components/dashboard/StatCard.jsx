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
      className="rounded-xl border border-border/80 bg-card p-5 shadow-[0_8px_30px_-18px_hsl(var(--foreground)/0.35)]"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <Icon className="h-4 w-4 text-accent" strokeWidth={2} />
          </div>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-[-0.025em] text-foreground">
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
