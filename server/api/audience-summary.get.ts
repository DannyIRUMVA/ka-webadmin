export default defineEventHandler(async (event) => {
  const { mode, dataClient } = await getVerifiedAdminDataClient(event)

  const [guests, clients, feedback, guestsResult, clientsResult, feedbackResult] = await Promise.all([
    getExactCount(dataClient.from('guests').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('clients').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('feedbacks').select('*', { count: 'exact', head: true })),
    dataClient.from('guests').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(6),
    dataClient.from('clients').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(5),
    dataClient.from('feedbacks').select('id, content, rating, created_at').order('created_at', { ascending: false }).limit(5)
  ])

  if (guestsResult.error) {
    throw createError({ statusCode: 500, statusMessage: guestsResult.error.message })
  }

  if (clientsResult.error) {
    throw createError({ statusCode: 500, statusMessage: clientsResult.error.message })
  }

  if (feedbackResult.error) {
    throw createError({ statusCode: 500, statusMessage: feedbackResult.error.message })
  }

  return {
    mode,
    metrics: {
      guests,
      clients,
      feedback
    },
    recentGuests: guestsResult.data ?? [],
    recentClients: clientsResult.data ?? [],
    recentFeedback: feedbackResult.data ?? []
  }
})
