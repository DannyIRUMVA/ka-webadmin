<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  subtitle?: string
  badge?: string
  accent?: boolean
}>(), {
  subtitle: '',
  badge: '',
  accent: false
})
</script>

<template>
  <section :class="[
    'rounded-3xl border bg-white p-5 dark:bg-[#111214]',
    accent ? 'border-brand/25 dark:border-brand/25' : 'border-slate-200 dark:border-white/10'
  ]">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p v-if="subtitle" class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ subtitle }}</p>
      </div>
      <div v-if="badge" class="rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand">{{ badge }}</div>
    </div>

    <div class="mt-4">
      <slot />
    </div>
  </section>
</template>
