<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const queues = [
  { name: 'Open tickets', count: '34', note: '11 from today' },
  { name: 'Escalations', count: '07', note: '2 need finance input' },
  { name: 'Avg. response', count: '4m 12s', note: 'Down 18% this week' }
]

const tickets = [
  { id: 'SUP-402', subject: 'Missing rider update', owner: 'Aline', priority: 'High' },
  { id: 'SUP-401', subject: 'Refund follow-up', owner: 'Merveille', priority: 'Medium' },
  { id: 'SUP-400', subject: 'Vendor prep complaint', owner: 'Claude', priority: 'High' }
]
</script>

<template>
  <div>
    <section class="mt-8 grid gap-4 md:grid-cols-3">
      <article v-for="queue in queues" :key="queue.name" class="rounded-[1.75rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
        <p class="text-sm text-muted-light dark:text-muted-dark">{{ queue.name }}</p>
        <p class="mt-3 text-3xl font-semibold">{{ queue.count }}</p>
        <p class="mt-2 text-sm text-muted-light dark:text-muted-dark">{{ queue.note }}</p>
      </article>
    </section>

    <section class="mt-6 grid gap-4 2xl:grid-cols-[1.45fr_1fr]">
      <div class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold">Priority inbox</h3>
          <div class="rounded-2xl bg-soft-light px-4 py-2 text-sm dark:bg-soft-dark">Live queue</div>
        </div>

        <div class="mt-6 space-y-4">
          <article v-for="ticket in tickets" :key="ticket.id" class="rounded-[1.75rem] border border-line-light bg-soft-light p-5 dark:border-line-dark dark:bg-soft-dark">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="font-semibold">{{ ticket.subject }}</p>
                <p class="mt-1 text-sm text-muted-light dark:text-muted-dark">{{ ticket.id }} • Owner: {{ ticket.owner }}</p>
              </div>
              <span class="rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand">{{ ticket.priority }}</span>
            </div>
          </article>
        </div>
      </div>

      <div class="rounded-[2rem] border border-brand/20 bg-gradient-to-br from-brand/20 via-brand/10 to-transparent p-6 dark:from-brand/15 dark:via-brand/8">
        <p class="text-xs uppercase tracking-[0.28em] text-brand">Quality signal</p>
        <h3 class="mt-4 text-2xl font-semibold">Support satisfaction remains stable at 4.7/5.</h3>
        <p class="mt-4 text-sm leading-7 text-muted-light dark:text-muted-dark">
          The UI is prepared for future chat streams, ticket filters, SLA tracking, and resolution analytics.
        </p>
      </div>
    </section>
  </div>
</template>
