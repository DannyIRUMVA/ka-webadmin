export default defineEventHandler(async (event) => {
  const { mode, dataClient } = await getVerifiedAdminDataClient(event)
  const guestId = getQuery(event).guestId

  if (typeof guestId !== 'string' || !guestId) {
    return {
      mode,
      guestPurchases: []
    }
  }

  const { data, error } = await dataClient
    .from('transactions')
    .select('id, amount, currency, status, created_at, product_id, movie_id, provider_transaction_id')
    .eq('guest_id', guestId)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    mode,
    guestPurchases: data ?? []
  }
})
