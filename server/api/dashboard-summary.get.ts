export default defineEventHandler(async (event) => {
  const { mode, dataClient } = await getVerifiedAdminDataClient(event)

  const [
    profilesTotal,
    creatorsTotal,
    transactionsTotal,
    guestsTotal,
    verifiedAdmins,
    kycPending,
    kycUnverified,
    kycVerified,
    subscriptionsActive,
    subscriptionsFreemium,
    subscriptionsPro,
    productsTotal,
    moviesTotal,
    moviesPublished,
    articlesPublished,
    guidesPublished,
    ledgerEntriesTotal,
    transactionsSuccessful,
    payoutRequestsTotal
  ] = await Promise.all([
    getExactCount(dataClient.from('profiles').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'creator')),
    getExactCount(dataClient.from('transactions').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('guests').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('profiles').select('*', { count: 'exact', head: true }).eq('verified_by_admin', true)),
    getExactCount(dataClient.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending')),
    getExactCount(dataClient.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'unverified')),
    getExactCount(dataClient.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'verified')),
    getExactCount(dataClient.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')),
    getExactCount(dataClient.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan_name', 'Freemium')),
    getExactCount(dataClient.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan_name', 'Pro')),
    getExactCount(dataClient.from('products').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('movies').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('movies').select('*', { count: 'exact', head: true }).eq('is_published', true)),
    getExactCount(dataClient.from('kakofi_articles').select('*', { count: 'exact', head: true }).eq('status', 'published')),
    getExactCount(dataClient.from('kakofi_guides').select('*', { count: 'exact', head: true }).eq('status', 'published')),
    getExactCount(dataClient.from('ledger_entries').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'successful')),
    getExactCount(dataClient.from('payout_requests').select('*', { count: 'exact', head: true }))
  ])

  return {
    mode,
    metrics: {
      profilesTotal,
      creatorsTotal,
      transactionsTotal,
      guestsTotal,
      verifiedAdmins,
      kycPending,
      kycUnverified,
      kycVerified,
      subscriptionsActive,
      subscriptionsFreemium,
      subscriptionsPro,
      productsTotal,
      moviesTotal,
      moviesPublished,
      articlesPublished,
      guidesPublished,
      ledgerEntriesTotal,
      transactionsSuccessful,
      payoutRequestsTotal
    }
  }
})
