<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

interface TransactionRow {
  id: number
  amount: number | string
  currency: string | null
  status: string | null
  created_at: string | null
  creator_id: string | null
  product_id: number | null
  movie_id: string | null
  guest_id: string | null
  provider_transaction_id?: string | null
}

const { $supabase } = useNuxtApp()
const { onAction, downloadJson } = useAdminPageActions()

const loading = ref(true)
const errorMessage = ref<string | null>(null)
const recentTransactions = ref<TransactionRow[]>([])

const metrics = reactive({
  total: 0,
  successful: 0,
  completed: 0
})

const getCount = async (builder: Promise<{ count: number | null, error: { message: string } | null }>) => {
  const { count, error } = await builder
  if (error) throw new Error(error.message)
  return count ?? 0
}

const loadTransactions = async () => {
  if (!import.meta.client) return

  loading.value = true
  errorMessage.value = null

  try {
    const [total, successful, completed, recentResult] = await Promise.all([
      getCount($supabase.from('transactions').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'successful')),
      getCount($supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'completed')),
      $supabase
        .from('transactions')
        .select('id, amount, currency, status, created_at, creator_id, product_id, movie_id, guest_id, provider_transaction_id')
        .order('created_at', { ascending: false })
        .limit(8)
    ])

    if (recentResult.error) throw new Error(recentResult.error.message)

    Object.assign(metrics, { total, successful, completed })
    recentTransactions.value = (recentResult.data ?? []) as TransactionRow[]
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load transaction data.'
  } finally {
    loading.value = false
  }
}

const stats = computed(() => [
  { label: 'Transactions', value: String(metrics.total), note: 'Total purchase rows' },
  { label: 'Successful', value: String(metrics.successful), note: 'Main transaction status' },
  { label: 'Completed', value: String(metrics.completed), note: 'Legacy success status' }
])

const breakdown = computed(() => [
  { label: 'successful', value: String(metrics.successful) },
  { label: 'completed', value: String(metrics.completed) }
])

const fields = [
  'product_id or movie_id',
  'creator_id',
  'guest_id',
  'amount and currency',
  'provider_transaction_id'
]

const notes = [
  'This page is now using read-only Supabase transaction data.',
  'Most useful columns are status, amount, creator, asset type, and created_at.',
  'Exception review should focus on rare non-standard rows.'
]

const formatAmount = (amount: number | string, currency: string | null) => {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount)
  if (Number.isFinite(numericAmount)) return `${currency || '—'} ${numericAmount.toLocaleString()}`
  return `${currency || '—'} ${amount}`
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const assetType = (row: TransactionRow) => {
  if (row.product_id) return 'Product'
  if (row.movie_id) return 'Movie'
  return 'Other'
}

const shortId = (value: string | null) => value ? value.slice(0, 8) : '—'

onAction('transactions-export', () => {
  downloadJson('transactions-summary.json', {
    exportedAt: new Date().toISOString(),
    metrics: { ...metrics },
    recentTransactions: recentTransactions.value
  })
})

onMounted(() => {
  loadTransactions()
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="errorMessage" class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-[#111214] dark:text-slate-400">
      Loading transaction data...
    </div>

    <template v-else>
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard v-for="item in stats" :key="item.label" :label="item.label" :value="item.value" :note="item.note" accent />
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <AdminPanelCard title="Status breakdown" accent>
          <div class="space-y-2">
            <div v-for="item in breakdown" :key="item.label" class="flex items-center justify-between rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
              <span class="text-sm text-slate-600 dark:text-slate-300">{{ item.label }}</span>
              <span class="font-semibold">{{ item.value }}</span>
            </div>
          </div>
        </AdminPanelCard>

        <AdminPanelCard title="Transaction fields" accent>
          <div class="space-y-2">
            <div v-for="item in fields" :key="item" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-700 dark:bg-brand/10 dark:text-slate-300">
              {{ item }}
            </div>
          </div>
        </AdminPanelCard>
      </section>

      <AdminPanelCard title="Recent transactions" :badge="`${recentTransactions.length} rows`" accent>
        <div v-if="recentTransactions.length === 0" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
          No transaction rows available.
        </div>

        <div v-else class="space-y-2">
          <div v-for="row in recentTransactions" :key="row.id" class="rounded-2xl bg-brand/10 px-4 py-4 dark:bg-brand/10">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-white">#{{ row.id }} • {{ assetType(row) }}</p>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Status: {{ row.status || '—' }} • Creator: {{ shortId(row.creator_id) }} • Guest: {{ shortId(row.guest_id) }}
                </p>
              </div>
              <div class="text-sm lg:text-right">
                <p class="font-semibold text-slate-900 dark:text-white">{{ formatAmount(row.amount, row.currency) }}</p>
                <p class="mt-1 text-slate-500 dark:text-slate-400">{{ formatDate(row.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </AdminPanelCard>

      <AdminPanelCard title="Notes" accent>
        <div class="space-y-2">
          <div v-for="item in notes" :key="item" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-700 dark:bg-brand/10 dark:text-slate-300">
            {{ item }}
          </div>
        </div>
      </AdminPanelCard>
    </template>
  </div>
</template>
