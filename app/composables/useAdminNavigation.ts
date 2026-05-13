export const useAdminNavigation = () => {
  return [
    { name: 'Overview', to: '/', badge: 'Live' },
    { name: 'Orders', to: '/orders', badge: '148' },
    { name: 'Vendors', to: '/vendors', badge: '26' },
    { name: 'Customers', to: '/customers', badge: 'New' },
    { name: 'Finance', to: '/finance', badge: '4' },
    { name: 'Support', to: '/support', badge: '12' },
    { name: 'Settings', to: '/settings', badge: 'UI' }
  ]
}
