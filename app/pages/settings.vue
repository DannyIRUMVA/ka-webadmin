<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const { onAction, downloadJson } = useAdminPageActions()

const settingsGroups = [
  {
    title: 'Workspace',
    items: [
      'Use a minimal data-first layout.',
      'Keep compact cards and clean spacing.',
      'Use gold as the primary accent.'
    ]
  },
  {
    title: 'Admin model',
    items: [
      'Admin access is based on verified_by_admin.',
      'Creator verification is the main review workflow.',
      'Templates and plans are likely future settings surfaces.'
    ]
  },
  {
    title: 'Next real settings data',
    items: [
      'plan_configs',
      'email_templates',
      'admin profile preferences'
    ]
  }
]

onAction('settings-export', () => {
  downloadJson('settings-blueprint.json', {
    exportedAt: new Date().toISOString(),
    settingsGroups
  })
})
</script>

<template>
  <div class="space-y-6">
    <section class="grid gap-4 lg:grid-cols-3">
      <AdminPanelCard
        v-for="group in settingsGroups"
        :key="group.title"
        :title="group.title"
        accent
      >
        <div class="space-y-2">
          <div
            v-for="item in group.items"
            :key="item"
            class="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-700 dark:bg-brand/10 dark:text-slate-300"
          >
            {{ item }}
          </div>
        </div>
      </AdminPanelCard>
    </section>
  </div>
</template>
