import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect } from 'vitest'
import TransactionCard from './TransactionCard'
import reviewQueueReducer from '@/features/reviewQueue/reviewQueueSlice'
import { transactionsApi } from '@/features/transactions/transactionsApi'
import type { Transaction } from '@/types/transaction'

const mockTransaction: Transaction = {
  id: 'abc-123-test',
  amount: 15000,
  currency: 'CZK',
  merchant_name: 'Acme Electronics',
  status: 'flagged',
  risk_score: 85,
  created_at: '2024-06-15T10:30:00Z',
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  risk_factors: ['unusual_amount', 'new_merchant'],
}

function renderWithStore(ui: React.ReactElement) {
  const store = configureStore({
    reducer: {
      [transactionsApi.reducerPath]: transactionsApi.reducer,
      reviewQueue: reviewQueueReducer,
    },
    middleware: (getDefault) => getDefault().concat(transactionsApi.middleware),
  })
  return { ...render(<Provider store={store}>{ui}</Provider>), store }
}

describe('TransactionCard', () => {
  it('renders the merchant name', () => {
    renderWithStore(<TransactionCard transaction={mockTransaction} />)
    expect(screen.getByText('Acme Electronics')).toBeInTheDocument()
  })

  it('renders the formatted amount', () => {
    renderWithStore(<TransactionCard transaction={mockTransaction} />)
    // Czech locale formats 15000 as "15 000" or "15 000,00 Kč"
    expect(screen.getByText(/15[^\d]000/)).toBeInTheDocument()
  })

  it('renders the Critical risk badge', () => {
    renderWithStore(<TransactionCard transaction={mockTransaction} />)
    expect(screen.getByText(/critical/i)).toBeInTheDocument()
  })

  it('renders the transaction status badge', () => {
    renderWithStore(<TransactionCard transaction={mockTransaction} />)
    expect(screen.getByText('flagged')).toBeInTheDocument()
  })

  it('renders the "Add to Queue" button initially', () => {
    renderWithStore(<TransactionCard transaction={mockTransaction} />)
    expect(screen.getByRole('button', { name: /add to queue/i })).toBeInTheDocument()
  })

  it('adds transaction to Redux store on button click', async () => {
    const user = userEvent.setup()
    const { store } = renderWithStore(<TransactionCard transaction={mockTransaction} />)

    await user.click(screen.getByRole('button', { name: /add to queue/i }))

    const state = store.getState()
    expect(state.reviewQueue.items).toHaveLength(1)
    expect(state.reviewQueue.items[0].id).toBe('abc-123-test')
  })

  it('shows "In Queue" and disables button after adding', async () => {
    const user = userEvent.setup()
    renderWithStore(<TransactionCard transaction={mockTransaction} />)

    await user.click(screen.getByRole('button', { name: /add to queue/i }))

    const button = screen.getByRole('button', { name: /in queue/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    renderWithStore(<TransactionCard transaction={mockTransaction} onClick={handleClick} />)

    // Click the card area (not the button)
    await user.click(screen.getByText('Acme Electronics'))

    expect(handleClick).toHaveBeenCalledOnce()
  })
})
