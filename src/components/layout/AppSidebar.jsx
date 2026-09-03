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

// Sidebar navigation items. "Categories" and "Year Overview" map to the
// pie chart and bar chart views respectively.
const NAV_LINKS = [
  { id: NAV_ITEMS.ADD_COST, label: 'Add Cost', icon: PlusCircle },
  { id: NAV_ITEMS.MONTHLY_REPORT, label: 'Monthly Report', icon: FileBarChart },
  { id: NAV_ITEMS.CATEGORIES, label: 'Categories', icon: PieChart },
  { id: NAV_ITEMS.YEAR_OVERVIEW, label: 'Year Overview', icon: BarChart3 },
  { id: NAV_ITEMS.SETTINGS, label: 'Settings', icon: SettingsIcon },
]

// Persistent dark sidebar. Stays visually stable across all pages while
// the active section is highlighted with a subtle accent indicator.
export function AppSidebar({ activeSection, onNavigate }) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-active/20">
          <Wallet className="h-4 w-4 text-sidebar-active" strokeWidth={2.25} />
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">
          {APP_NAME}
        </span>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_LINKS.map((item) => {
          const isActive = item.id === activeSection
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                'relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-white/5 text-white'
                  : 'text-sidebar-muted hover:bg-white/5 hover:text-white'
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

      <div className="px-6 py-4">
        <p className="text-xs text-sidebar-muted">
          Cost Manager &middot; Final Project
        </p>
      </div>
    </aside>
  )
}

// Small internal helper to keep the divider styling consistent with the
// dark sidebar without pulling in the full shadcn Separator (light theme).
function Separator() {
  return <div className="mx-6 border-t border-sidebar-border" />
}
