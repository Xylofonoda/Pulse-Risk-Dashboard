export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type TransactionStatus = 'flagged' | 'approved' | 'declined' | 'pending'

export interface Transaction {
  id: string
  amount: number
  currency: string
  merchant_name: string
  status: TransactionStatus
  risk_score: number
  created_at: string
  user_id: string
  risk_factors: string[]
}

export interface CreditLimitPayload {
  userId: string
  newLimit: number
  reason: string
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}
