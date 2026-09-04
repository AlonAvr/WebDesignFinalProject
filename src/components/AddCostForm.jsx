import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { PlusCircle, CheckCircle2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { openCostsDB } from '@/services/db'
import {
  SUPPORTED_CURRENCIES,
  COST_CATEGORIES,
  DATABASE_NAME,
  DATABASE_VERSION,
} from '@/utils/constants'

const INITIAL_FORM = {
  sum: '',
  currency: 'USD',
  category: '',
  description: '',
}

// "Add Cost" form: validates input, persists via the shared db service,
// and gives tasteful non-blocking feedback on success or failure.
export function AddCostForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState(null) // { type: 'success' | 'error', message }

  // Open the costs "database" once; the returned object is stateless and
  // simply reads/writes localStorage on each call.
  const costsDb = useMemo(() => openCostsDB(DATABASE_NAME, DATABASE_VERSION), [])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate() {
    const nextErrors = {}
    const numericSum = Number(form.sum)

    if (form.sum === '' || Number.isNaN(numericSum) || numericSum <= 0) {
      nextErrors.sum = 'Enter an amount greater than zero.'
    }
    if (!form.currency) {
      nextErrors.currency = 'Select a currency.'
    }
    if (!form.category) {
      nextErrors.category = 'Select a category.'
    }
    if (!form.description.trim()) {
      nextErrors.description = 'Description cannot be empty.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFeedback(null)

    if (!validate()) return

    try {
      costsDb.addCost({
        sum: Number(form.sum),
        currency: form.currency,
        category: form.category,
        description: form.description.trim(),
      })

      // Clear the form for the next entry; date is assigned automatically
      // by the database, so there is never a date field to reset here.
      setForm(INITIAL_FORM)
      setFeedback({ type: 'success', message: 'Cost added successfully.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message })
    }
  }

  return (
    <PageContainer
      eyebrow="Expenses"
      title="Add Cost"
      description="Record a new expense with its amount, currency, and category."
    >
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>New Cost Entry</CardTitle>
          <CardDescription>
            The date is recorded automatically when you save an expense.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cost-sum">Amount</Label>
                <Input
                  id="cost-sum"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.sum}
                  onChange={(e) => updateField('sum', e.target.value)}
                  aria-invalid={Boolean(errors.sum)}
                  aria-describedby={errors.sum ? 'cost-sum-error' : undefined}
                />
                {errors.sum && (
                  <p id="cost-sum-error" className="text-xs font-medium text-destructive">
                    {errors.sum}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cost-currency">Currency</Label>
                <Select
                  value={form.currency}
                  onValueChange={(value) => updateField('currency', value)}
                >
                  <SelectTrigger
                    id="cost-currency"
                    aria-invalid={Boolean(errors.currency)}
                    aria-describedby={errors.currency ? 'cost-currency-error' : undefined}
                  >
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p id="cost-currency-error" className="text-xs font-medium text-destructive">
                    {errors.currency}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cost-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => updateField('category', value)}
              >
                <SelectTrigger
                  id="cost-category"
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={errors.category ? 'cost-category-error' : undefined}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {COST_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p id="cost-category-error" className="text-xs font-medium text-destructive">
                  {errors.category}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cost-description">Description</Label>
              <Input
                id="cost-description"
                placeholder="Short description"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? 'cost-description-error' : undefined}
              />
              {errors.description && (
                <p id="cost-description-error" className="text-xs font-medium text-destructive">
                  {errors.description}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              <PlusCircle className="h-4 w-4" />
              Add Cost
            </Button>

            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  key={feedback.message}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  role="status"
                  className={
                    feedback.type === 'success'
                      ? 'flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm font-medium text-success'
                      : 'flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive'
                  }
                >
                  {feedback.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                  {feedback.message}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
