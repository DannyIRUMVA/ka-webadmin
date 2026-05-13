<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const segments = [
  { name: 'Power users', size: '3,420', note: 'Order 4+ times weekly' },
  { name: 'Weekend families', size: '1,180', note: 'Peak basket size on Fridays' },
  { name: 'Dormant users', size: '860', note: 'No order in past 30 days' }
]

const highlights = [
  { label: 'Retention', value: '78%', tone: '30-day repeat rate' },
  { label: 'Average order value', value: 'RWF 9,800', tone: 'Across all active users' },
  { label: 'New customers', value: '214', tone: 'This week' }
]
</script>

<template>
  <div>
    <section class="mt-8 grid gap-4 md:grid-cols-3">
      <article v-for="item in highlights" :key="item.label" class="rounded-[1.75rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
        <p class="text-sm text-muted-light dark:text-muted-dark">{{ item.label }}</p>
        <p class="mt-3 text-3xl font-semibold">{{ item.value }}</p>
        <p class="mt-2 text-sm text-muted-light dark:text-muted-dark">{{ item.tone }}</p>
      </article>
    </section>

    <section class="mt-6 grid gap-4 2xl:grid-cols-[1.45fr_1fr]">
      <div class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold">Customer segments</h3>
          <div class="rounded-2xl bg-brand/15 px-4 py-2 text-sm text-brand">Updated today</div>
        </div>

        <div class="mt-6 space-y-4">
          <article v-for="segment in segments" :key="segment.name" class="rounded-[1.75rem] border border-line-light bg-soft-light p-5 dark:border-line-dark dark:bg-soft-dark">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-lg font-semibold">{{ segment.name }}</p>
                <p class="mt-1 text-sm text-muted-light dark:text-muted-dark">{{ segment.note }}</p>
              </div>
              <p class="text-2xl font-semibold">{{ segment.size }}</p>
            </div>
          </article>
        </div>
      </div>

      <div class="rounded-[2rem] border border-brand/20 bg-gradient-to-br from-brand/20 via-brand/10 to-transparent p-6 dark:from-brand/15 dark:via-brand/8">
        <p class="text-xs uppercase tracking-[0.28em] text-brand">Loyalty focus</p>
        <h3 class="mt-4 text-2xl font-semibold">Re-engage dormant users with gentle campaign prompts.</h3>
        <p class="mt-4 text-sm leading-7 text-muted-light dark:text-muted-dark">
          This section can evolve into campaign targeting, retention reports, and customer lifecycle workflows.
        </p>
      </div>
    </section>
  </div>
</template>
