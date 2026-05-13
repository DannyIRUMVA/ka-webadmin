<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const orderStats = [
  { label: 'Active deliveries', value: '312', note: '28 riders currently on route' },
  { label: 'Delayed orders', value: '19', note: 'Mostly during peak traffic window' },
  { label: 'Completed today', value: '1,842', note: 'Average delivery time 26 min' }
]

const orders = [
  { id: 'KKF-2041', customer: 'Josiane U.', vendor: 'Kigali Bites', total: 'RWF 12,800', status: 'On route', eta: '12 min' },
  { id: 'KKF-2040', customer: 'Patrick M.', vendor: 'Biryogo Kitchen', total: 'RWF 8,500', status: 'Preparing', eta: '18 min' },
  { id: 'KKF-2039', customer: 'Grace A.', vendor: 'Remera Grill', total: 'RWF 15,400', status: 'Delayed', eta: '31 min' },
  { id: 'KKF-2038', customer: 'Diane K.', vendor: 'Kacyiru Express', total: 'RWF 10,700', status: 'Delivered', eta: 'Completed' }
]

const alerts = [
  '3 riders have low battery status in busy zones',
  '2 vendors exceeded preparation SLA in the last hour',
  '1 payment confirmation is still pending for manual review'
]
</script>

<template>
  <div>
    <section class="mt-8 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
      <div class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
        <div class="flex flex-wrap items-center gap-3">
          <button class="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-black">All orders</button>
          <button class="rounded-2xl bg-soft-light px-4 py-3 text-sm dark:bg-soft-dark">Preparing</button>
          <button class="rounded-2xl bg-soft-light px-4 py-3 text-sm dark:bg-soft-dark">On route</button>
          <button class="rounded-2xl bg-soft-light px-4 py-3 text-sm dark:bg-soft-dark">Delivered</button>
          <button class="rounded-2xl bg-soft-light px-4 py-3 text-sm dark:bg-soft-dark">Delayed</button>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-3">
          <article v-for="item in orderStats" :key="item.label" class="rounded-[1.5rem] bg-soft-light p-5 dark:bg-soft-dark">
            <p class="text-sm text-muted-light dark:text-muted-dark">{{ item.label }}</p>
            <p class="mt-3 text-3xl font-semibold">{{ item.value }}</p>
            <p class="mt-2 text-sm text-muted-light dark:text-muted-dark">{{ item.note }}</p>
          </article>
        </div>
      </div>

      <div class="rounded-[2rem] border border-brand/20 bg-gradient-to-br from-brand/20 via-brand/10 to-transparent p-6 dark:from-brand/15 dark:via-brand/8">
        <p class="text-xs uppercase tracking-[0.28em] text-brand">Dispatch pulse</p>
        <h3 class="mt-4 text-2xl font-semibold">Lunch demand is trending above forecast.</h3>
        <p class="mt-3 text-sm leading-7 text-muted-light dark:text-muted-dark">
          Consider increasing rider coverage in central Kigali and moving watchlist vendors to high-priority monitoring.
        </p>
      </div>
    </section>

    <section class="mt-6 grid gap-4 2xl:grid-cols-[1.55fr_0.9fr]">
      <div class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold">Live order table</h3>
          <div class="rounded-2xl bg-soft-light px-4 py-2 text-sm dark:bg-soft-dark">Updated just now</div>
        </div>

        <div class="mt-6 overflow-hidden rounded-[1.5rem] border border-line-light dark:border-line-dark">
          <div class="grid grid-cols-5 gap-4 bg-soft-light px-4 py-3 text-xs uppercase tracking-[0.24em] text-muted-light dark:bg-soft-dark dark:text-muted-dark">
            <span>Order</span>
            <span>Customer</span>
            <span>Vendor</span>
            <span>Total</span>
            <span>Status</span>
          </div>

          <div v-for="order in orders" :key="order.id" class="grid grid-cols-1 gap-4 border-t border-line-light px-4 py-4 md:grid-cols-5 dark:border-line-dark">
            <div>
              <p class="font-medium">{{ order.id }}</p>
              <p class="mt-1 text-sm text-muted-light dark:text-muted-dark">ETA {{ order.eta }}</p>
            </div>
            <p class="text-sm md:text-base">{{ order.customer }}</p>
            <p class="text-sm md:text-base">{{ order.vendor }}</p>
            <p class="text-sm md:text-base">{{ order.total }}</p>
            <div>
              <span class="inline-flex rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand">{{ order.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <section class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
          <h3 class="text-xl font-semibold">Operational alerts</h3>
          <div class="mt-5 space-y-3">
            <div v-for="alert in alerts" :key="alert" class="rounded-[1.5rem] bg-soft-light p-4 text-sm leading-6 dark:bg-soft-dark">
              {{ alert }}
            </div>
          </div>
        </section>

        <section class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
          <h3 class="text-xl font-semibold">Delivery zones</h3>
          <div class="mt-5 space-y-4">
            <div class="rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">
              <div class="flex items-center justify-between text-sm"><span>City center</span><span>92%</span></div>
              <div class="mt-2 h-2 rounded-full bg-black/6 dark:bg-white/10"><div class="h-2 w-[92%] rounded-full bg-brand"></div></div>
            </div>
            <div class="rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">
              <div class="flex items-center justify-between text-sm"><span>Remera</span><span>74%</span></div>
              <div class="mt-2 h-2 rounded-full bg-black/6 dark:bg-white/10"><div class="h-2 w-[74%] rounded-full bg-brand"></div></div>
            </div>
            <div class="rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">
              <div class="flex items-center justify-between text-sm"><span>Nyamirambo</span><span>61%</span></div>
              <div class="mt-2 h-2 rounded-full bg-black/6 dark:bg-white/10"><div class="h-2 w-[61%] rounded-full bg-brand"></div></div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
