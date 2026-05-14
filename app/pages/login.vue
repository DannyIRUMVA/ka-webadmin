<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const { initialize, isAuthenticated, isAdmin, signInWithGoogle, lastError } = useAdminAuth()

const signingIn = ref(false)
const loginError = ref<string | null>(null)

const redirectTarget = computed(() => {
  return typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
    ? route.query.redirect
    : '/dashboard'
})

const handleGoogleLogin = async () => {
  signingIn.value = true
  loginError.value = null

  try {
    await signInWithGoogle(redirectTarget.value)
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : 'Unable to start Google sign-in.'
    signingIn.value = false
  }
}

onMounted(async () => {
  await initialize()

  if (isAuthenticated.value && isAdmin.value) {
    await navigateTo(redirectTarget.value)
    return
  }

  if (isAuthenticated.value) {
    await navigateTo('/unauthorized')
  }
})

watch(lastError, (value) => {
  if (value) {
    loginError.value = value
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-canvas-light px-6 text-ink-light dark:bg-canvas-dark dark:text-ink-dark">
    <div class="w-full max-w-md rounded-[2rem] border border-line-light bg-panel-light p-8 shadow-soft dark:border-line-dark dark:bg-panel-dark">
      <p class="text-sm uppercase tracking-[0.28em] text-muted-light dark:text-muted-dark">Kakofi admin</p>
      <h1 class="mt-3 text-3xl font-semibold">Sign in with Google</h1>
      <p class="mt-4 text-sm leading-7 text-muted-light dark:text-muted-dark">
        Use your Kakofi admin Google account. Access is allowed only when your profile has been verified by an admin.
      </p>

      <button
        type="button"
        class="mt-6 w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="signingIn"
        @click="handleGoogleLogin"
      >
        {{ signingIn ? 'Redirecting...' : 'Continue with Google' }}
      </button>

      <p v-if="loginError" class="mt-4 text-sm text-rose-500">{{ loginError }}</p>
    </div>
  </div>
</template>
