export default defineEventHandler(async (event) => {
  const { mode, dataClient } = await getVerifiedAdminDataClient(event)

  const [creatorsTotal, clientsTotal, verifiedAdmins, kycPending, kycUnverified, kycVerified] = await Promise.all([
    getExactCount(dataClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'creator')),
    getExactCount(dataClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client')),
    getExactCount(dataClient.from('profiles').select('*', { count: 'exact', head: true }).eq('verified_by_admin', true)),
    getExactCount(dataClient.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending')),
    getExactCount(dataClient.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'unverified')),
    getExactCount(dataClient.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'verified'))
  ])

  return {
    mode,
    metrics: {
      creatorsTotal,
      clientsTotal,
      verifiedAdmins,
      kycPending,
      kycUnverified,
      kycVerified
    }
  }
})
