<script setup lang="ts">
definePageMeta({
  layout: false
})

const { isDark, toggleTheme } = useAdminTheme()
</script>

<template>
  <div class="min-h-screen bg-canvas-light px-5 py-6 text-ink-light transition-colors duration-300 dark:bg-canvas-dark dark:text-ink-dark lg:px-8 lg:py-8">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 lg:min-h-[calc(100vh-4rem)] lg:flex-row">
      <section class="flex flex-1 flex-col justify-between rounded-[2rem] border border-brand/20 bg-gradient-to-br from-brand/20 via-brand/10 to-transparent p-6 dark:from-brand/15 dark:via-brand/8 lg:p-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand font-semibold text-black">K</div>
            <div>
              <p class="text-xs uppercase tracking-[0.28em] text-muted-light dark:text-muted-dark">Kakofi</p>
              <h1 class="text-lg font-semibold">Admin Access</h1>
            </div>
          </div>

          <button
            class="rounded-2xl border border-line-light bg-panel-light px-4 py-3 text-sm font-medium dark:border-line-dark dark:bg-panel-dark"
            @click="toggleTheme"
          >
            {{ isDark ? 'Light mode' : 'Dark mode' }}
          </button>
        </div>

        <div class="mt-10 max-w-xl lg:mt-0">
          <p class="inline-flex rounded-full border border-brand/30 bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-brand dark:bg-black/20">
            UI only
          </p>
          <h2 class="mt-5 text-4xl font-semibold tracking-tight">Secure access for Kakofi operations teams.</h2>
          <p class="mt-4 text-sm leading-7 text-muted-light dark:text-muted-dark">
            A comfortable login surface with warm brand accents, soft panels, and restrained contrast for long admin sessions.
          </p>

          <div class="mt-8 grid gap-4 sm:grid-cols-3">
            <div class="rounded-3xl border border-white/60 bg-white/75 p-4 dark:border-white/5 dark:bg-black/20">
              <p class="text-sm text-muted-light dark:text-muted-dark">Protected roles</p>
              <p class="mt-2 text-2xl font-semibold">08</p>
            </div>
            <div class="rounded-3xl border border-white/60 bg-white/75 p-4 dark:border-white/5 dark:bg-black/20">
              <p class="text-sm text-muted-light dark:text-muted-dark">2FA adoption</p>
              <p class="mt-2 text-2xl font-semibold">91%</p>
            </div>
            <div class="rounded-3xl border border-white/60 bg-white/75 p-4 dark:border-white/5 dark:bg-black/20">
              <p class="text-sm text-muted-light dark:text-muted-dark">Current region</p>
              <p class="mt-2 text-2xl font-semibold">Rwanda</p>
            </div>
          </div>
        </div>

        <div class="mt-8 rounded-3xl border border-line-light bg-panel-light p-5 dark:border-line-dark dark:bg-panel-dark">
          <p class="text-sm font-medium">Trusted by operations, finance, vendor success, and support teams.</p>
        </div>
      </section>

      <section class="flex w-full max-w-xl items-center">
        <div class="w-full rounded-[2rem] border border-line-light bg-panel-light p-6 shadow-soft dark:border-line-dark dark:bg-panel-dark lg:p-8">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm uppercase tracking-[0.28em] text-muted-light dark:text-muted-dark">Sign in</p>
              <h3 class="mt-2 text-2xl font-semibold">Welcome back</h3>
            </div>
            <NuxtLink to="/" class="rounded-2xl bg-soft-light px-4 py-3 text-sm dark:bg-soft-dark">
              Dashboard
            </NuxtLink>
          </div>

          <form class="mt-8 space-y-5">
            <label class="block">
              <span class="mb-2 block text-sm text-muted-light dark:text-muted-dark">Work email</span>
              <input type="email" placeholder="admin@kakofi.com" class="w-full rounded-2xl border border-line-light bg-soft-light px-4 py-3 outline-none transition placeholder:text-muted-light/70 focus:border-brand dark:border-line-dark dark:bg-soft-dark dark:placeholder:text-muted-dark/70" />
            </label>

            <label class="block">
              <span class="mb-2 block text-sm text-muted-light dark:text-muted-dark">Password</span>
              <input type="password" placeholder="••••••••••••" class="w-full rounded-2xl border border-line-light bg-soft-light px-4 py-3 outline-none transition placeholder:text-muted-light/70 focus:border-brand dark:border-line-dark dark:bg-soft-dark dark:placeholder:text-muted-dark/70" />
            </label>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="rounded-2xl border border-line-light bg-soft-light p-4 dark:border-line-dark dark:bg-soft-dark">
                <span class="flex items-center justify-between gap-3">
                  <span>
                    <span class="block text-sm font-medium">Remember this device</span>
                    <span class="mt-1 block text-xs text-muted-light dark:text-muted-dark">Keep session active for 7 days</span>
                  </span>
                  <input type="checkbox" checked class="h-4 w-4 accent-brand" />
                </span>
              </label>

              <label class="rounded-2xl border border-line-light bg-soft-light p-4 dark:border-line-dark dark:bg-soft-dark">
                <span class="flex items-center justify-between gap-3">
                  <span>
                    <span class="block text-sm font-medium">Use 2FA</span>
                    <span class="mt-1 block text-xs text-muted-light dark:text-muted-dark">Authenticator recommended</span>
                  </span>
                  <input type="checkbox" checked class="h-4 w-4 accent-brand" />
                </span>
              </label>
            </div>

            <button type="button" class="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95">
              Sign in to admin
            </button>
          </form>

          <div class="mt-8 grid gap-4 sm:grid-cols-2">
            <div class="rounded-3xl bg-soft-light p-4 dark:bg-soft-dark">
              <p class="text-sm text-muted-light dark:text-muted-dark">Last sign-in</p>
              <p class="mt-2 font-semibold">Today • 08:51 AM</p>
            </div>
            <div class="rounded-3xl bg-soft-light p-4 dark:bg-soft-dark">
              <p class="text-sm text-muted-light dark:text-muted-dark">Security notice</p>
              <p class="mt-2 font-semibold">No unresolved warnings</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
