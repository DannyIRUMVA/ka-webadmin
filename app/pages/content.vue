<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

interface ProductRow {
  id: number
  name: string
  is_active: boolean | null
  created_at: string | null
}

interface MovieRow {
  id: string
  title: string
  is_published: boolean | null
  updated_at: string | null
}

interface ContentSummaryResponse {
  mode: 'verified-admin' | 'session-scoped'
  metrics: {
    products: number
    activeProducts: number
    movies: number
    publishedMovies: number
    articles: number
    publishedArticles: number
    guides: number
    publishedGuides: number
  }
  recentProducts: ProductRow[]
  recentMovies: MovieRow[]
}

const { $supabase } = useNuxtApp()
const { onAction, downloadJson } = useAdminPageActions()

const loading = ref(true)
const errorMessage = ref<string | null>(null)
const recentProducts = ref<ProductRow[]>([])
const recentMovies = ref<MovieRow[]>([])

const metrics = reactive({
  products: 0,
  activeProducts: 0,
  movies: 0,
  publishedMovies: 0,
  articles: 0,
  publishedArticles: 0,
  guides: 0,
  publishedGuides: 0
})

const loadContent = async () => {
  if (!import.meta.client) return

  loading.value = true
  errorMessage.value = null

  try {
    const { data: sessionData, error: sessionError } = await $supabase.auth.getSession()

    if (sessionError) {
      throw new Error(sessionError.message)
    }

    const accessToken = sessionData.session?.access_token

    if (!accessToken) {
      throw new Error('Missing admin session. Please sign in again.')
    }

    const data = await $fetch<ContentSummaryResponse>('/api/content-summary', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    Object.assign(metrics, data.metrics)
    recentProducts.value = data.recentProducts
    recentMovies.value = data.recentMovies
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load content data.'
  } finally {
    loading.value = false
  }
}

const stats = computed(() => [
  { label: 'Products', value: String(metrics.products), note: `${metrics.activeProducts} active` },
  { label: 'Movies', value: String(metrics.movies), note: `${metrics.publishedMovies} published` },
  { label: 'Articles', value: String(metrics.articles), note: `${metrics.publishedArticles} published` },
  { label: 'Guides', value: String(metrics.guides), note: `${metrics.publishedGuides} published` }
])

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

onAction('content-export', () => {
  downloadJson('content-summary.json', {
    exportedAt: new Date().toISOString(),
    metrics: { ...metrics },
    recentProducts: recentProducts.value,
    recentMovies: recentMovies.value
  })
})

onMounted(() => {
  loadContent()
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="errorMessage" class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-[#111214] dark:text-slate-400">
      Loading content data...
    </div>

    <template v-else>
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard v-for="item in stats" :key="item.label" :label="item.label" :value="item.value" :note="item.note" accent />
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <AdminPanelCard title="Recent products" accent>
          <div v-if="recentProducts.length === 0" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
            No product rows available.
          </div>
          <div v-else class="space-y-2">
            <div v-for="row in recentProducts" :key="row.id" class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
              <p class="text-sm font-medium text-slate-900 dark:text-white">{{ row.name }}</p>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {{ row.is_active ? 'Active' : 'Inactive' }} • {{ formatDate(row.created_at) }}
              </p>
            </div>
          </div>
        </AdminPanelCard>

        <AdminPanelCard title="Recent movies" accent>
          <div v-if="recentMovies.length === 0" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
            No movie rows available.
          </div>
          <div v-else class="space-y-2">
            <div v-for="row in recentMovies" :key="row.id" class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
              <p class="text-sm font-medium text-slate-900 dark:text-white">{{ row.title }}</p>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {{ row.is_published ? 'Published' : 'Draft' }} • {{ formatDate(row.updated_at) }}
              </p>
            </div>
          </div>
        </AdminPanelCard>
      </section>
    </template>
  </div>
</template>
