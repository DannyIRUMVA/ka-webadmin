export const useAdminNavigation = () => {
  return [
    { name: 'Overview', to: '/dashboard', badge: 'Live' },
    { name: 'Transactions', to: '/orders', badge: '728' },
    { name: 'Creators', to: '/vendors', badge: '362' },
    { name: 'Audience', to: '/customers', badge: '679' },
    { name: 'Finance', to: '/finance', badge: '1417' },
    { name: 'Content', to: '/support', badge: '24' },
    { name: 'System', to: '/system', badge: 'Live' },
    { name: 'Settings', to: '/settings', badge: 'Config' }
  ]
}
