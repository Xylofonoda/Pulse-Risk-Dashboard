import { describe, it, expect } from 'vitest'
import reviewQueueReducer, {
  addToQueue,
  removeFromQueue,
  clearQueue,
  selectQueueCount,
  selectIsInQueue,
} from './reviewQueueSlice'
import type { Transaction } from '@/types/transaction'

const mockTransaction: Transaction = {
  id: 'test-id-001',
  amount: 5000,
  currency: 'CZK',
  merchant_name: 'Merchant X',
  status: 'flagged',
  risk_score: 75,
  created_at: '2024-01-01T00:00:00Z',
  user_id: '550e8400-e29b-41d4-a716-446655440001',
  risk_factors: ['unusual_location'],
}

const anotherTransaction: Transaction = {
  ...mockTransaction,
  id: 'test-id-002',
  merchant_name: 'Merchant Y',
}

describe('reviewQueueSlice', () => {
  it('initialises with an empty queue', () => {
    const state = reviewQueueReducer(undefined, { type: '@@INIT' })
    expect(state.items).toHaveLength(0)
  })

  it('adds a transaction to the queue', () => {
    const state = reviewQueueReducer(undefined, addToQueue(mockTransaction))
    expect(state.items).toHaveLength(1)
    expect(state.items[0].id).toBe('test-id-001')
  })

  it('does not add the same transaction twice', () => {
    let state = reviewQueueReducer(undefined, addToQueue(mockTransaction))
    state = reviewQueueReducer(state, addToQueue(mockTransaction))
    expect(state.items).toHaveLength(1)
  })

  it('adds multiple distinct transactions', () => {
    let state = reviewQueueReducer(undefined, addToQueue(mockTransaction))
    state = reviewQueueReducer(state, addToQueue(anotherTransaction))
    expect(state.items).toHaveLength(2)
  })

  it('removes a transaction by id', () => {
    let state = reviewQueueReducer(undefined, addToQueue(mockTransaction))
    state = reviewQueueReducer(state, removeFromQueue('test-id-001'))
    expect(state.items).toHaveLength(0)
  })

  it('ignores removal of a non-existent id', () => {
    let state = reviewQueueReducer(undefined, addToQueue(mockTransaction))
    state = reviewQueueReducer(state, removeFromQueue('no-such-id'))
    expect(state.items).toHaveLength(1)
  })

  it('clears all items from the queue', () => {
    let state = reviewQueueReducer(undefined, addToQueue(mockTransaction))
    state = reviewQueueReducer(state, addToQueue(anotherTransaction))
    state = reviewQueueReducer(state, clearQueue())
    expect(state.items).toHaveLength(0)
  })

  it('selectQueueCount returns the correct count', () => {
    const store = {
      reviewQueue: reviewQueueReducer(
        reviewQueueReducer(undefined, addToQueue(mockTransaction)),
        addToQueue(anotherTransaction),
      ),
    } as Parameters<typeof selectQueueCount>[0]

    expect(selectQueueCount(store)).toBe(2)
  })

  it('selectIsInQueue returns true when transaction is queued', () => {
    const store = {
      reviewQueue: reviewQueueReducer(undefined, addToQueue(mockTransaction)),
    } as Parameters<typeof selectQueueCount>[0]

    expect(selectIsInQueue('test-id-001')(store)).toBe(true)
  })

  it('selectIsInQueue returns false when transaction is not queued', () => {
    const store = {
      reviewQueue: reviewQueueReducer(undefined, { type: '@@INIT' }),
    } as Parameters<typeof selectQueueCount>[0]

    expect(selectIsInQueue('test-id-001')(store)).toBe(false)
  })
})
