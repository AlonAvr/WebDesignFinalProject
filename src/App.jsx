import { useState } from 'react'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { AddCostForm } from '@/components/AddCostForm'
import { MonthlyReport } from '@/components/MonthlyReport'
import { PieChartView } from '@/components/PieChartView'
import { BarChartView } from '@/components/BarChartView'
import { Settings } from '@/components/Settings'
import { TooltipProvider } from '@/components/ui/tooltip'
import { NAV_ITEMS } from '@/utils/constants'

// Maps each navigation item id to its corresponding page component.
const PAGES = {
  [NAV_ITEMS.ADD_COST]: AddCostForm,
  [NAV_ITEMS.MONTHLY_REPORT]: MonthlyReport,
  [NAV_ITEMS.CATEGORIES]: PieChartView,
  [NAV_ITEMS.YEAR_OVERVIEW]: BarChartView,
  [NAV_ITEMS.SETTINGS]: Settings,
}

function App() {
  const [activeSection, setActiveSection] = useState(NAV_ITEMS.ADD_COST)

  const ActivePage = PAGES[activeSection]

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar activeSection={activeSection} onNavigate={setActiveSection} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto">
            <ActivePage />
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
