export const useAdminNavigation = () => {
  return [
    { name: 'Overview', to: '/dashboard', icon: 'dashboard' as const },
    { name: 'Transactions', to: '/transactions', icon: 'transactions' as const },
    { name: 'Creators', to: '/creators', icon: 'creators' as const },
    { name: 'Audience', to: '/audience', icon: 'audience' as const },
    { name: 'Finance', to: '/finance', icon: 'finance' as const },
    { name: 'Payouts', to: '/payouts', icon: 'payouts' as const },
    { name: 'Content', to: '/content', icon: 'content' as const },
    { name: 'System', to: '/system', icon: 'system' as const },
    { name: 'Settings', to: '/settings', icon: 'settings' as const }
  ]
}
