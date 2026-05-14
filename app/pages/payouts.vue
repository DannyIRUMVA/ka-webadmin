<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

interface PayoutRequestRow {
  id: string
  created_at: string | null
  creator_id: string
  requested_amount: number | string
  payout_method: string
  payout_details: Record<string, unknown> | null
  status: string
  failure_reason: string | null
  creator_email?: string | null
  creator_profile?: {
    id: string
    name: string | null
    full_name: string | null
    phone_number: string | null
  } | null
}

interface TransactionContextRow {
  id: number
  amount: number | string
  currency: string | null
  status: string | null
  created_at: string | null
}

interface LedgerContextRow {
  id: string
  entry_type: string
  amount: number | string
  currency: string | null
  created_at: string | null
  description: string | null
}

const { $supabase } = useNuxtApp()
const { onAction, downloadJson } = useAdminPageActions()

const loading = ref(true)
const errorMessage = ref<string | null>(null)
const creatorContextLoading = ref(false)
const creatorContextError = ref<string | null>(null)
const emailLookupAvailable = ref(false)
const payoutRequestsList = ref<PayoutRequestRow[]>([])
const selectedRequestId = ref<string | null>(null)
const selectedStatusFilter = ref<'all' | 'pending' | 'approved' | 'rejected'>('all')
const selectedMethodFilter = ref<'all' | 'MTN' | 'Airtel' | 'Bank' | 'Other'>('all')
const searchTerm = ref('')
const creatorTransactions = ref<TransactionContextRow[]>([])
const creatorLedgerEntries = ref<LedgerContextRow[]>([])

const metrics = reactive({
  payoutRequests: 0,
  payouts: 0
})

const getCount = async (builder: Promise<{ count: number | null, error: { message: string } | null }>) => {
  const { count, error } = await builder
  if (error) throw new Error(error.message)
  return count ?? 0
}

const enrichCreatorEmails = async (requests: PayoutRequestRow[]) => {
  if (!import.meta.client || requests.length === 0) {
    return requests
  }

  const creatorIds = Array.from(new Set(requests.map(request => request.creator_id).filter(Boolean)))

  const response = await $fetch<{ available: boolean, emailsByCreatorId: Record<string, string | null> }>('/api/payout-creator-emails', {
    method: 'POST',
    body: { creatorIds }
  })

  emailLookupAvailable.value = response.available

  return requests.map(request => ({
    ...request,
    creator_email: response.emailsByCreatorId[request.creator_id] ?? null
  }))
}

const loadCreatorContext = async (creatorId: string | null) => {
  if (!import.meta.client || !creatorId) {
    creatorTransactions.value = []
    creatorLedgerEntries.value = []
    creatorContextError.value = null
    return
  }

  creatorContextLoading.value = true
  creatorContextError.value = null

  try {
    const [transactionsResult, ledgerResult] = await Promise.all([
      $supabase
        .from('transactions')
        .select('id, amount, currency, status, created_at')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })
        .limit(5),
      $supabase
        .from('ledger_entries')
        .select('id, entry_type, amount, currency, created_at, description')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    if (transactionsResult.error) throw new Error(transactionsResult.error.message)
    if (ledgerResult.error) throw new Error(ledgerResult.error.message)

    creatorTransactions.value = (transactionsResult.data ?? []) as TransactionContextRow[]
    creatorLedgerEntries.value = (ledgerResult.data ?? []) as LedgerContextRow[]
  } catch (error) {
    creatorTransactions.value = []
    creatorLedgerEntries.value = []
    creatorContextError.value = error instanceof Error ? error.message : 'Unable to load creator payout context.'
  } finally {
    creatorContextLoading.value = false
  }
}

const loadPayouts = async () => {
  if (!import.meta.client) return

  loading.value = true
  errorMessage.value = null

  try {
    const [payoutRequests, payouts, payoutRequestsResult] = await Promise.all([
      getCount($supabase.from('payout_requests').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('payouts').select('*', { count: 'exact', head: true })),
      $supabase
        .from('payout_requests')
        .select('id, created_at, creator_id, requested_amount, payout_method, payout_details, status, failure_reason, creator_profile:profiles!payout_requests_creator_id_fkey(id, name, full_name, phone_number)')
        .order('created_at', { ascending: false })
        .limit(20)
    ])

    if (payoutRequestsResult.error) throw new Error(payoutRequestsResult.error.message)

    metrics.payoutRequests = payoutRequests
    metrics.payouts = payouts
    payoutRequestsList.value = await enrichCreatorEmails((payoutRequestsResult.data ?? []) as PayoutRequestRow[])

    const initialSelection = payoutRequestsList.value.find(item => item.id === selectedRequestId.value)?.id
      ?? payoutRequestsList.value[0]?.id
      ?? null

    selectedRequestId.value = initialSelection
    await loadCreatorContext(payoutRequestsList.value.find(item => item.id === initialSelection)?.creator_id ?? null)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load payout data.'
  } finally {
    loading.value = false
  }
}

const tabItems = computed(() => {
  const statuses: Array<'all' | 'pending' | 'approved' | 'rejected'> = ['all', 'pending', 'approved', 'rejected']
  return statuses.map((status) => ({
    value: status,
    label: status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1),
    count: status === 'all' ? payoutRequestsList.value.length : payoutRequestsList.value.filter(item => item.status === status).length
  }))
})

const filteredRequests = computed(() => {
  const search = searchTerm.value.trim().toLowerCase()

  return payoutRequestsList.value.filter((request) => {
    const statusOk = selectedStatusFilter.value === 'all' || request.status === selectedStatusFilter.value
    const methodOk = selectedMethodFilter.value === 'all'
      || (selectedMethodFilter.value === 'Other'
        ? !['MTN', 'Airtel', 'Bank'].includes(request.payout_method)
        : request.payout_method === selectedMethodFilter.value)

    const profileLabel = `${request.creator_profile?.full_name || ''} ${request.creator_profile?.name || ''} ${request.creator_profile?.phone_number || ''} ${request.creator_email || ''}`.toLowerCase()
    const requestText = `${request.id} ${request.payout_method} ${request.status} ${request.requested_amount}`.toLowerCase()
    const searchOk = !search || profileLabel.includes(search) || requestText.includes(search)

    return statusOk && methodOk && searchOk
  })
})

const selectedRequest = computed(() => {
  const selectedInFiltered = filteredRequests.value.find(item => item.id === selectedRequestId.value)
  return selectedInFiltered ?? filteredRequests.value[0] ?? null
})

const payoutCreatorLabel = computed(() => {
  const profile = selectedRequest.value?.creator_profile
  return profile?.full_name || profile?.name || 'Creator profile'
})

const payoutPhone = computed(() => selectedRequest.value?.creator_profile?.phone_number || 'No phone on profile')
const payoutEmail = computed(() => selectedRequest.value?.creator_email || 'Email unavailable')

const stats = computed(() => [
  { label: 'Payout requests', value: String(metrics.payoutRequests), note: 'Current queue size' },
  { label: 'Processed payouts', value: String(metrics.payouts), note: 'Rows already moved to payouts' },
  { label: 'Filtered results', value: String(filteredRequests.value.length), note: 'Current list after filters' }
])

const creatorContextSummary = computed(() => {
  const transactionTotal = creatorTransactions.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const ledgerTotal = creatorLedgerEntries.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  return [
    { label: 'Recent transactions', value: String(creatorTransactions.value.length) },
    { label: 'Transaction total', value: `RWF ${transactionTotal.toLocaleString()}` },
    { label: 'Recent ledger rows', value: String(creatorLedgerEntries.value.length) },
    { label: 'Ledger total', value: `RWF ${ledgerTotal.toLocaleString()}` }
  ]
})

const formatRequestedAmount = (amount: number | string) => {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount)
  if (Number.isFinite(numericAmount)) return `RWF ${numericAmount.toLocaleString()}`
  return `RWF ${amount}`
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const prettyJson = (value: Record<string, unknown> | null) => {
  if (!value) return 'No payout details attached.'
  return JSON.stringify(value, null, 2)
}

const shortId = (value: string | null) => value ? value.slice(0, 8) : '—'

const selectRequest = async (requestId: string) => {
  if (selectedRequestId.value === requestId) {
    return
  }

  selectedRequestId.value = requestId
  await loadCreatorContext(payoutRequestsList.value.find(item => item.id === requestId)?.creator_id ?? null)
}

watch(filteredRequests, async (items) => {
  if (!items.length) {
    selectedRequestId.value = null
    creatorTransactions.value = []
    creatorLedgerEntries.value = []
    return
  }

  if (!items.some(item => item.id === selectedRequestId.value)) {
    selectedRequestId.value = items[0].id
    await loadCreatorContext(items[0].creator_id)
  }
})

onAction('payouts-export', () => {
  downloadJson('payout-queue.json', {
    exportedAt: new Date().toISOString(),
    metrics: { ...metrics },
    filters: {
      status: selectedStatusFilter.value,
      method: selectedMethodFilter.value,
      search: searchTerm.value
    },
    payoutRequests: filteredRequests.value,
    selectedRequest: selectedRequest.value,
    creatorTransactions: creatorTransactions.value,
    creatorLedgerEntries: creatorLedgerEntries.value
  })
})

onMounted(() => {
  loadPayouts()
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="errorMessage" class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-[#111214] dark:text-slate-400">
      Loading payout queue...
    </div>

    <template v-else>
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard v-for="item in stats" :key="item.label" :label="item.label" :value="item.value" :note="item.note" accent />
      </section>

      <AdminPanelCard title="Status tabs" subtitle="Quickly switch between payout states before applying more detailed filters." :badge="`${filteredRequests.length} visible`" accent>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tab in tabItems"
            :key="tab.value"
            type="button"
            class="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition"
            :class="selectedStatusFilter === tab.value
              ? 'bg-brand text-black'
              : 'bg-brand/10 text-slate-700 hover:bg-brand/15 dark:bg-brand/10 dark:text-slate-200 dark:hover:bg-brand/15'"
            @click="selectedStatusFilter = tab.value"
          >
            <span>{{ tab.label }}</span>
            <span class="rounded-full bg-black/10 px-2 py-0.5 text-xs" :class="selectedStatusFilter === tab.value ? 'text-black' : 'text-slate-500 dark:text-slate-300'">{{ tab.count }}</span>
          </button>
        </div>
      </AdminPanelCard>

      <AdminPanelCard title="Queue filters" subtitle="Filter the payout queue by status, method, or matching text." badge="Read-only" accent>
        <div class="grid gap-3 md:grid-cols-3">
          <label class="space-y-2 text-sm">
            <span class="text-slate-500 dark:text-slate-400">Status</span>
            <select v-model="selectedStatusFilter" class="w-full rounded-2xl border border-brand/20 bg-brand/10 px-4 py-3 text-sm outline-none dark:bg-brand/10">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <label class="space-y-2 text-sm">
            <span class="text-slate-500 dark:text-slate-400">Method</span>
            <select v-model="selectedMethodFilter" class="w-full rounded-2xl border border-brand/20 bg-brand/10 px-4 py-3 text-sm outline-none dark:bg-brand/10">
              <option value="all">All methods</option>
              <option value="MTN">MTN</option>
              <option value="Airtel">Airtel</option>
              <option value="Bank">Bank</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label class="space-y-2 text-sm">
            <span class="text-slate-500 dark:text-slate-400">Search</span>
            <input v-model="searchTerm" type="text" placeholder="Request id, creator, email, phone..." class="w-full rounded-2xl border border-brand/20 bg-brand/10 px-4 py-3 text-sm outline-none placeholder:text-slate-400 dark:bg-brand/10" />
          </label>
        </div>
      </AdminPanelCard>

      <section class="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <AdminPanelCard title="Payout queue" :badge="`${filteredRequests.length} shown`" accent>
          <div v-if="filteredRequests.length === 0" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
            No payout requests match the current filters.
          </div>

          <div v-else class="space-y-2">
            <button
              v-for="request in filteredRequests"
              :key="request.id"
              type="button"
              class="w-full rounded-2xl border px-4 py-3 text-left transition"
              :class="selectedRequestId === request.id
                ? 'border-brand bg-brand/15 dark:border-brand dark:bg-brand/15'
                : 'border-transparent bg-brand/10 hover:border-brand/20 dark:bg-brand/10 dark:hover:border-brand/20'"
              @click="selectRequest(request.id)"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium text-slate-900 dark:text-white">{{ formatRequestedAmount(request.requested_amount) }}</p>
                <span class="rounded-full bg-white px-2 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-brand dark:bg-[#111214]">{{ request.status }}</span>
              </div>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ request.payout_method }} • {{ formatDate(request.created_at) }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ request.creator_profile?.full_name || request.creator_profile?.name || shortId(request.creator_id) }}</p>
              <p v-if="request.creator_email" class="mt-1 text-xs text-slate-400">{{ request.creator_email }}</p>
            </button>
          </div>
        </AdminPanelCard>

        <div class="space-y-4">
          <AdminPanelCard title="Payout review" subtitle="Dedicated payout-only review layout for admins. This page is read-only and does not approve or reject requests yet." :badge="selectedRequest ? 'Reviewing request' : 'Queue empty'" accent>
            <div v-if="selectedRequest" class="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <div class="space-y-4">
                <div class="rounded-3xl border border-brand/20 bg-brand/10 p-5 dark:border-brand/20 dark:bg-brand/10">
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p class="text-sm text-slate-500 dark:text-slate-400">Selected payout request</p>
                      <p class="mt-2 text-3xl font-semibold text-brand">{{ formatRequestedAmount(selectedRequest.requested_amount) }}</p>
                      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Requested on {{ formatDate(selectedRequest.created_at) }}</p>
                    </div>
                    <div class="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand dark:bg-[#111214]">
                      {{ selectedRequest.status }}
                    </div>
                  </div>
                </div>

                <div class="rounded-3xl border border-brand/20 bg-white p-5 dark:border-brand/20 dark:bg-[#111214]">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm text-slate-500 dark:text-slate-400">Creator</p>
                      <p class="mt-1 text-lg font-semibold">{{ payoutCreatorLabel }}</p>
                    </div>
                    <div class="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                      {{ shortId(selectedRequest.creator_id) }}
                    </div>
                  </div>
                  <div class="mt-4 grid gap-3 sm:grid-cols-2">
                    <div class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
                      <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Method</p>
                      <p class="mt-1 text-sm font-medium">{{ selectedRequest.payout_method }}</p>
                    </div>
                    <div class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
                      <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Phone</p>
                      <p class="mt-1 text-sm font-medium">{{ payoutPhone }}</p>
                    </div>
                    <div class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10 sm:col-span-2">
                      <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
                      <p class="mt-1 text-sm font-medium">{{ payoutEmail }}</p>
                      <p v-if="!emailLookupAvailable" class="mt-1 text-xs text-slate-400">Configure SUPABASE_SERVICE_ROLE_KEY on the server to enrich creator emails automatically.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="rounded-3xl border border-brand/20 bg-white p-5 dark:border-brand/20 dark:bg-[#111214]">
                  <p class="text-sm font-semibold">Admin verification checklist</p>
                  <div class="mt-4 space-y-2">
                    <div class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-700 dark:bg-brand/10 dark:text-slate-300">Confirm creator identity and payout ownership.</div>
                    <div class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-700 dark:bg-brand/10 dark:text-slate-300">Validate request amount against creator balance and ledger history.</div>
                    <div class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-700 dark:bg-brand/10 dark:text-slate-300">Verify payout method and payout destination details before approval.</div>
                  </div>
                </div>

                <div class="rounded-3xl border border-brand/20 bg-white p-5 dark:border-brand/20 dark:bg-[#111214]">
                  <p class="text-sm font-semibold">Approval actions</p>
                  <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Buttons are intentionally disabled until a safe server-side approval flow is implemented.</p>
                  <div class="mt-4 grid gap-2 sm:grid-cols-2">
                    <button type="button" disabled class="rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-black opacity-50">Approve payout</button>
                    <button type="button" disabled class="rounded-2xl border border-brand/30 px-4 py-3 text-sm font-semibold text-brand opacity-50">Reject request</button>
                  </div>
                </div>

                <div class="rounded-3xl border border-brand/20 bg-white p-5 dark:border-brand/20 dark:bg-[#111214]">
                  <p class="text-sm font-semibold">Payout details payload</p>
                  <pre class="mt-3 overflow-x-auto rounded-2xl bg-brand/10 p-4 text-xs text-slate-700 dark:bg-brand/10 dark:text-slate-300">{{ prettyJson(selectedRequest.payout_details) }}</pre>
                  <p v-if="selectedRequest.failure_reason" class="mt-3 text-sm text-rose-600 dark:text-rose-400">Failure reason: {{ selectedRequest.failure_reason }}</p>
                </div>
              </div>
            </div>

            <div v-else class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
              No payout requests available.
            </div>
          </AdminPanelCard>

          <AdminPanelCard title="Creator payout context" subtitle="Recent creator transactions and ledger movement to help admins verify the payout request before approval." :badge="selectedRequest ? 'Read-only context' : 'No creator selected'" accent>
            <div v-if="selectedRequest" class="space-y-4">
              <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div v-for="item in creatorContextSummary" :key="item.label" class="rounded-2xl bg-brand/10 px-4 py-4 dark:bg-brand/10">
                  <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.label }}</p>
                  <p class="mt-2 text-xl font-semibold">{{ item.value }}</p>
                </div>
              </div>

              <div v-if="creatorContextLoading" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
                Loading creator context...
              </div>

              <div v-else-if="creatorContextError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                {{ creatorContextError }}
              </div>

              <div v-else class="grid gap-4 lg:grid-cols-2">
                <div>
                  <p class="mb-2 text-sm font-semibold">Recent transactions</p>
                  <div v-if="creatorTransactions.length === 0" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
                    No recent creator transactions.
                  </div>
                  <div v-else class="space-y-2">
                    <div v-for="row in creatorTransactions" :key="row.id" class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
                      <div class="flex items-center justify-between gap-3">
                        <p class="text-sm font-medium text-slate-900 dark:text-white">#{{ row.id }}</p>
                        <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatRequestedAmount(row.amount) }}</p>
                      </div>
                      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ row.status || '—' }} • {{ formatDate(row.created_at) }}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p class="mb-2 text-sm font-semibold">Recent ledger entries</p>
                  <div v-if="creatorLedgerEntries.length === 0" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
                    No recent creator ledger entries.
                  </div>
                  <div v-else class="space-y-2">
                    <div v-for="row in creatorLedgerEntries" :key="row.id" class="rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
                      <div class="flex items-center justify-between gap-3">
                        <p class="text-sm font-medium text-slate-900 dark:text-white">{{ row.entry_type }}</p>
                        <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatRequestedAmount(row.amount) }}</p>
                      </div>
                      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ row.description || 'No description' }} • {{ formatDate(row.created_at) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-500 dark:bg-brand/10 dark:text-slate-400">
              No payout request selected.
            </div>
          </AdminPanelCard>
        </div>
      </section>
    </template>
  </div>
</template>
