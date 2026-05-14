<script setup lang="ts">
const theme = useState<'light' | 'dark'>('theme', () => 'dark')

const applyTheme = (value: 'light' | 'dark') => {
  if (!import.meta.client) {
    return
  }

  document.documentElement.classList.toggle('dark', value === 'dark')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('kakofi-admin-theme') as 'light' | 'dark' | null
  const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

  theme.value = savedTheme ?? preferredTheme
  applyTheme(theme.value)
})

watch(theme, (value) => {
  if (!import.meta.client) {
    return
  }

  localStorage.setItem('kakofi-admin-theme', value)
  applyTheme(value)
})
</script>

<template>
  <div class="min-h-screen">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
