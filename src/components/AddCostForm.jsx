import { PlusCircle } from 'lucide-react'
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
import { SUPPORTED_CURRENCIES } from '@/utils/constants'

// Placeholder "Add Cost" form. Fields are laid out but not yet wired to
// any validation or persistence logic.
export function AddCostForm() {
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
            This form is a placeholder for the upcoming cost manager logic.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cost-sum">Amount</Label>
              <Input id="cost-sum" type="number" placeholder="0.00" disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cost-currency">Currency</Label>
              <Select disabled>
                <SelectTrigger id="cost-currency">
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
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cost-category">Category</Label>
            <Input id="cost-category" placeholder="e.g. Food, Transportation" disabled />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cost-description">Description</Label>
            <Input id="cost-description" placeholder="Short description" disabled />
          </div>

          <Button className="w-full" disabled>
            <PlusCircle className="h-4 w-4" />
            Add Cost
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
