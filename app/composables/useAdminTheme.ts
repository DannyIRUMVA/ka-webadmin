export const useAdminTheme = () => {
  const theme = useState<'light' | 'dark'>('theme', () => 'dark')
  const isDark = computed(() => theme.value === 'dark')

  const toggleTheme = () => {
    theme.value = isDark.value ? 'light' : 'dark'
  }

  return {
    theme,
    isDark,
    toggleTheme
  }
}
