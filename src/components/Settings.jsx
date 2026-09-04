import { useEffect, useState } from 'react'
import { Coins, RefreshCcw, CheckCircle2, AlertCircle, Save } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  refreshExchangeRates,
  getCachedExchangeRates,
} from '@/services/currencyService'
import { formatCurrency } from '@/utils/currency'
import { SUPPORTED_CURRENCIES, RATES_URL_STORAGE_KEY } from '@/utils/constants'

// "Settings" page: split into independent cards for the exchange-rate
// source configuration and the currently cached exchange rates.
export function Settings() {
  const [ratesUrl, setRatesUrl] = useState('')
  const [savedUrl, setSavedUrl] = useState('')
  const [rates, setRates] = useState(() => getCachedExchangeRates() || {})
  const [status, setStatus] = useState(null) // { type: 'success' | 'error', message }
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(RATES_URL_STORAGE_KEY) || ''
    setRatesUrl(stored)
    setSavedUrl(stored)
  }, [])

  function handleSaveUrl() {
    window.localStorage.setItem(RATES_URL_STORAGE_KEY, ratesUrl.trim())
    setSavedUrl(ratesUrl.trim())
    setStatus({ type: 'success', message: 'Rates URL saved.' })
  }

  async function handleRefresh() {
    setIsRefreshing(true)
    setStatus(null)
    const result = await refreshExchangeRates()
    setRates(result.rates)
    setIsRefreshing(false)

    if (result.source === 'network') {
      setStatus({ type: 'success', message: 'Exchange rates refreshed successfully.' })
    } else if (result.source === 'cache') {
      setStatus({
        type: 'error',
        message: `Could not refresh rates (${result.error}). Using previously cached rates.`,
      })
    } else {
      setStatus({
        type: 'error',
        message: `Could not refresh rates (${result.error}). Using built-in default rates.`,
      })
    }
  }

  return (
    <PageContainer
      eyebrow="Configuration"
      title="Settings"
      description="Manage exchange rate sources and application preferences."
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <Card>
          <CardHeader className="border-b border-border/70 bg-secondary/30">
            <CardTitle className="text-lg">Exchange Rate Source</CardTitle>
            <CardDescription>
              Set the URL used to fetch currency exchange rates. Leave empty to use the
              bundled default (/rates.json).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rates-url">Rates URL</Label>
              <Input
                id="rates-url"
                placeholder="/rates.json"
                value={ratesUrl}
                onChange={(e) => setRatesUrl(e.target.value)}
              />
              <p className="text-xs leading-5 text-muted-foreground">
                Current:{' '}
                <span className="font-medium text-foreground">{savedUrl || '(default) /rates.json'}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleSaveUrl} variant="secondary" className="flex-1">
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleRefresh} disabled={isRefreshing} className="flex-1">
                <RefreshCcw className={isRefreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                {isRefreshing ? 'Refreshing…' : 'Refresh Rates'}
              </Button>
            </div>

            {status && (
              <Alert variant={status.type === 'error' ? 'destructive' : 'default'} role="status">
                {status.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{status.type === 'success' ? 'Success' : 'Refresh issue'}</AlertTitle>
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/70 bg-secondary/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Current Exchange Rates</CardTitle>
                <CardDescription className="mt-1">
                  Cached locally and used by every report and chart calculation.
                </CardDescription>
              </div>
              <div className="rounded-lg bg-accent/10 p-2 text-accent">
                <Coins className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {SUPPORTED_CURRENCIES.map((currency) => (
                <div
                  key={currency}
                  className="flex items-center justify-between rounded-lg border border-border/70 bg-background/60 px-3 py-3"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Coins className="h-4 w-4 text-accent" />
                    {currency}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {typeof rates[currency] === 'number'
                      ? `${rates[currency]} per USD`
                      : '—'}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Example:</span>
              <Badge variant="secondary">
                {formatCurrency(1, 'USD')} = {formatCurrency(rates.ILS || 0, 'ILS')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
