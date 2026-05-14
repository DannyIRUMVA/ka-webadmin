<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const { $supabase } = useNuxtApp()
const { onAction, downloadJson } = useAdminPageActions()

const loading = ref(true)
const errorMessage = ref<string | null>(null)

const metrics = reactive({
  profilesTotal: 0,
  creatorsTotal: 0,
  transactionsTotal: 0,
  guestsTotal: 0,
  verifiedAdmins: 0,
  kycPending: 0,
  kycUnverified: 0,
  kycVerified: 0,
  subscriptionsActive: 0,
  subscriptionsFreemium: 0,
  subscriptionsPro: 0,
  productsTotal: 0,
  moviesTotal: 0,
  moviesPublished: 0,
  articlesPublished: 0,
  guidesPublished: 0,
  ledgerEntriesTotal: 0,
  transactionsSuccessful: 0,
  payoutRequestsTotal: 0
})

const getCount = async (builder: Promise<{ count: number | null, error: { message: string } | null }>) => {
  const { count, error } = await builder
  if (error) throw new Error(error.message)
  return count ?? 0
}

const loadDashboard = async () => {
  if (!import.meta.client) return

  loading.value = true
  errorMessage.value = null

  try {
    const [
      profilesTotal,
      creatorsTotal,
      transactionsTotal,
      guestsTotal,
      verifiedAdmins,
      kycPending,
      kycUnverified,
      kycVerified,
      subscriptionsActive,
      subscriptionsFreemium,
      subscriptionsPro,
      productsTotal,
      moviesTotal,
      moviesPublished,
      articlesPublished,
      guidesPublished,
      ledgerEntriesTotal,
      transactionsSuccessful,
      payoutRequestsTotal
    ] = await Promise.all([
      getCount($supabase.from('profiles').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'creator')),
      getCount($supabase.from('transactions').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('guests').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verified_by_admin', true)),
      getCount($supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending')),
      getCount($supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'unverified')),
      getCount($supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'verified')),
      getCount($supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')),
      getCount($supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan_name', 'Freemium')),
      getCount($supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('plan_name', 'Pro')),
      getCount($supabase.from('products').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('movies').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('movies').select('*', { count: 'exact', head: true }).eq('is_published', true)),
      getCount($supabase.from('kakofi_articles').select('*', { count: 'exact', head: true }).eq('status', 'published')),
      getCount($supabase.from('kakofi_guides').select('*', { count: 'exact', head: true }).eq('status', 'published')),
      getCount($supabase.from('ledger_entries').select('*', { count: 'exact', head: true })),
      getCount($supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'successful')),
      getCount($supabase.from('payout_requests').select('*', { count: 'exact', head: true }))
    ])

    Object.assign(metrics, {
      profilesTotal,
      creatorsTotal,
      transactionsTotal,
      guestsTotal,
      verifiedAdmins,
      kycPending,
      kycUnverified,
      kycVerified,
      subscriptionsActive,
      subscriptionsFreemium,
      subscriptionsPro,
      productsTotal,
      moviesTotal,
      moviesPublished,
      articlesPublished,
      guidesPublished,
      ledgerEntriesTotal,
      transactionsSuccessful,
      payoutRequestsTotal
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load dashboard data.'
  } finally {
    loading.value = false
  }
}

const publishedContentTotal = computed(() => metrics.moviesPublished + metrics.articlesPublished + metrics.guidesPublished)

const topStats = computed(() => [
  { label: 'Profiles', value: String(metrics.profilesTotal), note: 'Total user profiles' },
  { label: 'Creators', value: String(metrics.creatorsTotal), note: 'Creator-led platform' },
  { label: 'Transactions', value: String(metrics.transactionsTotal), note: 'Recorded purchases' },
  { label: 'Guests', value: String(metrics.guestsTotal), note: 'Guest audience records' }
])

const overview = computed(() => [
  { label: 'Verified admins', value: String(metrics.verifiedAdmins) },
  { label: 'KYC pending', value: String(metrics.kycPending) },
  { label: 'Freemium subscriptions', value: String(metrics.subscriptionsFreemium) },
  { label: 'Pro subscriptions', value: String(metrics.subscriptionsPro) },
  { label: 'Products', value: String(metrics.productsTotal) },
  { label: 'Movies', value: String(metrics.moviesTotal) },
  { label: 'Published content', value: String(publishedContentTotal.value) },
  { label: 'Ledger entries', value: String(metrics.ledgerEntriesTotal) }
])

const sections = computed(() => [
  {
    title: 'Creators and verification',
    items: [
      `${metrics.creatorsTotal} creator profiles`,
      `${metrics.kycPending} KYC pending`,
      `${metrics.kycUnverified} unverified`,
      `${metrics.kycVerified} verified`
    ]
  },
  {
    title: 'Subscriptions',
    items: [
      `${metrics.subscriptionsActive} active subscriptions`,
      `${metrics.subscriptionsFreemium} Freemium accounts`,
      `${metrics.subscriptionsPro} Pro accounts`
    ]
  },
  {
    title: 'Content library',
    items: [
      `${metrics.productsTotal} products`,
      `${metrics.moviesTotal} movies`,
      `${metrics.articlesPublished} published articles`,
      `${metrics.guidesPublished} published guides`
    ]
  },
  {
    title: 'Finance',
    items: [
      `${metrics.transactionsTotal} transactions`,
      `${metrics.transactionsSuccessful} successful`,
      `${metrics.ledgerEntriesTotal} ledger entries`,
      `${metrics.payoutRequestsTotal} payout requests`
    ]
  }
])

onAction('dashboard-export', () => {
  downloadJson('dashboard-overview.json', {
    exportedAt: new Date().toISOString(),
    metrics: { ...metrics },
    publishedContentTotal: publishedContentTotal.value
  })
})

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="errorMessage" class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-[#111214] dark:text-slate-400">
      Loading dashboard data...
    </div>

    <template v-else>
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          v-for="item in topStats"
          :key="item.label"
          :label="item.label"
          :value="item.value"
          :note="item.note"
          accent
        />
      </section>

      <AdminPanelCard title="Overview" subtitle="Simple summary of the current platform data." badge="Read-only" accent>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="item in overview"
            :key="item.label"
            class="rounded-2xl bg-brand/10 px-4 py-4 dark:bg-brand/10"
          >
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.label }}</p>
            <p class="mt-2 text-2xl font-semibold">{{ item.value }}</p>
          </div>
        </div>
      </AdminPanelCard>

      <section class="grid gap-4 lg:grid-cols-2">
        <AdminPanelCard
          v-for="section in sections"
          :key="section.title"
          :title="section.title"
          accent
        >
          <div class="space-y-2">
            <div
              v-for="item in section.items"
              :key="item"
              class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-700 dark:bg-brand/10 dark:text-slate-300"
            >
              {{ item }}
            </div>
          </div>
        </AdminPanelCard>
      </section>
    </template>
  </div>
</template>
