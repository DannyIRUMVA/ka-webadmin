<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const vendors = [
  { name: 'Kigali Bites', category: 'Fast casual', rating: '4.8', orders: '422 today', status: 'Top performer' },
  { name: 'Biryogo Kitchen', category: 'Local cuisine', rating: '4.6', orders: '316 today', status: 'Growing' },
  { name: 'Remera Grill', category: 'Grill house', rating: '4.4', orders: '280 today', status: 'Monitor prep' },
  { name: 'Kacyiru Express', category: 'Quick meals', rating: '4.7', orders: '245 today', status: 'Stable' }
]

const onboarding = [
  { stage: 'Documents submitted', count: '09' },
  { stage: 'Kitchen inspection', count: '04' },
  { stage: 'Menu setup', count: '06' },
  { stage: 'Ready to launch', count: '03' }
]
</script>

<template>
  <div>
    <section class="mt-8 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <div class="rounded-[2rem] border border-brand/20 bg-gradient-to-br from-brand/20 via-brand/10 to-transparent p-6 dark:from-brand/15 dark:via-brand/8">
        <p class="text-xs uppercase tracking-[0.28em] text-brand">Partner growth</p>
        <h3 class="mt-4 text-3xl font-semibold">Vendor network quality remains healthy across active zones.</h3>
        <p class="mt-4 max-w-2xl text-sm leading-7 text-muted-light dark:text-muted-dark">
          Use this page as a starting UI for onboarding, performance analysis, and vendor relationship management.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
          <p class="text-sm text-muted-light dark:text-muted-dark">Active vendors</p>
          <p class="mt-3 text-3xl font-semibold">126</p>
        </div>
        <div class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
          <p class="text-sm text-muted-light dark:text-muted-dark">Pending onboarding</p>
          <p class="mt-3 text-3xl font-semibold">22</p>
        </div>
      </div>
    </section>

    <section class="mt-6 grid gap-4 2xl:grid-cols-[1.55fr_0.9fr]">
      <div class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold">Featured vendor list</h3>
          <div class="rounded-2xl bg-soft-light px-4 py-2 text-sm dark:bg-soft-dark">Commission tier view</div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <article v-for="vendor in vendors" :key="vendor.name" class="rounded-[1.75rem] border border-line-light bg-soft-light p-5 dark:border-line-dark dark:bg-soft-dark">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-lg font-semibold">{{ vendor.name }}</p>
                <p class="mt-1 text-sm text-muted-light dark:text-muted-dark">{{ vendor.category }}</p>
              </div>
              <span class="rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand">{{ vendor.rating }}</span>
            </div>
            <div class="mt-6 flex items-center justify-between text-sm">
              <span class="text-muted-light dark:text-muted-dark">{{ vendor.orders }}</span>
              <span class="rounded-full bg-black px-3 py-1 text-xs text-white dark:bg-white dark:text-black">{{ vendor.status }}</span>
            </div>
          </article>
        </div>
      </div>

      <div class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
        <h3 class="text-xl font-semibold">Onboarding pipeline</h3>
        <div class="mt-6 space-y-4">
          <article v-for="item in onboarding" :key="item.stage" class="rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">
            <div class="flex items-center justify-between">
              <p class="font-medium">{{ item.stage }}</p>
              <span class="rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand">{{ item.count }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
