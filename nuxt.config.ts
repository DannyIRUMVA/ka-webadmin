// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],

  nitro: {
    preset: 'cloudflare-pages',

    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    }
  },

  modules: ['nitro-cloudflare-dev', '@nuxtjs/tailwindcss']
})