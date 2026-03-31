import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Transaction, TransactionStatus, CreditLimitPayload } from '@/types/transaction'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const transactionsApi = createApi({
  reducerPath: 'transactionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${SUPABASE_URL}/rest/v1/`,
    prepareHeaders: (headers) => {
      headers.set('apikey', SUPABASE_ANON_KEY)
      headers.set('Authorization', `Bearer ${SUPABASE_ANON_KEY}`)
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Transaction', 'CreditLimit'],
  endpoints: (builder) => ({
    getTransactions: builder.query<Transaction[], void>({
      query: () => 'transactions?select=*&order=created_at.desc',
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Transaction' as const, id })),
            { type: 'Transaction', id: 'LIST' },
          ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),

    getTransactionById: builder.query<Transaction, string>({
      query: (id) => `transactions?id=eq.${id}&select=*`,
      transformResponse: (response: Transaction[]) => response[0],
      providesTags: (_result, _error, id) => [{ type: 'Transaction', id }],
    }),

    updateCreditLimit: builder.mutation<void, CreditLimitPayload>({
      query: ({ userId, newLimit, reason }) => ({
        url: `user_credit_limits?user_id=eq.${userId}`,
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: {
          credit_limit: newLimit,
          reason,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: [{ type: 'CreditLimit', id: 'LIST' }],
    }),

    generateRiskSummary: builder.mutation<{ summary: string; risk_factors: string[]; risk_score: number; status: string; auto_approved: boolean }, string>({
      query: (transactionId) => ({
        url: `${SUPABASE_URL}/functions/v1/generate-risk-summary`,
        method: 'POST',
        body: { transactionId },
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
      }),
      invalidatesTags: (_result, _error, transactionId) => [
        { type: 'Transaction', id: transactionId },
        { type: 'Transaction', id: 'LIST' },
      ],
    }),

    updateTransactionStatus: builder.mutation<void, { id: string; status: TransactionStatus }>({
      query: ({ id, status }) => ({
        url: `transactions?id=eq.${id}`,
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useUpdateCreditLimitMutation,
  useGenerateRiskSummaryMutation,
  useUpdateTransactionStatusMutation,
} = transactionsApi
