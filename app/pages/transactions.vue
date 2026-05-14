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

interface TransactionsSummaryResponse {
  mode: 'verified-admin' | 'session-scoped'
  metrics: {
    total: number
    successful: number
    completed: number
  }
  recentTransactions: TransactionRow[]
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

const loadTransactions = async () => {
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

    const data = await $fetch<TransactionsSummaryResponse>('/api/transactions-summary', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    Object.assign(metrics, data.metrics)
    recentTransactions.value = data.recentTransactions
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
  'Paypack transactions are expected in RWF and Stripe transactions are expected in USD.',
  'Exception review should focus on rare non-standard rows or provider/currency mismatches.'
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

const transactionProvider = (row: TransactionRow) => {
  const id = row.provider_transaction_id || ''
  if (id.startsWith('cs_')) return 'Stripe'
  if (id.startsWith('PPK_')) return 'Paypack'
  return 'Other'
}

const expectedCurrency = (row: TransactionRow) => {
  const provider = transactionProvider(row)
  if (provider === 'Stripe') return 'USD'
  if (provider === 'Paypack') return 'RWF'
  return row.currency || '—'
}

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
                  Status: {{ row.status || '—' }} • Provider: {{ transactionProvider(row) }} • Expected currency: {{ expectedCurrency(row) }}
                </p>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Creator: {{ shortId(row.creator_id) }} • Guest: {{ shortId(row.guest_id) }}
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
