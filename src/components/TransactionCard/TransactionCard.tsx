import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PlusCircle, CheckCircle, ShoppingBag } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { addToQueue, selectIsInQueue } from '@/features/reviewQueue/reviewQueueSlice'
import { getRiskLevel, RISK_LEVEL_LABELS } from '@/types/transaction'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types/transaction'
import { cn } from '@/lib/utils'

const RISK_BADGE_CLASSES: Record<string, string> = {
  critical: 'border-red-200 bg-red-100 text-red-800',
  high: 'border-orange-200 bg-orange-100 text-orange-800',
  medium: 'border-yellow-200 bg-yellow-100 text-yellow-800',
  low: 'border-green-200 bg-green-100 text-green-800',
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
  flagged: 'border-red-200 bg-red-50 text-red-700',
  pending: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  approved: 'border-green-200 bg-green-50 text-green-700',
  declined: 'border-gray-200 bg-gray-50 text-gray-600',
}

interface TransactionCardProps {
  transaction: Transaction
  onClick?: () => void
}

export default function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  const dispatch = useAppDispatch()
  const isInQueue = useAppSelector(selectIsInQueue(transaction.id))
  const riskLevel = getRiskLevel(transaction.risk_score)

  function handleAddToQueue(e: React.MouseEvent) {
    e.stopPropagation()
    dispatch(addToQueue(transaction))
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        onClick && 'hover:border-primary/50',
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingBag className="h-4 w-4 shrink-0 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold truncate">
              {transaction.merchant_name}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={cn('shrink-0 text-xs', STATUS_BADGE_CLASSES[transaction.status])}
          >
            {transaction.status}
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">
            {formatCurrency(transaction.amount, transaction.currency)}
          </span>
          <Badge
            variant="outline"
            className={cn('text-xs font-semibold', RISK_BADGE_CLASSES[riskLevel])}
          >
            {RISK_LEVEL_LABELS[riskLevel]} — {transaction.risk_score}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>

        <Button
          size="sm"
          variant={isInQueue ? 'secondary' : 'default'}
          className="w-full"
          onClick={handleAddToQueue}
          disabled={isInQueue}
        >
          {isInQueue ? (
            <>
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
              In Queue
            </>
          ) : (
            <>
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Add to Queue
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
