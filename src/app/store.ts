import { configureStore } from '@reduxjs/toolkit'
import { transactionsApi } from '@/features/transactions/transactionsApi'
import reviewQueueReducer from '@/features/reviewQueue/reviewQueueSlice'

export const store = configureStore({
  reducer: {
    [transactionsApi.reducerPath]: transactionsApi.reducer,
    reviewQueue: reviewQueueReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(transactionsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
