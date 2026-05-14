export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }

  const publicRoutes = ['/', '/login', '/auth/callback', '/unauthorized']
  if (publicRoutes.some((route) => to.path === route || to.path.startsWith(`${route}/`))) {
    return
  }

  const { initialize, isAuthenticated, isAdmin } = useAdminAuth()
  await initialize()

  if (!isAuthenticated.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (!isAdmin.value) {
    return navigateTo('/unauthorized')
  }
})
