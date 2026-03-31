import { useState, useRef, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Loader2, RefreshCw, SlidersHorizontal, X } from 'lucide-react'
import { useGetTransactionsQuery } from '@/features/transactions/transactionsApi'
import { getRiskLevel, RISK_LEVEL_LABELS } from '@/types/transaction'
import { cn } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'
import type { Transaction } from '@/types/transaction'

type StatusFilter = '' | 'flagged' | 'pending' | 'approved' | 'declined'
type RiskFilter = '' | 'critical' | 'high' | 'medium' | 'low'

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
  declined: 'border-gray-200 bg-gray-100 text-gray-600',
}

interface TransactionTableProps {
  onSelectTransaction: (transaction: Transaction) => void
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 rounded bg-muted animate-pulse" />
        </TableCell>
      ))}
      <TableCell className="hidden sm:table-cell">
        <div className="h-4 rounded bg-muted animate-pulse" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="h-4 rounded bg-muted animate-pulse" />
      </TableCell>
    </TableRow>
  )
}

export default function TransactionTable({ onSelectTransaction }: TransactionTableProps) {
  const { data: transactions, isLoading, isError, refetch } = useGetTransactionsQuery()
  const { t, formatCurrency, formatDate } = useLocale()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const PAGE_SIZE = 8

  const merchantSuggestions = search.length > 0
    ? Array.from(new Set(transactions?.map((tx) => tx.merchant_name) ?? []))
      .filter((name) => name.toLowerCase().includes(search.toLowerCase()) && name.toLowerCase() !== search.toLowerCase())
      .slice(0, 6)
    : []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = transactions?.filter((tx) => {
    if (search && !tx.merchant_name.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && tx.status !== statusFilter) return false
    if (riskFilter && getRiskLevel(tx.risk_score) !== riskFilter) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / PAGE_SIZE))
  const paginated = filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: '', label: t('filterAll') },
    { value: 'flagged', label: t('filterFlagged') },
    { value: 'pending', label: t('filterPending') },
    { value: 'approved', label: t('filterApproved') },
    { value: 'declined', label: t('filterDeclined') },
  ]

  const riskOptions: { value: RiskFilter; label: string }[] = [
    { value: '', label: t('filterAll') },
    { value: 'critical', label: t('filterCritical') },
    { value: 'high', label: t('filterHigh') },
    { value: 'medium', label: t('filterMedium') },
    { value: 'low', label: t('filterLow') },
  ]

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm font-medium">{t('failedToLoad')}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          {t('retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-col gap-2">
        {/* Search + filter toggle row */}
        <div className="flex items-center gap-2">
          <div ref={searchRef} className="relative flex-1 sm:max-w-44">
            <Input
              placeholder={t('searchMerchant')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              className="h-8 text-sm"
            />
            {showSuggestions && merchantSuggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md">
                {merchantSuggestions.map((name) => (
                  <button
                    key={name}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted transition-colors"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setSearch(name); setPage(1); setShowSuggestions(false) }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 sm:hidden flex items-center gap-1.5"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            {filtersOpen ? <X className="h-3.5 w-3.5" /> : <SlidersHorizontal className="h-3.5 w-3.5" />}
            {(statusFilter || riskFilter) && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {(statusFilter ? 1 : 0) + (riskFilter ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>
        {/* Filter pills — always visible on sm+, collapsible on mobile */}
        <div className={cn('flex-col gap-2 sm:flex-row sm:flex-wrap', filtersOpen ? 'flex' : 'hidden sm:flex')}>
          <div className="flex w-fit items-center gap-1 rounded-md border p-0.5 overflow-x-auto no-scrollbar">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setStatusFilter(opt.value); setPage(1) }}
                className={cn(
                  'rounded px-2 py-0.5 text-xs font-medium transition-colors whitespace-nowrap',
                  statusFilter === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex w-fit items-center gap-1 rounded-md border p-0.5 overflow-x-auto no-scrollbar">
            {riskOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setRiskFilter(opt.value); setPage(1) }}
                className={cn(
                  'rounded px-2 py-0.5 text-xs font-medium transition-colors whitespace-nowrap',
                  riskFilter === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table className="table-fixed w-full min-w-[600px]">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[18%]" />
            <col className="w-[17%]" />
            <col className="w-[14%]" />
            <col className="w-[18%] hidden sm:table-column" />
            <col className="w-[10%] hidden md:table-column" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>{t('merchant')}</TableHead>
              <TableHead>{t('amount')}</TableHead>
              <TableHead>{t('riskScore')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('date')}</TableHead>
              <TableHead className="hidden md:table-cell text-right">{t('user')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : !filtered?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  {t('noTransactions')}
                </TableCell>
              </TableRow>
            ) : (
              paginated!.map((transaction) => {
                const riskLevel = getRiskLevel(transaction.risk_score)
                return (
                  <TableRow
                    key={transaction.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onSelectTransaction(transaction)}
                  >
                    <TableCell className="font-medium">{transaction.merchant_name}</TableCell>
                    <TableCell className="font-mono">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('text-xs min-w-[100px] sm:w-fit sm:min-w-0 justify-center', RISK_BADGE_CLASSES[riskLevel])}
                      >
                        {RISK_LEVEL_LABELS[riskLevel]} — {transaction.risk_score}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('text-xs capitalize', STATUS_BADGE_CLASSES[transaction.status])}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {formatDate(transaction.created_at)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right font-mono text-xs text-muted-foreground">
                      {transaction.user_id.slice(0, 8)}…
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground border-t">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading transactions…
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && (filtered?.length ?? 0) > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered!.length)} / {filtered!.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹ Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                className="h-7 w-7 p-0 text-xs"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next ›
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
