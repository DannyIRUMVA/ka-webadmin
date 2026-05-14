export default defineEventHandler(async (event) => {
  const { mode, dataClient } = await getVerifiedAdminDataClient(event)

  const [products, activeProducts, movies, publishedMovies, articles, publishedArticles, guides, publishedGuides, productsResult, moviesResult] = await Promise.all([
    getExactCount(dataClient.from('products').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true)),
    getExactCount(dataClient.from('movies').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('movies').select('*', { count: 'exact', head: true }).eq('is_published', true)),
    getExactCount(dataClient.from('kakofi_articles').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('kakofi_articles').select('*', { count: 'exact', head: true }).eq('status', 'published')),
    getExactCount(dataClient.from('kakofi_guides').select('*', { count: 'exact', head: true })),
    getExactCount(dataClient.from('kakofi_guides').select('*', { count: 'exact', head: true }).eq('status', 'published')),
    dataClient.from('products').select('id, name, is_active, created_at').order('created_at', { ascending: false }).limit(5),
    dataClient.from('movies').select('id, title, is_published, updated_at').order('updated_at', { ascending: false }).limit(5)
  ])

  if (productsResult.error) {
    throw createError({ statusCode: 500, statusMessage: productsResult.error.message })
  }

  if (moviesResult.error) {
    throw createError({ statusCode: 500, statusMessage: moviesResult.error.message })
  }

  return {
    mode,
    metrics: {
      products,
      activeProducts,
      movies,
      publishedMovies,
      articles,
      publishedArticles,
      guides,
      publishedGuides
    },
    recentProducts: productsResult.data ?? [],
    recentMovies: moviesResult.data ?? []
  }
})
