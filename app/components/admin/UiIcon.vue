<script setup lang="ts">
withDefaults(defineProps<{
  name:
    | 'users'
    | 'guest'
    | 'wallet'
    | 'feedback'
    | 'mail'
    | 'calendar'
    | 'phone'
    | 'purchase'
    | 'database'
    | 'client'
    | 'dashboard'
    | 'transactions'
    | 'creators'
    | 'audience'
    | 'finance'
    | 'payouts'
    | 'content'
    | 'system'
    | 'settings'
    | 'menu'
    | 'sun'
    | 'moon'
    | 'logout'
    | 'shield'
    | 'sparkles'
    | 'clock'
    | 'arrow-right'
  class?: string
}>(), {
  class: 'h-5 w-5'
})
</script>

<template>
  <svg v-if="name === 'users'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9.5" cy="7" r="3.5" />
    <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M14 4.13a3.5 3.5 0 0 1 0 5.74" />
  </svg>

  <svg v-else-if="name === 'guest'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>

  <svg v-else-if="name === 'wallet'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 16.5v-9Z" />
    <path d="M3 8h17" />
    <path d="M15.5 13h2" />
  </svg>

  <svg v-else-if="name === 'feedback'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M7 10h10" />
    <path d="M7 14h6" />
    <path d="M5 19l1.5-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-5 3Z" />
  </svg>

  <svg v-else-if="name === 'mail'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 6h16v12H4z" />
    <path d="m4 7 8 6 8-6" />
  </svg>

  <svg v-else-if="name === 'calendar'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
  </svg>

  <svg v-else-if="name === 'phone'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.66 2.63a2 2 0 0 1-.45 2.11L8 9.72a16 16 0 0 0 6.28 6.28l1.26-1.27a2 2 0 0 1 2.11-.45c.85.32 1.73.54 2.63.66A2 2 0 0 1 22 16.92Z" />
  </svg>

  <svg v-else-if="name === 'purchase'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M3 4h2l2.4 10.2A2 2 0 0 0 9.35 16H18a2 2 0 0 0 1.95-1.57L21 8H7" />
  </svg>

  <svg v-else-if="name === 'database'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <ellipse cx="12" cy="5" rx="7" ry="3" />
    <path d="M5 5v6c0 1.66 3.13 3 7 3s7-1.34 7-3V5" />
    <path d="M5 11v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
  </svg>

  <svg v-else-if="name === 'client'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    <path d="M4 20a8 8 0 0 1 16 0" />
    <path d="M19 8h2" />
    <path d="M20 7v2" />
  </svg>

  <svg v-else-if="name === 'dashboard'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="5" rx="2" />
    <rect x="13" y="10" width="8" height="11" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
  </svg>

  <svg v-else-if="name === 'transactions'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 7h11" />
    <path d="m11 4 4 3-4 3" />
    <path d="M20 17H9" />
    <path d="m13 14-4 3 4 3" />
  </svg>

  <svg v-else-if="name === 'creators'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 3 4 7v6c0 4.4 3.4 7.8 8 8 4.6-.2 8-3.6 8-8V7l-8-4Z" />
    <path d="m9.5 12 1.7 1.7 3.3-3.9" />
  </svg>

  <svg v-else-if="name === 'audience'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="8" cy="8" r="3" />
    <circle cx="16.5" cy="7" r="2.5" />
    <path d="M3 19a5 5 0 0 1 10 0" />
    <path d="M14 19a4.5 4.5 0 0 1 7 0" />
  </svg>

  <svg v-else-if="name === 'finance'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 3v18" />
    <path d="M17 7.5c0-1.9-2-3.5-5-3.5s-5 1.6-5 3.5 1.5 2.8 5 3.5 5 1.6 5 3.5-2 3.5-5 3.5-5-1.6-5-3.5" />
  </svg>

  <svg v-else-if="name === 'payouts'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M7 12h10" />
    <path d="m14 9 3 3-3 3" />
  </svg>

  <svg v-else-if="name === 'content'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v16.5A1.5 1.5 0 0 0 17.5 17H7.5A2.5 2.5 0 0 0 5 19.5v-15Z" />
    <path d="M8 7h8" />
    <path d="M8 11h8" />
    <path d="M8 15h5" />
  </svg>

  <svg v-else-if="name === 'system'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
    <path d="M12 3v3" />
    <path d="M12 18v3" />
    <path d="M3 12h3" />
    <path d="M18 12h3" />
    <path d="m5.6 5.6 2.1 2.1" />
    <path d="m16.3 16.3 2.1 2.1" />
    <path d="m18.4 5.6-2.1 2.1" />
    <path d="m7.7 16.3-2.1 2.1" />
  </svg>

  <svg v-else-if="name === 'settings'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 1-3 0 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 1 0-3 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 1 3 0 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.27.3.47.65.6 1a1.7 1.7 0 0 1 0 3c-.13.35-.33.7-.6 1Z" />
  </svg>

  <svg v-else-if="name === 'menu'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>

  <svg v-else-if="name === 'sun'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>

  <svg v-else-if="name === 'moon'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
  </svg>

  <svg v-else-if="name === 'logout'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>

  <svg v-else-if="name === 'shield'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 3 5 6v6c0 5 3.4 8.4 7 9 3.6-.6 7-4 7-9V6l-7-3Z" />
  </svg>

  <svg v-else-if="name === 'sparkles'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
    <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    <path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" />
  </svg>

  <svg v-else-if="name === 'clock'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>

  <svg v-else-if="name === 'arrow-right'" :class="class" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
</template>
