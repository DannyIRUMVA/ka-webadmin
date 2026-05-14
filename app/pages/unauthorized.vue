<script setup lang="ts">
definePageMeta({
  layout: false
})

const { displayName, user, signOut } = useAdminAuth()
const signingOut = ref(false)
const signOutError = ref<string | null>(null)

const handleSignOut = async () => {
  signingOut.value = true
  signOutError.value = null

  try {
    await signOut()
  } catch (error) {
    signOutError.value = error instanceof Error ? error.message : 'Unable to sign out.'
  } finally {
    signingOut.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-canvas-light px-6 text-ink-light dark:bg-canvas-dark dark:text-ink-dark">
    <div class="w-full max-w-xl rounded-[2rem] border border-line-light bg-panel-light p-8 shadow-soft dark:border-line-dark dark:bg-panel-dark">
      <p class="text-sm uppercase tracking-[0.28em] text-muted-light dark:text-muted-dark">Kakofi admin</p>
      <h1 class="mt-3 text-3xl font-semibold">Access not authorized</h1>
      <p class="mt-4 text-sm leading-7 text-muted-light dark:text-muted-dark">
        You are signed in as <span class="font-medium text-ink-light dark:text-ink-dark">{{ displayName }}</span>
        <span v-if="user?.email">({{ user.email }})</span>, but your profile is not currently verified for Kakofi admin access.
      </p>

      <div class="mt-6 rounded-3xl bg-soft-light p-4 text-sm leading-6 text-muted-light dark:bg-soft-dark dark:text-muted-dark">
        Contact a Kakofi administrator to mark your profile as verified before retrying.
      </div>

      <p v-if="signOutError" class="mt-4 text-sm text-rose-500">{{ signOutError }}</p>

      <button
        class="mt-6 w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="signingOut"
        @click="handleSignOut"
      >
        {{ signingOut ? 'Signing out...' : 'Sign out' }}
      </button>
    </div>
  </div>
</template>
