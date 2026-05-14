<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string | number
  note?: string
  accent?: boolean
}>(), {
  note: '',
  accent: false
})
</script>

<template>
  <article :class="[
    'rounded-3xl border bg-white p-5 transition-colors dark:bg-[#111214]',
    accent ? 'border-brand/25 dark:border-brand/25' : 'border-slate-200 dark:border-white/10'
  ]">
    <p class="text-sm text-slate-500 dark:text-slate-400">{{ label }}</p>
    <p class="mt-3 text-3xl font-semibold tracking-tight">{{ value }}</p>
    <p v-if="note" class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ note }}</p>
  </article>
</template>
