import { createContext, useContext, useState } from 'react'
import { translations, type Locale, type TranslationKey } from '@/i18n/translations'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
  formatCurrency: (amount: number, currency?: string) => string
  formatDate: (dateString: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('cs-CZ')

  function t(key: TranslationKey): string {
    return translations[locale][key] as string
  }

  const localeCurrency: Record<Locale, string> = {
    'cs-CZ': 'CZK',
    'pl-PL': 'PLN',
  }

  function formatCurrency(amount: number, currency?: string): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency ?? localeCurrency[locale],
      minimumFractionDigits: 2,
    }).format(amount)
  }

  function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, formatCurrency, formatDate }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider')
  return ctx
}
