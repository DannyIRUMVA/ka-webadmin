// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dlndxvnjwkehaggstlik.supabase.co',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbmR4dm5qd2tlaGFnZ3N0bGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4ODkxNDgsImV4cCI6MjA2NzQ2NTE0OH0.-wjVsaXpFuCGRbGbR3ugRzGgjues_zj1FTPvK9lJcqE'
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