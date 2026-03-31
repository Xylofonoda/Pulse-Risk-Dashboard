import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Bot, ChevronDown, ChevronUp, ClipboardList, Loader2, ShieldAlert } from 'lucide-react'
import { useGenerateRiskSummaryMutation } from '@/features/transactions/transactionsApi'
import { getRiskLevel, RISK_LEVEL_LABELS } from '@/types/transaction'
import { cn } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'
import { useToast } from '@/hooks/use-toast'
import CreditLimitForm from '@/components/CreditLimitForm/CreditLimitForm'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { addToQueue, removeFromQueue, selectIsInQueue } from '@/features/reviewQueue/reviewQueueSlice'
import type { Transaction } from '@/types/transaction'

const RISK_BADGE_CLASSES: Record<string, string> = {
  critical: 'border-red-200 bg-red-100 text-red-800',
  high: 'border-orange-200 bg-orange-100 text-orange-800',
  medium: 'border-yellow-200 bg-yellow-100 text-yellow-800',
  low: 'border-green-200 bg-green-100 text-green-800',
}

interface RiskFactorModalProps {
  transaction: Transaction | null
  open: boolean
  onClose: () => void
}

export default function RiskFactorModal({ transaction, open, onClose }: RiskFactorModalProps) {
  const dispatch = useAppDispatch()
  const isInQueue = useAppSelector(selectIsInQueue(transaction?.id ?? ''))
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const [generateRiskSummary, { isLoading: isSummarising }] = useGenerateRiskSummaryMutation()
  const { t, formatCurrency, formatDate } = useLocale()
  const { toast } = useToast()

  // Reset AI summary when modal opens for a different transaction
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(null)
  if (transaction && transaction.id !== lastTransactionId) {
    setLastTransactionId(transaction.id)
    setAiSummary(null)
    setSummaryExpanded(false)
  }

  async function handleGenerateSummary() {
    if (!transaction) return
    const result = await generateRiskSummary(transaction.id).unwrap()
    setAiSummary(result.summary)
    setSummaryExpanded(true)
    if (result.auto_approved) {
      toast({
        title: t('autoApproved'),
        description: t('autoApprovedDesc'),
        variant: 'success',
      })
    }
  }

  if (!transaction) return null

  const riskLevel = getRiskLevel(transaction.risk_score)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            {t('riskAnalysis')}
          </DialogTitle>
          <DialogDescription>
            {t('riskAnalysisDesc')}
          </DialogDescription>
        </DialogHeader>

        {/* Transaction Overview */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{transaction.merchant_name}</p>
              <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
            </div>
            <span className="text-xl font-bold tabular-nums">
              {formatCurrency(transaction.amount, transaction.currency)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn('text-xs font-semibold', RISK_BADGE_CLASSES[riskLevel])}
            >
              {RISK_LEVEL_LABELS[riskLevel]} Risk — {transaction.risk_score}/100
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {transaction.status}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Risk Factors */}
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            {t('riskFactors')}
          </h3>
          {transaction.risk_factors?.length ? (
            <ul className="space-y-1.5">
              {transaction.risk_factors.map((factor) => (
                <li
                  key={factor}
                  className="flex items-center gap-2 rounded-md border border-orange-100 bg-orange-50 px-3 py-1.5 text-sm text-orange-800"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                  {factor.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t('noRiskFactors')}</p>
          )}
        </div>

        <Separator />

        {/* AI Summary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-primary" />
              {t('aiRiskSummary')}
            </h3>
            {aiSummary && (
              <button
                onClick={() => setSummaryExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {summaryExpanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" /> {t('collapse')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" /> {t('expand')}
                  </>
                )}
              </button>
            )}
          </div>

          {aiSummary && summaryExpanded && (
            <div className="mb-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm leading-relaxed text-foreground">
              {aiSummary}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleGenerateSummary}
            disabled={isSummarising}
          >
            {isSummarising ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                {t('generatingSummary')}
              </>
            ) : aiSummary ? (
              <>
                <Bot className="mr-2 h-3.5 w-3.5" />
                {t('regenerateSummary')}
              </>
            ) : (
              <>
                <Bot className="mr-2 h-3.5 w-3.5" />
                {t('generateAiSummary')}
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Queue Action */}
        <Button
          variant={isInQueue ? 'secondary' : 'default'}
          size="sm"
          className="w-full"
          onClick={() =>
            isInQueue
              ? dispatch(removeFromQueue(transaction.id))
              : dispatch(addToQueue(transaction))
          }
        >
          <ClipboardList className="mr-2 h-3.5 w-3.5" />
          {isInQueue ? t('removeFromQueue') : t('addToQueue')}
        </Button>

        <Separator />

        {/* Credit Limit Form */}
        <div>
          <h3 className="mb-3 text-sm font-semibold">{t('adjustCreditLimit')}</h3>
          <CreditLimitForm userId={transaction.user_id} onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
