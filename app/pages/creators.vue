<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const { $supabase } = useNuxtApp()
const { onAction, downloadJson } = useAdminPageActions()

const loading = ref(true)
const errorMessage = ref<string | null>(null)

const metrics = reactive({
  creatorsTotal: 0,
  clientsTotal: 0,
  verifiedAdmins: 0,
  kycPending: 0,
  kycUnverified: 0,
  kycVerified: 0
})

const getCount = async (builder: Promise<{ count: number | null, error: { message: string } | null }>) => {
  const { count, error } = await builder
  if (error) throw new Error(error.message)
  return count ?? 0
}

const loadCreatorsSummary = async () => {
  if (!import.meta.client) return

  loading.value = true
  errorMessage.value = null

  try {
    const [creatorsTotal, clientsTotal, verifiedAdmins, kycPending, kycUnverified, kycVerified] = await Promise.all([
      getCount($supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'creator')),
      getCount($supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client')),
      getCount($supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verified_by_admin', true)),
      getCount($supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending')),
      getCount($supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'unverified')),
      getCount($supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'verified'))
    ])

    Object.assign(metrics, { creatorsTotal, clientsTotal, verifiedAdmins, kycPending, kycUnverified, kycVerified })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load creator summary.'
  } finally {
    loading.value = false
  }
}

const stats = computed(() => [
  { label: 'Creator profiles', value: String(metrics.creatorsTotal), note: 'Main account type' },
  { label: 'Client profiles', value: String(metrics.clientsTotal), note: 'Small minority of profiles' },
  { label: 'Verified admins', value: String(metrics.verifiedAdmins), note: 'Limited admin access' }
])

const verification = computed(() => [
  { label: 'KYC pending', value: String(metrics.kycPending) },
  { label: 'KYC unverified', value: String(metrics.kycUnverified) },
  { label: 'KYC verified', value: String(metrics.kycVerified) }
])

const fields = [
  'verified_by_admin',
  'kyc_status',
  'badge_type',
  'stripe_customer_id'
]

onAction('creators-export', () => {
  downloadJson('creators-summary.json', {
    exportedAt: new Date().toISOString(),
    metrics: { ...metrics },
    fields
  })
})

onMounted(() => {
  loadCreatorsSummary()
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="errorMessage" class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-[#111214] dark:text-slate-400">
      Loading creator summary...
    </div>

    <template v-else>
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard v-for="item in stats" :key="item.label" :label="item.label" :value="item.value" :note="item.note" accent />
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <AdminPanelCard title="Verification" accent>
          <div class="space-y-2">
            <div v-for="item in verification" :key="item.label" class="flex items-center justify-between rounded-2xl bg-brand/10 px-4 py-3 dark:bg-brand/10">
              <span class="text-sm text-slate-600 dark:text-slate-300">{{ item.label }}</span>
              <span class="font-semibold">{{ item.value }}</span>
            </div>
          </div>
        </AdminPanelCard>

        <AdminPanelCard title="Important profile fields" accent>
          <div class="space-y-2">
            <div v-for="item in fields" :key="item" class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-700 dark:bg-brand/10 dark:text-slate-300">
              {{ item }}
            </div>
          </div>
        </AdminPanelCard>
      </section>
    </template>
  </div>
</template>
