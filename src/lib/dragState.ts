import type { Transaction } from '@/types/transaction'

// Same-page drag and drop is synchronous — a module-level variable is the
// most reliable way to pass a full object without dataTransfer serialization.
let _dragged: Transaction | null = null

export function setDraggedTransaction(tx: Transaction | null) {
  _dragged = tx
}

export function getDraggedTransaction(): Transaction | null {
  return _dragged
}
