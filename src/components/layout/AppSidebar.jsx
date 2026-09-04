import { motion } from 'motion/react'
import {
  PlusCircle,
  FileBarChart,
  PieChart,
  BarChart3,
  Settings as SettingsIcon,
  Wallet,
} from 'lucide-react'
import { NAV_ITEMS, APP_NAME } from '@/utils/constants'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

// Sidebar navigation items. "Categories" and "Year Overview" map to the
// pie chart and bar chart views respectively.
const NAV_LINKS = [
  { id: NAV_ITEMS.ADD_COST, label: 'Add Cost', icon: PlusCircle },
  { id: NAV_ITEMS.MONTHLY_REPORT, label: 'Monthly Report', icon: FileBarChart },
  { id: NAV_ITEMS.CATEGORIES, label: 'Categories', icon: PieChart },
  { id: NAV_ITEMS.YEAR_OVERVIEW, label: 'Year Overview', icon: BarChart3 },
  { id: NAV_ITEMS.SETTINGS, label: 'Settings', icon: SettingsIcon },
]

export function AppSidebar({ activeSection, onNavigate }) {
  return (
    <aside className="flex h-screen w-[15.5rem] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-active/15 ring-1 ring-sidebar-active/25">
          <Wallet className="h-[1.1rem] w-[1.1rem] text-sidebar-active" strokeWidth={2.25} />
        </div>
        <div>
          <span className="block text-[1.05rem] font-semibold tracking-tight text-sidebar-foreground">
            {APP_NAME}
          </span>
          <span className="mt-0.5 block text-[0.68rem] font-medium uppercase tracking-[0.16em] text-sidebar-muted">
            Cost manager
          </span>
        </div>
      </div>

      <Separator />

      <nav aria-label="Primary navigation" className="flex-1 space-y-1 px-3 py-5">
        <p className="mb-3 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-sidebar-muted/80">
          Workspace
        </p>
        {NAV_LINKS.map((item) => {
          const isActive = item.id === activeSection
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-sidebar-active/15 text-sidebar-foreground'
                  : 'text-sidebar-muted hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 h-5 w-0.5 rounded-full bg-sidebar-active"
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon className="h-4 w-4" strokeWidth={2} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="mx-3 mb-4 space-y-4">
        <ThemeToggle />
        <div className="rounded-lg border border-sidebar-border/80 bg-sidebar-foreground/5 px-3 py-3">
          <p className="text-[0.68rem] leading-relaxed text-sidebar-muted">
            Keep every expense in view.
          </p>
        </div>
      </div>
    </aside>
  )
}

// Small internal helper to keep the divider styling consistent with the
// dark sidebar without pulling in the full shadcn Separator (light theme).
function Separator() {
  return <div className="mx-6 border-t border-sidebar-border" />
}
