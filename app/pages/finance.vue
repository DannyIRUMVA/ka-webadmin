<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

interface LedgerEntryRow {
  id: string
  entry_type: string
  amount: number | string
  currency: string | null
  description: string | null
  created_at: string | null
}

const { $supabase } = useNuxtApp()
const { onAction, downloadJson } = useAdminPageActions()

const loading = ref(true)
const errorMessage = ref<string | null>(null)
const recentLedgerEntries = ref<LedgerEntryRow[]>([])

const metrics = reactive({
  transactions: 0,
  ledgerEntries: 0,
  payoutRequests: 0,
  payouts: 0,
  platformRevenueRows: 0,
  successfulTransactions: 0
})

const getCount = async (builder: Promise<{ count: number | null, error: { message: string } | null }>) => {
  const { count, error } = await builder
  if (error) throw new Error(error.message)
  return count ?? 0
}

const loadFinance = async () => {
  if (!import.meta.client) return

  loading.value = true
  errorMessage.value = null

  try {
    const [transactions, ledgerEntries, payoutRequests, payouts, platformRevenueRows, successfulTransactions, ledgerResult] = await Promise.all([
      getCount($supabase.from('transactions').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('ledger_entries').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('payout_requests').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('payouts').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('platform_revenue').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'successful')),
      $supabase.from('ledger_entries').select('id, entry_type, amount, currency, description, created_at').order('created_at', { ascending: false }).limit(6)
    ])

    if (ledgerResult.error) throw new Error(ledgerResult.error.message)

    Object.assign(metrics, {
      transactions,
      ledgerEntries,
      payoutRequests,
      payouts,
      platformRevenueRows,
      successfulTransactions
    })

    recentLedgerEntries.value = (ledgerResult.data ?? []) as LedgerEntryRow[]
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load finance data.'
  } finally {
    loading.value = false
  }
}

const stats = computed(() => [
  { label: 'Transactions', value: String(metrics.transactions), note: 'Total purchase rows' },
  { label: 'Ledger entries', value: String(metrics.ledgerEntries), note: 'Main financial history' },
  { label: 'Payout requests', value: String(metrics.payoutRequests), note: 'Current payout queue' },
  { label: 'Payouts', value: String(metrics.payouts), note: 'Processed payout rows' }
])

const notes = computed(() => [
  `Successful transactions: ${metrics.successfulTransactions}`,
  `Platform revenue rows: ${metrics.platformRevenueRows}`,
  'Finance is centered on transactions and ledger entries.'
])

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

onAction('finance-export', () => {
  downloadJson('finance-summary.json', {
    exportedAt: new Date().toISOString(),
    metrics: { ...metrics },
    recentLedgerEntries: recentLedgerEntries.value
  })
})

onMounted(() => {
  loadFinance()
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="errorMessage" class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-[#111214] dark:text-slate-400">
      Loading finance data...
    </div>

    <template v-else>
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard v-for="item in stats" :key="item.label" :label="item.label" :value="item.value" :note="item.note" accent />
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <AdminPanelCard title="Recent ledger entries" accent>
          <div v-if="recentLedgerEntries.length === 0" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
            No ledger rows available.
          </div>

          <div v-else class="space-y-2">
            <div v-for="row in recentLedgerEntries" :key="row.id" class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-900 dark:text-white">{{ row.entry_type }}</p>
                  <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ row.description || 'No description' }}</p>
                </div>
                <div class="text-sm sm:text-right">
                  <p class="font-semibold text-slate-900 dark:text-white">{{ formatAmount(row.amount, row.currency) }}</p>
                  <p class="mt-1 text-slate-500 dark:text-slate-400">{{ formatDate(row.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </AdminPanelCard>

        <AdminPanelCard title="Finance notes" accent>
          <div class="space-y-2">
            <div v-for="item in notes" :key="item" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-700 dark:bg-brand/10 dark:text-slate-300">
              {{ item }}
            </div>
          </div>
        </AdminPanelCard>
      </section>
    </template>
  </div>
</template>
