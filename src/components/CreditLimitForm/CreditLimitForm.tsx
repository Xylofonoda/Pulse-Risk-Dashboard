import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useUpdateCreditLimitMutation } from '@/features/transactions/transactionsApi'
import { useLocale } from '@/contexts/LocaleContext'

const creditLimitSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  newLimit: z
    .number({ invalid_type_error: 'Enter a valid number' })
    .min(0, 'Limit cannot be negative')
    .max(1_000_000, 'Limit cannot exceed 1,000,000'),
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be under 500 characters'),
})

type CreditLimitFormValues = z.infer<typeof creditLimitSchema>

interface CreditLimitFormProps {
  userId: string
  onSuccess?: () => void
}

export default function CreditLimitForm({ userId, onSuccess }: CreditLimitFormProps) {
  const { toast } = useToast()
  const [updateCreditLimit, { isLoading }] = useUpdateCreditLimitMutation()
  const { t, locale } = useLocale()

  const form = useForm<CreditLimitFormValues>({
    resolver: zodResolver(creditLimitSchema),
    defaultValues: {
      userId,
      newLimit: 0,
      reason: '',
    },
  })

  async function onSubmit(values: CreditLimitFormValues) {
    try {
      await updateCreditLimit(values).unwrap()
      toast({
        variant: 'success',
        title: t('creditLimitUpdated'),
        description: t('newLimitApplied').replace('{amount}', values.newLimit.toLocaleString(locale)),
      })
      form.reset({ userId, newLimit: 0, reason: '' })
      onSuccess?.()
    } catch {
      toast({
        variant: 'destructive',
        title: t('updateFailed'),
        description: t('updateFailedDesc'),
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="newLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('newCreditLimit')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={1_000_000}
                  placeholder="e.g. 50000"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('reasonForAdjustment')}</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder={t('reasonPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('applying')}
            </>
          ) : (
            t('applyLimitChange')
          )}
        </Button>
      </form>
    </Form>
  )
}
