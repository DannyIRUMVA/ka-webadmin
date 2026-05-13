<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <div>
    <section class="mt-8 grid gap-4 2xl:grid-cols-[1.2fr_0.9fr]">
      <div class="space-y-4">
        <article class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
          <h3 class="text-xl font-semibold">Display preferences</h3>
          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <label class="rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">
              <span class="block text-sm font-medium">Reduce visual intensity</span>
              <span class="mt-1 block text-sm text-muted-light dark:text-muted-dark">Keep surfaces soft and contrast balanced.</span>
              <input type="checkbox" checked class="mt-4 h-4 w-4 accent-brand" />
            </label>
            <label class="rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">
              <span class="block text-sm font-medium">Compact tables</span>
              <span class="mt-1 block text-sm text-muted-light dark:text-muted-dark">Fit more rows while preserving readability.</span>
              <input type="checkbox" class="mt-4 h-4 w-4 accent-brand" />
            </label>
          </div>
        </article>

        <article class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
          <h3 class="text-xl font-semibold">Notifications</h3>
          <div class="mt-6 space-y-3">
            <label class="flex items-center justify-between rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">
              <span>
                <span class="block font-medium">Payout review alerts</span>
                <span class="mt-1 block text-sm text-muted-light dark:text-muted-dark">Instant notice for high-value batches.</span>
              </span>
              <input type="checkbox" checked class="h-4 w-4 accent-brand" />
            </label>
            <label class="flex items-center justify-between rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">
              <span>
                <span class="block font-medium">Vendor onboarding reminders</span>
                <span class="mt-1 block text-sm text-muted-light dark:text-muted-dark">Daily summary for pending approvals.</span>
              </span>
              <input type="checkbox" checked class="h-4 w-4 accent-brand" />
            </label>
          </div>
        </article>
      </div>

      <div class="space-y-4">
        <section class="rounded-[2rem] border border-brand/20 bg-gradient-to-br from-brand/20 via-brand/10 to-transparent p-6 dark:from-brand/15 dark:via-brand/8">
          <p class="text-xs uppercase tracking-[0.28em] text-brand">Admin comfort</p>
          <h3 class="mt-4 text-2xl font-semibold">A settings area focused on control without clutter.</h3>
          <p class="mt-4 text-sm leading-7 text-muted-light dark:text-muted-dark">
            This page can later hold profile data, security, permissions, audit logs, and integrations.
          </p>
        </section>

        <section class="rounded-[2rem] border border-line-light bg-panel-light p-6 dark:border-line-dark dark:bg-panel-dark">
          <h3 class="text-xl font-semibold">Security summary</h3>
          <div class="mt-5 space-y-3 text-sm">
            <div class="rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">2-factor authentication enforced</div>
            <div class="rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">Last password rotation 18 days ago</div>
            <div class="rounded-[1.5rem] bg-soft-light p-4 dark:bg-soft-dark">No active policy violations</div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
