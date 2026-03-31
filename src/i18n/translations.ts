export type Locale = 'cs-CZ' | 'pl-PL'

export const translations = {
  'cs-CZ': {
    // Nav
    appSubtitle: 'Přehled transakčního rizika',
    flagged: 'označeno',
    inQueue: 've frontě',
    // Dashboard
    transactionsTitle: 'Transakce',
    transactionsSubtitle: 'Kliknutím na řádek zobrazíte detaily rizika a upravíte úvěrové limity.',
    // Table headers
    merchant: 'Obchodník',
    amount: 'Částka',
    riskScore: 'Skóre rizika',
    status: 'Status',
    date: 'Datum',
    user: 'Uživatel',
    // Table states
    failedToLoad: 'Načtení transakcí selhalo',
    retry: 'Zkusit znovu',
    noTransactions: 'Žádné transakce nenalezeny.',
    // Modal
    riskAnalysis: 'Analýza rizika',
    riskAnalysisDesc: 'Podrobný přehled rizika pro tuto označenou transakci.',
    riskFactors: 'Rizikové faktory',
    noRiskFactors: 'Žádné rizikové faktory.',
    aiRiskSummary: 'AI shrnutí rizika',
    collapse: 'Sbalit',
    expand: 'Rozbalit',
    generatingSummary: 'Generuji…',
    regenerateSummary: 'Znovu vygenerovat',
    generateAiSummary: 'Vygenerovat AI shrnutí',
    removeFromQueue: 'Odebrat z fronty',
    addToQueue: 'Přidat do fronty',
    adjustCreditLimit: 'Upravit úvěrový limit',
    // Credit Limit Form
    newCreditLimit: 'Nový úvěrový limit (CZK)',
    reasonForAdjustment: 'Důvod úpravy',
    reasonPlaceholder: 'Uveďte důvod pro tuto úpravu (min. 10 znaků)…',
    applying: 'Nahrávám…',
    applyLimitChange: 'Použít změnu limitu',
    creditLimitUpdated: 'Kreditní limit aktualizován',
    newLimitApplied: 'Nový limit {amount} CZK byl nastaven.',
    updateFailed: 'Aktualizace selhala',
    updateFailedDesc: 'Nepodařilo se aktualizovat kreditní limit. Zkuste to prosím znovu.',
    // Review Queue
    reviewQueue: 'Fronta ke kontrole',
    clearAll: 'Vymazat vše',
    noTransactionsQueued: 'Žádné transakce ve frontě.',
    clickAddToQueue: 'Klikněte na "Přidat do fronty" u libovolné transakce.',
    // Filters
    filterAll: 'Vše',
    filterFlagged: 'Označeno',
    filterPending: 'Čekající',
    filterApproved: 'Schváleno',
    filterDeclined: 'Odmítnuto',
    filterRisk: 'Riziko',
    filterCritical: 'Kritické',
    filterHigh: 'Vysoké',
    filterMedium: 'Střední',
    filterLow: 'Nízké',
    searchMerchant: 'Hledat obchodníka…',
    // Theme
    lightMode: 'Světlý',
    darkMode: 'Tmavý',
    // Enqueue
    enqueueAllRisky: 'Zařadit vše rizikové',
    highRisk: 'vysoce rizikové',
    analyzeAll: 'Analyzovat vše AI',
    analyzing: 'Analyzuji',
    // Queue actions
    approve: 'Schválit',
    decline: 'Odmítnout',
    approved: 'Schváleno',
    declined: 'Odmítnuto',
    // Footer
    footerText: '© 2026 Twisto Pulse · Přehled transakčního rizika',
    // Auto approve
    autoApproved: 'Automaticky schváleno',
    autoApprovedDesc: 'Transakce byla automaticky schválena (riziko < 50).',
  },
  'pl-PL': {
    // Nav
    appSubtitle: 'Pulpit ryzyka transakcji',
    flagged: 'oznaczono',
    inQueue: 'w kolejce',
    // Dashboard
    transactionsTitle: 'Transakcje',
    transactionsSubtitle:
      'Kliknij dowolny wiersz, aby przejrzeć szczegóły ryzyka i dostosować limity kredytowe.',
    // Table headers
    merchant: 'Sprzedawca',
    amount: 'Kwota',
    riskScore: 'Wynik ryzyka',
    status: 'Status',
    date: 'Data',
    user: 'Użytkownik',
    // Table states
    failedToLoad: 'Nie udało się załadować transakcji',
    retry: 'Spróbuj ponownie',
    noTransactions: 'Nie znaleziono transakcji.',
    // Modal
    riskAnalysis: 'Analiza ryzyka',
    riskAnalysisDesc: 'Szczegółowy przegląd ryzyka dla tej oznaczonej transakcji.',
    riskFactors: 'Czynniki ryzyka',
    noRiskFactors: 'Brak zarejestrowanych czynników ryzyka.',
    aiRiskSummary: 'Podsumowanie ryzyka AI',
    collapse: 'Zwiń',
    expand: 'Rozwiń',
    generatingSummary: 'Generowanie…',
    regenerateSummary: 'Wygeneruj ponownie',
    generateAiSummary: 'Wygeneruj podsumowanie AI',
    removeFromQueue: 'Usuń z kolejki',
    addToQueue: 'Dodaj do kolejki',
    adjustCreditLimit: 'Dostosuj limit kredytowy',
    // Credit Limit Form
    newCreditLimit: 'Nowy limit kredytowy (CZK)',
    reasonForAdjustment: 'Powód korekty',
    reasonPlaceholder: 'Podaj uzasadnienie tej korekty (min. 10 znaków)…',
    applying: 'Stosowanie…',
    applyLimitChange: 'Zastosuj zmianę limitu',
    creditLimitUpdated: 'Limit kredytowy zaktualizowany',
    newLimitApplied: 'Nowy limit {amount} CZK zastosowany.',
    updateFailed: 'Aktualizacja nie powiodła się',
    updateFailedDesc: 'Nie udało się zaktualizować limitu kredytowego. Spróbuj ponownie.',
    // Review Queue
    reviewQueue: 'Kolejka przeglądania',
    clearAll: 'Wyczyść wszystko',
    noTransactionsQueued: 'Brak transakcji w kolejce.',
    clickAddToQueue: 'Kliknij "Dodaj do kolejki" dla dowolnej transakcji.',
    // Filters
    filterAll: 'Wszystkie',
    filterFlagged: 'Oznaczone',
    filterPending: 'Oczekujące',
    filterApproved: 'Zatwierdzone',
    filterDeclined: 'Odrzucone',
    filterRisk: 'Ryzyko',
    filterCritical: 'Krytyczne',
    filterHigh: 'Wysokie',
    filterMedium: 'Średnie',
    filterLow: 'Niskie',
    searchMerchant: 'Szukaj sprzedawcy…',
    // Theme
    lightMode: 'Jasny',
    darkMode: 'Ciemny',
    // Enqueue
    enqueueAllRisky: 'Dodaj wszystkie ryzykowne',
    highRisk: 'wysokiego ryzyka',
    analyzeAll: 'Analizuj wszystko AI',
    analyzing: 'Analizuję',
    // Queue actions
    approve: 'Zatwierdź',
    decline: 'Odrzuć',
    approved: 'Zatwierdzone',
    declined: 'Odrzucone',
    // Footer
    footerText: '© 2026 Twisto Pulse · Pulpit ryzyka transakcji',
    // Auto approve
    autoApproved: 'Automatycznie zatwierdzone',
    autoApprovedDesc: 'Transakcja została automatycznie zatwierdzona (ryzyko < 50).',
  },
} as const

export type TranslationKey = keyof (typeof translations)['cs-CZ']
