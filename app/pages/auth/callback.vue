<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const { initialize, isAuthenticated, isAdmin } = useAdminAuth()
const status = ref('Completing sign-in...')

onMounted(async () => {
  await initialize()

  if (!isAuthenticated.value) {
    status.value = 'No active session found. Redirecting to login...'
    await navigateTo('/login')
    return
  }

  if (!isAdmin.value) {
    status.value = 'Your account is signed in but is not verified for Kakofi admin access.'
    await navigateTo('/unauthorized')
    return
  }

  status.value = 'Sign-in complete. Redirecting to workspace...'

  const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
    ? route.query.redirect
    : '/dashboard'

  await navigateTo(redirect)
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-canvas-light px-6 text-ink-light dark:bg-canvas-dark dark:text-ink-dark">
    <div class="w-full max-w-lg rounded-[2rem] border border-line-light bg-panel-light p-8 text-center shadow-soft dark:border-line-dark dark:bg-panel-dark">
      <p class="text-sm uppercase tracking-[0.28em] text-muted-light dark:text-muted-dark">Kakofi admin</p>
      <h1 class="mt-3 text-3xl font-semibold">Authenticating...</h1>
      <p class="mt-4 text-sm leading-7 text-muted-light dark:text-muted-dark">
        {{ status }}
      </p>
    </div>
  </div>
</template>
