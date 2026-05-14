export const useAdminNavigation = () => {
  return [
    { name: 'Overview', to: '/dashboard', badge: 'Live' },
    { name: 'Transactions', to: '/transactions', badge: '728' },
    { name: 'Creators', to: '/creators', badge: '362' },
    { name: 'Audience', to: '/audience', badge: '679' },
    { name: 'Finance', to: '/finance', badge: '1417' },
    { name: 'Payouts', to: '/payouts', badge: 'Queue' },
    { name: 'Content', to: '/content', badge: '24' },
    { name: 'System', to: '/system', badge: 'Live' },
    { name: 'Settings', to: '/settings', badge: 'Config' }
  ]
}
