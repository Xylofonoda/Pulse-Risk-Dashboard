import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ClipboardList, Trash2, X, CheckCircle, XCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  clearQueue,
  removeFromQueue,
  selectQueueItems,
  selectQueueCount,
} from '@/features/reviewQueue/reviewQueueSlice'
import { getRiskLevel, type Transaction } from '@/types/transaction'
import { useLocale } from '@/contexts/LocaleContext'
import { useUpdateTransactionStatusMutation } from '@/features/transactions/transactionsApi'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const RISK_DOT_CLASSES: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-400',
  medium: 'bg-yellow-400',
  low: 'bg-green-500',
}

interface ReviewQueueProps {
  onSelectTransaction?: (transaction: Transaction) => void
}

export default function ReviewQueue({ onSelectTransaction }: ReviewQueueProps) {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectQueueItems)
  const count = useAppSelector(selectQueueCount)
  const { t, formatCurrency } = useLocale()
  const { toast } = useToast()
  const [updateStatus] = useUpdateTransactionStatusMutation()

  const handleApprove = async (transaction: Transaction) => {
    try {
      await updateStatus({ id: transaction.id, status: 'approved' }).unwrap()
      dispatch(removeFromQueue(transaction.id))
      toast({ variant: 'success', title: t('approved'), description: transaction.merchant_name })
    } catch {
      toast({ title: t('updateFailed'), variant: 'destructive' })
    }
  }

  const handleDecline = async (transaction: Transaction) => {
    try {
      await updateStatus({ id: transaction.id, status: 'declined' }).unwrap()
      dispatch(removeFromQueue(transaction.id))
      toast({ variant: 'destructive', title: t('declined'), description: transaction.merchant_name })
    } catch {
      toast({ title: t('updateFailed'), variant: 'destructive' })
    }
  }

  return (
    <aside className="flex flex-col rounded-lg border bg-card min-h-0 flex-1">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{t('reviewQueue')}</span>
          {count > 0 && (
            <Badge variant="default" className="h-5 min-w-5 rounded-full px-1.5 text-xs">
              {count}
            </Badge>
          )}
        </div>
        {count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => dispatch(clearQueue())}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            {t('clearAll')}
          </Button>
        )}
      </div>

      <Separator />

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-4">
            <ClipboardList className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t('noTransactionsQueued')}</p>
            <p className="text-xs text-muted-foreground/60">
              {t('clickAddToQueue')}
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {items.map((transaction) => {
              const riskLevel = getRiskLevel(transaction.risk_score)
              return (
                <li
                  key={transaction.id}
                  className="flex flex-col gap-2 px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  {/* Top row: dot + name + amount + remove */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      className="flex items-start gap-2 min-w-0 text-left flex-1"
                      onClick={() => onSelectTransaction?.(transaction)}
                    >
                      <span
                        className={cn(
                          'mt-1.5 h-2 w-2 rounded-full shrink-0',
                          RISK_DOT_CLASSES[riskLevel],
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{transaction.merchant_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => dispatch(removeFromQueue(transaction.id))}
                      aria-label={`Remove ${transaction.merchant_name} from queue`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Action row */}
                  <div className="flex gap-2 pl-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 flex-1 text-xs text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-950"
                      onClick={() => handleApprove(transaction)}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {t('approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-950"
                      onClick={() => handleDecline(transaction)}
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      {t('decline')}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
