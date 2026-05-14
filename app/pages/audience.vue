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

interface GuestPurchaseRow {
  id: number
  amount: number | string
  currency: string | null
  status: string | null
  created_at: string | null
  product_id: number | null
  movie_id: string | null
  provider_transaction_id: string | null
}

const { $supabase } = useNuxtApp()
const { onAction, downloadJson } = useAdminPageActions()

const loading = ref(true)
const errorMessage = ref<string | null>(null)
const guestPurchasesLoading = ref(false)
const guestPurchasesError = ref<string | null>(null)
const recentGuests = ref<GuestRow[]>([])
const recentClients = ref<ClientRow[]>([])
const recentFeedback = ref<FeedbackRow[]>([])
const selectedGuestId = ref<string | null>(null)
const guestPurchases = ref<GuestPurchaseRow[]>([])

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

const loadGuestPurchases = async (guestId: string | null) => {
  if (!import.meta.client || !guestId) {
    guestPurchases.value = []
    guestPurchasesError.value = null
    return
  }

  guestPurchasesLoading.value = true
  guestPurchasesError.value = null

  try {
    const { data, error } = await $supabase
      .from('transactions')
      .select('id, amount, currency, status, created_at, product_id, movie_id, provider_transaction_id')
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) throw new Error(error.message)

    guestPurchases.value = (data ?? []) as GuestPurchaseRow[]
  } catch (error) {
    guestPurchases.value = []
    guestPurchasesError.value = error instanceof Error ? error.message : 'Unable to load guest purchases.'
  } finally {
    guestPurchasesLoading.value = false
  }
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
      $supabase.from('guests').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(6),
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

    const nextSelectedGuestId = recentGuests.value.find(guest => guest.id === selectedGuestId.value)?.id
      ?? recentGuests.value[0]?.id
      ?? null

    selectedGuestId.value = nextSelectedGuestId
    await loadGuestPurchases(nextSelectedGuestId)
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

const audienceHighlights = computed(() => [
  { label: 'Guest records', value: String(metrics.guests) },
  { label: 'Recent guest sample', value: String(recentGuests.value.length) },
  { label: 'Selected guest purchases', value: String(guestPurchases.value.length) },
  { label: 'Feedback rows', value: String(metrics.feedback) }
])

const selectedGuest = computed(() => recentGuests.value.find(guest => guest.id === selectedGuestId.value) ?? null)

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const formatAmount = (amount: number | string, currency: string | null) => {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount)
  if (Number.isFinite(numericAmount)) return `${currency || '—'} ${numericAmount.toLocaleString()}`
  return `${currency || '—'} ${amount}`
}

const purchaseAsset = (row: GuestPurchaseRow) => {
  if (row.product_id) return 'Product purchase'
  if (row.movie_id) return 'Movie purchase'
  return 'Other purchase'
}

const shortId = (value: string | null) => value ? value.slice(0, 8) : '—'

const selectGuest = async (guestId: string) => {
  if (selectedGuestId.value === guestId) {
    return
  }

  selectedGuestId.value = guestId
  await loadGuestPurchases(guestId)
}

onAction('audience-export', () => {
  downloadJson('audience-summary.json', {
    exportedAt: new Date().toISOString(),
    metrics: { ...metrics },
    recentGuests: recentGuests.value,
    recentClients: recentClients.value,
    recentFeedback: recentFeedback.value,
    selectedGuest: selectedGuest.value,
    guestPurchases: guestPurchases.value
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
      <AdminPanelCard title="Guest audience" subtitle="Live read-only audience summary from the guests table and related audience records." badge="Live data" accent>
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Primary audience record count</p>
            <p class="mt-3 text-5xl font-semibold tracking-tight text-brand">{{ metrics.guests }}</p>
            <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
              The audience page is counting directly from <span class="font-medium text-slate-700 dark:text-slate-200">public.guests</span> and shows a selected guest with recent purchases below.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="item in audienceHighlights"
              :key="item.label"
              class="rounded-2xl bg-brand/10 px-4 py-4 dark:bg-brand/10"
            >
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.label }}</p>
              <p class="mt-2 text-2xl font-semibold">{{ item.value }}</p>
            </div>
          </div>
        </div>
      </AdminPanelCard>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard v-for="item in stats" :key="item.label" :label="item.label" :value="item.value" :note="item.note" accent />
      </section>

      <section class="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <AdminPanelCard title="Guests" :badge="`${recentGuests.length} loaded`" accent>
          <div v-if="recentGuests.length === 0" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
            No guest rows available.
          </div>
          <div v-else class="space-y-2">
            <button
              v-for="row in recentGuests"
              :key="row.id"
              type="button"
              class="w-full rounded-2xl border px-4 py-3 text-left transition"
              :class="selectedGuestId === row.id
                ? 'border-brand bg-brand/15 dark:border-brand dark:bg-brand/15'
                : 'border-transparent bg-brand/10 hover:border-brand/20 dark:bg-brand/10 dark:hover:border-brand/20'"
              @click="selectGuest(row.id)"
            >
              <p class="text-sm font-medium text-slate-900 dark:text-white">{{ row.name || 'Unnamed guest' }}</p>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ row.email || 'No email' }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ formatDate(row.created_at) }}</p>
            </button>
          </div>
        </AdminPanelCard>

        <AdminPanelCard title="Selected guest purchases" :badge="selectedGuest ? 'Live transactions' : 'No guest selected'" accent>
          <div v-if="selectedGuest" class="space-y-4">
            <div class="rounded-2xl bg-brand/10 px-4 py-4 dark:bg-brand/10">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p class="text-lg font-semibold text-slate-900 dark:text-white">{{ selectedGuest.name || 'Unnamed guest' }}</p>
                  <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ selectedGuest.email || 'No email' }}</p>
                  <p class="mt-1 text-xs text-slate-400">Joined: {{ formatDate(selectedGuest.created_at) }}</p>
                </div>
                <div class="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:bg-[#111214] dark:text-slate-300">
                  {{ shortId(selectedGuest.id) }}
                </div>
              </div>
            </div>

            <div v-if="guestPurchasesLoading" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
              Loading guest purchases...
            </div>

            <div v-else-if="guestPurchasesError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              {{ guestPurchasesError }}
            </div>

            <div v-else-if="guestPurchases.length === 0" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
              No purchases found for this guest.
            </div>

            <div v-else class="space-y-2">
              <div v-for="purchase in guestPurchases" :key="purchase.id" class="rounded-2xl bg-brand/10 px-4 py-4 dark:bg-brand/10">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">#{{ purchase.id }} • {{ purchaseAsset(purchase) }}</p>
                    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Status: {{ purchase.status || '—' }} • Provider: {{ shortId(purchase.provider_transaction_id) }}
                    </p>
                  </div>
                  <div class="text-sm lg:text-right">
                    <p class="font-semibold text-slate-900 dark:text-white">{{ formatAmount(purchase.amount, purchase.currency) }}</p>
                    <p class="mt-1 text-slate-500 dark:text-slate-400">{{ formatDate(purchase.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
            No guest selected.
          </div>
        </AdminPanelCard>
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
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
