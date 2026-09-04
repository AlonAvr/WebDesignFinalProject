import { Monitor, Moon, Sun } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTheme } from './useTheme'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-1.5">
      <p id="theme-preference-label" className="px-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-sidebar-muted">
        Theme
      </p>
      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger
          aria-labelledby="theme-preference-label"
          className="border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-foreground/5"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-sidebar-border bg-sidebar text-sidebar-foreground">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <SelectItem key={value} value={value}>
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
