import { useState, useRef, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
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
import { AlertCircle, Loader2, RefreshCw, SlidersHorizontal, X, Upload, ListPlus } from 'lucide-react'
import { useGetTransactionsQuery } from '@/features/transactions/transactionsApi'
import { getRiskLevel, RISK_LEVEL_LABELS } from '@/types/transaction'
import { cn } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'
import { useAppDispatch } from '@/app/hooks'
import { addManyToQueue } from '@/features/reviewQueue/reviewQueueSlice'
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
  onUploadFile: (file: File) => void
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell className="w-8 px-3" />
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

export default function TransactionTable({ onSelectTransaction, onUploadFile }: TransactionTableProps) {
  const { data: transactions, isLoading, isError, refetch } = useGetTransactionsQuery()
  const dispatch = useAppDispatch()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (!paginated) return
    const pageIds = paginated.map((tx) => tx.id)
    const allSelected = pageIds.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
  }

  function addSelectedToQueue() {
    const txs = (transactions ?? []).filter((tx) => selected.has(tx.id))
    dispatch(addManyToQueue(txs))
    setSelected(new Set())
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) onUploadFile(acceptedFiles[0])
  }, [onUploadFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    multiple: false,
    // Only active when table is empty
    noClick: !!(isLoading || transactions?.length),
    noDrag: !!(isLoading || transactions?.length),
  })
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
      {/* Filter bar — only shown when there is data */}
      {!!transactions?.length && (
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
      )}

      {/* Add-to-Queue action bar — visible when rows are selected */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-sm text-muted-foreground">
            {selected.size} {t('selected')}
          </span>
          <Button size="sm" className="h-7 ml-auto gap-1.5" onClick={addSelectedToQueue}>
            <ListPlus className="h-3.5 w-3.5" />
            {t('addSelectedToQueue')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setSelected(new Set())}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <div
        {...getRootProps()}
        className={cn(
          'overflow-x-auto rounded-md border transition-colors',
          !isLoading && !transactions?.length && isDragActive && 'border-primary bg-primary/5',
          !isLoading && !transactions?.length && !isDragActive && 'border-dashed border-2',
        )}
        onClick={!isLoading && !transactions?.length ? getRootProps().onClick : undefined}
      >
        <input {...getInputProps()} />
        <Table className="table-fixed w-full min-w-[600px]">
          <colgroup>
            <col className="w-[4%]" />
            <col className="w-[20%]" />
            <col className="w-[16%]" />
            <col className="w-[17%]" />
            <col className="w-[14%]" />
            <col className="w-[18%] hidden sm:table-column" />
            <col className="w-[10%] hidden md:table-column" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 px-0">
                {!!paginated?.length && (
                  <label className="flex h-full w-full cursor-pointer items-center justify-center px-3 py-2">
                    <input
                      type="checkbox"
                      className="cursor-pointer"
                      checked={paginated.every((tx) => selected.has(tx.id))}
                      onChange={toggleSelectAll}
                    />
                  </label>
                )}
              </TableHead>
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
            ) : !transactions?.length ? (
              // Truly empty — full dropzone inside table body
              <TableRow>
                <TableCell colSpan={7}>
                  <div className={cn(
                    'flex flex-col items-center justify-center gap-3 py-16 cursor-pointer select-none',
                    isDragActive ? 'text-primary' : 'text-muted-foreground',
                  )}>
                    <Upload className={cn('h-10 w-10', isDragActive ? 'text-primary animate-bounce' : 'text-muted-foreground/50')} />
                    <p className="text-sm font-medium">
                      {isDragActive ? t('uploadDropHere') : t('uploadDragOrClick')}
                    </p>
                    <p className="text-xs">{t('uploadFileHint')}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : !filtered?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  {t('noTransactions')}
                </TableCell>
              </TableRow>
            ) : (
              paginated!.map((transaction) => {
                const riskLevel = getRiskLevel(transaction.risk_score)
                return (
                  <TableRow
                    key={transaction.id}
                    className={cn('cursor-pointer hover:bg-muted/50', selected.has(transaction.id) && 'bg-muted/40')}
                    onClick={() => onSelectTransaction(transaction)}
                  >
                    <TableCell
                      className="w-8 px-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="flex h-full w-full cursor-pointer items-center justify-center px-3 py-2">
                        <input
                          type="checkbox"
                          className="cursor-pointer"
                          checked={selected.has(transaction.id)}
                          onChange={() => toggleSelect(transaction.id)}
                        />
                      </label>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.merchant_name}</TableCell>
                    <TableCell className="font-mono">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={cn('text-xs min-w-[100px] sm:w-fit sm:min-w-0 justify-center', RISK_BADGE_CLASSES[riskLevel])}
                        >
                          {RISK_LEVEL_LABELS[riskLevel]} — {transaction.risk_score}
                        </Badge>
                        {transaction.risk_score === 0 && transaction.status === 'pending' && (
                          <Badge
                            variant="outline"
                            className="text-xs border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 gap-1"
                          >
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                            {t('needsHumanReview')}
                          </Badge>
                        )}
                      </div>
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
