export default defineEventHandler(async (event) => {
  const { mode, dataClient } = await getVerifiedAdminDataClient(event)

  const [total, successful, completed, recentResult] = await Promise.all([
    getExactCount(dataClient.from('transactions').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'successful')),
    getExactCount(dataClient.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'completed')),
    dataClient
      .from('transactions')
      .select('id, amount, currency, status, created_at, creator_id, product_id, movie_id, guest_id, provider_transaction_id')
      .order('created_at', { ascending: false })
      .limit(8)
  ])

  if (recentResult.error) {
    throw createError({ statusCode: 500, statusMessage: recentResult.error.message })
  }

  return {
    mode,
    metrics: {
      total,
      successful,
      completed
    },
    recentTransactions: recentResult.data ?? []
  }
})
