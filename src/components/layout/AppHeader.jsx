import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Top header for the main workspace. Kept minimal and functional:
// a search field placeholder and a notifications affordance.
export function AppHeader() {
  return (
    <header className="flex h-[4.25rem] shrink-0 items-center justify-between border-b border-border/80 bg-card/80 px-6 backdrop-blur-sm lg:px-8">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search costs, categories..."
          aria-label="Search costs and categories"
          className="h-10 border-transparent bg-secondary/70 pl-9 shadow-none placeholder:text-muted-foreground/80 focus-visible:border-ring"
          disabled
        />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/80 bg-card text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>
    </header>
  )
}
