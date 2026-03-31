import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Transaction } from '@/types/transaction'
import type { RootState } from '@/app/store'

interface ReviewQueueState {
  items: Transaction[]
}

const initialState: ReviewQueueState = {
  items: [],
}

export const reviewQueueSlice = createSlice({
  name: 'reviewQueue',
  initialState,
  reducers: {
    addToQueue(state, action: PayloadAction<Transaction>) {
      const exists = state.items.some((t) => t.id === action.payload.id)
      if (!exists) {
        state.items.push(action.payload)
      }
    },
    removeFromQueue(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload)
    },
    clearQueue(state) {
      state.items = []
    },
    addManyToQueue(state, action: PayloadAction<Transaction[]>) {
      for (const tx of action.payload) {
        if (!state.items.some((t) => t.id === tx.id)) {
          state.items.push(tx)
        }
      }
    },
  },
})

export const { addToQueue, removeFromQueue, clearQueue, addManyToQueue } = reviewQueueSlice.actions

// Selectors
export const selectQueueItems = (state: RootState) => state.reviewQueue.items
export const selectQueueCount = (state: RootState) => state.reviewQueue.items.length
export const selectIsInQueue = (id: string) => (state: RootState) =>
  state.reviewQueue.items.some((t) => t.id === id)

export default reviewQueueSlice.reducer
