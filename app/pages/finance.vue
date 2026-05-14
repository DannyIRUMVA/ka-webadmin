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

interface FinanceSummaryResponse {
  mode: 'verified-admin' | 'session-scoped'
  metrics: {
    transactions: number
    ledgerEntries: number
    payoutRequests: number
    payouts: number
    platformRevenueRows: number
    successfulTransactions: number
    totalAmount: number
    successfulAmount: number
    stripeTransactionCount: number
    paypackTransactionCount: number
    totalUsdAmount: number
    totalRwfAmount: number
    stripeUsdAmount: number
    ledgerAmount: number
    platformFeeAmount: number
    netLedgerAfterPlatformFees: number
  }
  ledgerRows: LedgerEntryRow[]
}

const USD_TO_RWF = 1450

const { $supabase } = useNuxtApp()
const { onAction, downloadJson } = useAdminPageActions()

const loading = ref(true)
const errorMessage = ref<string | null>(null)
const financeMode = ref<'verified-admin' | 'session-scoped'>('session-scoped')
const ledgerRows = ref<LedgerEntryRow[]>([])
const ledgerSearch = ref('')
const ledgerEntryTypeFilter = ref('all')
const ledgerCurrencyFilter = ref('all')
const ledgerSort = ref<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc')
const ledgerPage = ref(1)
const ledgerPageInput = ref(1)
const LEDGER_PAGE_SIZE = 25

const metrics = reactive({
  transactions: 0,
  ledgerEntries: 0,
  payoutRequests: 0,
  payouts: 0,
  platformRevenueRows: 0,
  successfulTransactions: 0,
  totalAmount: 0,
  successfulAmount: 0,
  stripeTransactionCount: 0,
  paypackTransactionCount: 0,
  totalUsdAmount: 0,
  totalRwfAmount: 0,
  stripeUsdAmount: 0,
  ledgerAmount: 0,
  platformFeeAmount: 0,
  netLedgerAfterPlatformFees: 0
})

const convertUsdToRwf = (amount: number | string) => {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount)
  if (!Number.isFinite(numericAmount)) return 0
  return numericAmount * USD_TO_RWF
}

const formatPlainAmount = (amount: number | string) => {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount)
  if (Number.isFinite(numericAmount)) return numericAmount.toLocaleString()
  return String(amount)
}

const formatRwf = (amount: number | string) => {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount)
  if (Number.isFinite(numericAmount)) return `RWF ${numericAmount.toLocaleString()}`
  return `RWF ${String(amount)}`
}

const stripeUsdInRwf = computed(() => convertUsdToRwf(metrics.stripeUsdAmount))

const loadFinance = async () => {
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

    const data = await $fetch<FinanceSummaryResponse>('/api/finance-summary', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    financeMode.value = data.mode
    Object.assign(metrics, data.metrics)
    ledgerRows.value = data.ledgerRows
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load finance data.'
  } finally {
    loading.value = false
  }
}

const stats = computed(() => [
  { label: 'Transactions', value: String(metrics.transactions), note: 'Total rows in public.transactions' },
  { label: 'Ledger entries', value: String(metrics.ledgerEntries), note: 'Total rows in public.ledger_entries' },
  { label: 'Payout requests', value: String(metrics.payoutRequests), note: 'Current payout request rows' },
  { label: 'Payouts', value: String(metrics.payouts), note: 'Processed payout rows' }
])

const financeHighlights = computed(() => [
  { label: 'Successful transactions', value: String(metrics.successfulTransactions) },
  { label: 'Stripe transactions', value: String(metrics.stripeTransactionCount) },
  { label: 'Paypack transactions', value: String(metrics.paypackTransactionCount) },
  { label: 'Platform fee', value: formatPlainAmount(metrics.platformFeeAmount) }
])

const ledgerSummary = computed(() => [
  { label: 'Ledger sum', value: formatPlainAmount(metrics.ledgerAmount) },
  { label: 'Platform fee total', value: formatPlainAmount(metrics.platformFeeAmount) },
  { label: 'Net after fees', value: formatPlainAmount(metrics.netLedgerAfterPlatformFees) },
  { label: 'Ledger rows loaded', value: String(ledgerRows.value.length) }
])

const ledgerEntryTypeOptions = computed(() => [
  'all',
  ...Array.from(new Set(ledgerRows.value.map(row => row.entry_type).filter(Boolean))).sort()
])

const ledgerCurrencyOptions = computed(() => [
  'all',
  ...Array.from(new Set(ledgerRows.value.map(row => row.currency || '—'))).sort()
])

const ledgerCurrencySummary = computed(() => {
  const totals = new Map<string, number>()

  for (const row of ledgerRows.value) {
    const currency = row.currency || '—'
    const amount = Number(row.amount)
    if (!Number.isFinite(amount)) continue
    totals.set(currency, (totals.get(currency) ?? 0) + amount)
  }

  return Array.from(totals.entries()).map(([currency, amount]) => ({
    currency,
    amount
  }))
})

const filteredLedgerRows = computed(() => {
  const query = ledgerSearch.value.trim().toLowerCase()

  return ledgerRows.value.filter((row) => {
    const matchesEntryType = ledgerEntryTypeFilter.value === 'all' || row.entry_type === ledgerEntryTypeFilter.value
    const matchesCurrency = ledgerCurrencyFilter.value === 'all' || (row.currency || '—') === ledgerCurrencyFilter.value
    const matchesQuery = !query || [
      row.entry_type,
      row.description || '',
      row.currency || '',
      row.id,
      row.created_at || ''
    ].join(' ').toLowerCase().includes(query)

    return matchesEntryType && matchesCurrency && matchesQuery
  })
})

const sortedLedgerRows = computed(() => {
  return [...filteredLedgerRows.value].sort((a, b) => {
    if (ledgerSort.value === 'date-desc') {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    }

    if (ledgerSort.value === 'date-asc') {
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    }

    const amountA = Number(a.amount)
    const amountB = Number(b.amount)
    const safeA = Number.isFinite(amountA) ? amountA : 0
    const safeB = Number.isFinite(amountB) ? amountB : 0

    return ledgerSort.value === 'amount-desc' ? safeB - safeA : safeA - safeB
  })
})

const ledgerTotalPages = computed(() => Math.max(1, Math.ceil(sortedLedgerRows.value.length / LEDGER_PAGE_SIZE)))

const pagedLedgerRows = computed(() => {
  const start = (ledgerPage.value - 1) * LEDGER_PAGE_SIZE
  return sortedLedgerRows.value.slice(start, start + LEDGER_PAGE_SIZE)
})

const notes = computed(() => {
  const baseNotes = [
    `Conversion rate in use for Stripe USD reference only: 1 USD = ${USD_TO_RWF.toLocaleString()} RWF.`,
    `Current USD total: USD ${formatPlainAmount(metrics.totalUsdAmount)}.`,
    `Current RWF total: RWF ${formatPlainAmount(metrics.totalRwfAmount)}.`,
    `Stripe USD reference in RWF: ${formatRwf(stripeUsdInRwf.value)}.`,
    `Current ledger amount total: ${formatPlainAmount(metrics.ledgerAmount)}.`,
    `Current platform fee total: ${formatPlainAmount(metrics.platformFeeAmount)} from ${metrics.platformRevenueRows} platform revenue rows.`,
    `Net after subtracting platform fees from ledger total: ${formatPlainAmount(metrics.netLedgerAfterPlatformFees)}.`,
    'Payout review remains in the dedicated Payouts page and this page stays read-only.'
  ]

  if (financeMode.value === 'verified-admin') {
    return [
      'Finance totals are loaded from a server-side verified admin endpoint.',
      'Transaction totals are now shown separately by currency: USD and RWF.',
      ...baseNotes
    ]
  }

  return [
    'Finance is running in session-scoped mode because a server-only service key is missing in runtime.',
    'Totals may be limited by RLS in local development until SERVICEKEY or another service-role alias is configured.',
    ...baseNotes
  ]
})

const formatAmount = (amount: number | string, currency: string | null) => {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount)
  if (Number.isFinite(numericAmount)) return `${currency || '—'} ${numericAmount.toLocaleString()}`
  return `${currency || '—'} ${String(amount)}`
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const previousLedgerPage = () => {
  ledgerPage.value = Math.max(1, ledgerPage.value - 1)
}

const nextLedgerPage = () => {
  ledgerPage.value = Math.min(ledgerTotalPages.value, ledgerPage.value + 1)
}

const jumpToLedgerPage = () => {
  const nextPage = Math.min(ledgerTotalPages.value, Math.max(1, Number(ledgerPageInput.value) || 1))
  ledgerPage.value = nextPage
  ledgerPageInput.value = nextPage
}

watch([ledgerSearch, ledgerEntryTypeFilter, ledgerCurrencyFilter, ledgerSort], () => {
  ledgerPage.value = 1
  ledgerPageInput.value = 1
})

watch(ledgerTotalPages, (value) => {
  if (ledgerPage.value > value) {
    ledgerPage.value = value
  }
  if (ledgerPageInput.value > value) {
    ledgerPageInput.value = value
  }
})

watch(ledgerPage, (value) => {
  ledgerPageInput.value = value
})

onAction('finance-export', () => {
  downloadJson('finance-summary.json', {
    exportedAt: new Date().toISOString(),
    conversionRate: {
      usdToRwf: USD_TO_RWF
    },
    metrics: { ...metrics },
    filters: {
      search: ledgerSearch.value,
      entryType: ledgerEntryTypeFilter.value,
      currency: ledgerCurrencyFilter.value,
      sort: ledgerSort.value
    },
    ledgerRows: sortedLedgerRows.value
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

    <div
      v-else-if="financeMode === 'session-scoped'"
      class="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
    >
      Finance is using session-scoped reads in local development. Add <span class="font-medium">SERVICEKEY</span>, <span class="font-medium">SUPABASE_SERVICE_KEY</span>, or <span class="font-medium">SUPABASE_SERVICE_ROLE_KEY</span> to server env for full verified admin totals.
    </div>

    <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-[#111214] dark:text-slate-400">
      Loading finance data...
    </div>

    <template v-else>
      <AdminPanelCard
        title="Finance overview"
        subtitle="Transaction totals are split into separate USD and RWF amounts for clearer provider-based reporting."
        :badge="financeMode === 'verified-admin' ? 'Verified totals' : 'Session totals'"
        accent
      >
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Transaction totals by currency</p>
            <div class="mt-3 space-y-3">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-slate-400">RWF total</p>
                <p class="text-4xl font-semibold tracking-tight text-brand">RWF {{ formatPlainAmount(metrics.totalRwfAmount) }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-slate-400">USD total</p>
                <p class="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">USD {{ formatPlainAmount(metrics.totalUsdAmount) }}</p>
              </div>
            </div>
            <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Paypack is expected in <span class="font-medium text-slate-700 dark:text-slate-200">RWF</span> and Stripe is expected in <span class="font-medium text-slate-700 dark:text-slate-200">USD</span>.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="item in financeHighlights" :key="item.label" class="rounded-2xl bg-brand/10 px-4 py-4 dark:bg-brand/10">
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.label }}</p>
              <p class="mt-2 text-2xl font-semibold">{{ item.value }}</p>
            </div>
          </div>
        </div>
      </AdminPanelCard>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard v-for="item in stats" :key="item.label" :label="item.label" :value="item.value" :note="item.note" accent />
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <AdminPanelCard title="Ledger totals" accent>
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="item in ledgerSummary" :key="item.label" class="rounded-2xl bg-brand/10 px-4 py-4 dark:bg-brand/10">
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.label }}</p>
              <p class="mt-2 text-2xl font-semibold">{{ item.value }}</p>
            </div>
          </div>
        </AdminPanelCard>

        <AdminPanelCard title="Ledger totals by currency" accent>
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="item in ledgerCurrencySummary" :key="item.currency" class="rounded-2xl bg-brand/10 px-4 py-4 dark:bg-brand/10">
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.currency }}</p>
              <p class="mt-2 text-2xl font-semibold">{{ formatAmount(item.amount, item.currency) }}</p>
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

      <AdminPanelCard title="All ledger entries" :badge="`${filteredLedgerRows.length} filtered / ${ledgerRows.length} total`" accent>
        <div class="grid gap-3 border-b border-slate-200 pb-4 dark:border-white/10 sm:grid-cols-4">
          <label class="space-y-2">
            <span class="text-sm text-slate-500 dark:text-slate-400">Search</span>
            <input
              v-model="ledgerSearch"
              type="text"
              placeholder="Search type, description, currency..."
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand dark:border-white/10 dark:bg-[#111214]"
            >
          </label>

          <label class="space-y-2">
            <span class="text-sm text-slate-500 dark:text-slate-400">Entry type</span>
            <select
              v-model="ledgerEntryTypeFilter"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand dark:border-white/10 dark:bg-[#111214]"
            >
              <option v-for="option in ledgerEntryTypeOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </label>

          <label class="space-y-2">
            <span class="text-sm text-slate-500 dark:text-slate-400">Currency</span>
            <select
              v-model="ledgerCurrencyFilter"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand dark:border-white/10 dark:bg-[#111214]"
            >
              <option v-for="option in ledgerCurrencyOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </label>

          <label class="space-y-2">
            <span class="text-sm text-slate-500 dark:text-slate-400">Sort</span>
            <select
              v-model="ledgerSort"
              class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand dark:border-white/10 dark:bg-[#111214]"
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
            </select>
          </label>
        </div>

        <div v-if="filteredLedgerRows.length === 0" class="mt-4 rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
          No ledger rows match the current filters.
        </div>

        <div v-else class="mt-4 space-y-4">
          <div class="max-h-[720px] space-y-2 overflow-y-auto pr-1">
            <div v-for="row in pagedLedgerRows" :key="row.id" class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
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

          <div class="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Page {{ ledgerPage }} of {{ ledgerTotalPages }}
            </p>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div class="flex items-center gap-2">
                <input
                  v-model.number="ledgerPageInput"
                  type="number"
                  min="1"
                  :max="ledgerTotalPages"
                  class="w-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand dark:border-white/10 dark:bg-[#111214]"
                >
                <button type="button" class="control-button" @click="jumpToLedgerPage">
                  Go to page
                </button>
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="control-button"
                  :disabled="ledgerPage <= 1"
                  @click="previousLedgerPage"
                >
                  Previous
                </button>
                <button
                  type="button"
                  class="control-button"
                  :disabled="ledgerPage >= ledgerTotalPages"
                  @click="nextLedgerPage"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminPanelCard>
    </template>
  </div>
</template>
