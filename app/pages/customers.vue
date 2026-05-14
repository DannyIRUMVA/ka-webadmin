<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

interface GuestRow {
  id: string
  name: string | null
  email: string | null
  created_at: string | null
}

interface ClientRow {
  id: string
  name: string | null
  email: string | null
  created_at: string | null
}

interface FeedbackRow {
  id: string
  content: string
  rating: number | null
  created_at: string | null
}

const { $supabase } = useNuxtApp()
const { onAction, downloadJson } = useAdminPageActions()

const loading = ref(true)
const errorMessage = ref<string | null>(null)
const recentGuests = ref<GuestRow[]>([])
const recentClients = ref<ClientRow[]>([])
const recentFeedback = ref<FeedbackRow[]>([])

const metrics = reactive({
  guests: 0,
  clients: 0,
  feedback: 0
})

const getCount = async (builder: Promise<{ count: number | null, error: { message: string } | null }>) => {
  const { count, error } = await builder
  if (error) throw new Error(error.message)
  return count ?? 0
}

const loadAudience = async () => {
  if (!import.meta.client) return

  loading.value = true
  errorMessage.value = null

  try {
    const [guests, clients, feedback, guestsResult, clientsResult, feedbackResult] = await Promise.all([
      getCount($supabase.from('guests').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('clients').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('feedbacks').select('*', { count: 'exact', head: true })),
      $supabase.from('guests').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(5),
      $supabase.from('clients').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(5),
      $supabase.from('feedbacks').select('id, content, rating, created_at').order('created_at', { ascending: false }).limit(5)
    ])

    if (guestsResult.error) throw new Error(guestsResult.error.message)
    if (clientsResult.error) throw new Error(clientsResult.error.message)
    if (feedbackResult.error) throw new Error(feedbackResult.error.message)

    Object.assign(metrics, { guests, clients, feedback })
    recentGuests.value = (guestsResult.data ?? []) as GuestRow[]
    recentClients.value = (clientsResult.data ?? []) as ClientRow[]
    recentFeedback.value = (feedbackResult.data ?? []) as FeedbackRow[]
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load audience data.'
  } finally {
    loading.value = false
  }
}

const stats = computed(() => [
  { label: 'Guests', value: String(metrics.guests), note: 'Main audience type' },
  { label: 'Clients', value: String(metrics.clients), note: 'Small creator-linked table' },
  { label: 'Feedback', value: String(metrics.feedback), note: 'Current explicit feedback rows' }
])

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

onAction('audience-export', () => {
  downloadJson('audience-summary.json', {
    exportedAt: new Date().toISOString(),
    metrics: { ...metrics },
    recentGuests: recentGuests.value,
    recentClients: recentClients.value,
    recentFeedback: recentFeedback.value
  })
})

onMounted(() => {
  loadAudience()
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="errorMessage" class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-[#111214] dark:text-slate-400">
      Loading audience data...
    </div>

    <template v-else>
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard v-for="item in stats" :key="item.label" :label="item.label" :value="item.value" :note="item.note" accent />
      </section>

      <section class="grid gap-4 lg:grid-cols-3">
        <AdminPanelCard title="Recent guests" accent>
          <div v-if="recentGuests.length === 0" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
            No guest rows available.
          </div>
          <div v-else class="space-y-2">
            <div v-for="row in recentGuests" :key="row.id" class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
              <p class="text-sm font-medium text-slate-900 dark:text-white">{{ row.name || 'Unnamed guest' }}</p>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ row.email || 'No email' }} • {{ formatDate(row.created_at) }}</p>
            </div>
          </div>
        </AdminPanelCard>

        <AdminPanelCard title="Recent clients" accent>
          <div v-if="recentClients.length === 0" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
            No client rows available.
          </div>
          <div v-else class="space-y-2">
            <div v-for="row in recentClients" :key="row.id" class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
              <p class="text-sm font-medium text-slate-900 dark:text-white">{{ row.name || 'Unnamed client' }}</p>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ row.email || 'No email' }} • {{ formatDate(row.created_at) }}</p>
            </div>
          </div>
        </AdminPanelCard>

        <AdminPanelCard title="Recent feedback" accent>
          <div v-if="recentFeedback.length === 0" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
            No feedback rows available.
          </div>
          <div v-else class="space-y-2">
            <div v-for="row in recentFeedback" :key="row.id" class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
              <p class="text-sm font-medium text-slate-900 dark:text-white">Rating: {{ row.rating ?? '—' }}</p>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ row.content }}</p>
            </div>
          </div>
        </AdminPanelCard>
      </section>
    </template>
  </div>
</template>
