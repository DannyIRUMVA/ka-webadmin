<script setup lang="ts">
definePageMeta({
  layout: false
})

const { initialize, isAuthenticated, isAdmin } = useAdminAuth()
const status = ref('Preparing Kakofi admin...')

onMounted(async () => {
  await initialize()

  if (isAuthenticated.value && isAdmin.value) {
    status.value = 'Opening dashboard...'
    await navigateTo('/dashboard')
    return
  }

  status.value = 'Opening sign-in...'
  await navigateTo('/login')
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-canvas-light px-6 text-ink-light dark:bg-canvas-dark dark:text-ink-dark">
    <p class="text-sm text-muted-light dark:text-muted-dark">{{ status }}</p>
  </div>
</template>
