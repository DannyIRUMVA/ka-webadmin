// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],

  runtimeConfig: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SERVICEKEY || '',
    systemHealthStripeWorkerUrl: process.env.SYSTEM_HEALTH_STRIPE_WORKER_URL || '',
    systemHealthLocalPaymentWorkerUrl: process.env.SYSTEM_HEALTH_LOCAL_PAYMENT_WORKER_URL || '',
    systemHealthR2UploaderWorkerUrl: process.env.SYSTEM_HEALTH_R2_UPLOADER_WORKER_URL || '',
    systemHealthMuxStatusUrl: process.env.SYSTEM_HEALTH_MUX_STATUS_URL || '',
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
      adminBaseUrl: process.env.NUXT_PUBLIC_ADMIN_BASE_URL || ''
    }
  },

  nitro: {
    preset: 'cloudflare-pages',

    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    }
  },

  modules: ['nitro-cloudflare-dev', '@nuxtjs/tailwindcss']
})