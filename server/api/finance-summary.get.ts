interface LedgerEntryRow {
  id: string
  entry_type: string
  amount: number | string
  currency: string | null
  description: string | null
  created_at: string | null
}

export default defineEventHandler(async (event) => {
  const { mode, dataClient } = await getVerifiedAdminDataClient(event)

  const [transactions, ledgerEntries, payoutRequests, payouts, platformRevenueRows, successfulTransactions, transactionAmountsResult, ledgerAmountsResult, platformRevenueAmountsResult, ledgerResult] = await Promise.all([
    getExactCount(dataClient.from('transactions').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('ledger_entries').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('payout_requests').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('payouts').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('platform_revenue').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'successful')),
    dataClient
      .from('transactions')
      .select('amount, status, currency, provider_transaction_id')
      .limit(2000),
    dataClient
      .from('ledger_entries')
      .select('amount')
      .limit(5000),
    dataClient
      .from('platform_revenue')
      .select('amount')
      .limit(5000),
    dataClient
      .from('ledger_entries')
      .select('id, entry_type, amount, currency, description, created_at')
      .order('created_at', { ascending: false })
      .limit(2000)
  ])

  if (transactionAmountsResult.error) {
    throw createError({ statusCode: 500, statusMessage: transactionAmountsResult.error.message })
  }

  if (ledgerAmountsResult.error) {
    throw createError({ statusCode: 500, statusMessage: ledgerAmountsResult.error.message })
  }

  if (platformRevenueAmountsResult.error) {
    throw createError({ statusCode: 500, statusMessage: platformRevenueAmountsResult.error.message })
  }

  if (ledgerResult.error) {
    throw createError({ statusCode: 500, statusMessage: ledgerResult.error.message })
  }

  const totalAmount = (transactionAmountsResult.data ?? []).reduce((sum, row) => {
    const amount = Number(row.amount)
    return Number.isFinite(amount) ? sum + amount : sum
  }, 0)

  const successfulAmount = (transactionAmountsResult.data ?? []).reduce((sum, row) => {
    if (row.status !== 'successful') return sum
    const amount = Number(row.amount)
    return Number.isFinite(amount) ? sum + amount : sum
  }, 0)

  const stripeTransactions = (transactionAmountsResult.data ?? []).filter((row) => row.provider_transaction_id?.startsWith('cs_'))
  const paypackTransactions = (transactionAmountsResult.data ?? []).filter((row) => row.provider_transaction_id?.startsWith('PPK_'))

  const stripeTransactionCount = stripeTransactions.length
  const paypackTransactionCount = paypackTransactions.length

  const totalUsdAmount = (transactionAmountsResult.data ?? []).reduce((sum, row) => {
    if ((row.currency ?? '').toUpperCase() !== 'USD') return sum
    const amount = Number(row.amount)
    return Number.isFinite(amount) ? sum + amount : sum
  }, 0)

  const totalRwfAmount = (transactionAmountsResult.data ?? []).reduce((sum, row) => {
    if ((row.currency ?? '').toUpperCase() !== 'RWF') return sum
    const amount = Number(row.amount)
    return Number.isFinite(amount) ? sum + amount : sum
  }, 0)

  const stripeUsdAmount = stripeTransactions.reduce((sum, row) => {
    if ((row.currency ?? '').toUpperCase() !== 'USD') return sum
    const amount = Number(row.amount)
    return Number.isFinite(amount) ? sum + amount : sum
  }, 0)

  const ledgerAmount = (ledgerAmountsResult.data ?? []).reduce((sum, row) => {
    const amount = Number(row.amount)
    return Number.isFinite(amount) ? sum + amount : sum
  }, 0)

  const platformFeeAmount = (platformRevenueAmountsResult.data ?? []).reduce((sum, row) => {
    const amount = Number(row.amount)
    return Number.isFinite(amount) ? sum + amount : sum
  }, 0)

  const netLedgerAfterPlatformFees = ledgerAmount - platformFeeAmount

  return {
    mode,
    metrics: {
      transactions,
      ledgerEntries,
      payoutRequests,
      payouts,
      platformRevenueRows,
      successfulTransactions,
      totalAmount,
      successfulAmount,
      stripeTransactionCount,
      paypackTransactionCount,
      totalUsdAmount,
      totalRwfAmount,
      stripeUsdAmount,
      ledgerAmount,
      platformFeeAmount,
      netLedgerAfterPlatformFees
    },
    ledgerRows: (ledgerResult.data ?? []) as LedgerEntryRow[]
  }
})
