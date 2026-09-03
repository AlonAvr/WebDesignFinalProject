import { Coins } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { SUPPORTED_CURRENCIES } from '@/utils/constants'

// Placeholder "Settings" page for configuring exchange rates source.
// No persistence or fetching logic is wired up yet.
export function Settings() {
  return (
    <PageContainer
      eyebrow="Configuration"
      title="Settings"
      description="Manage exchange rate sources and application preferences."
    >
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Exchange Rates</CardTitle>
          <CardDescription>
            Set the URL used to fetch currency exchange rates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rates-url">Rates URL</Label>
            <Input id="rates-url" placeholder="/rates.json" disabled />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label>Supported Currencies</Label>
            <div className="flex flex-wrap gap-2 pt-1">
              {SUPPORTED_CURRENCIES.map((currency) => (
                <span
                  key={currency}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                >
                  <Coins className="h-3 w-3" />
                  {currency}
                </span>
              ))}
            </div>
          </div>

          <Alert>
            <AlertTitle>Coming soon</AlertTitle>
            <AlertDescription>
              Saving settings and fetching live rates will be implemented in a later phase.
            </AlertDescription>
          </Alert>

          <Button className="w-full" disabled>
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
