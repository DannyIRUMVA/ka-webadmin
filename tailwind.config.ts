import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: '#fcb116',
        canvas: {
          light: '#f7f7f5',
          dark: '#050505'
        },
        panel: {
          light: '#ffffff',
          dark: '#101010'
        },
        soft: {
          light: '#f1f1ed',
          dark: '#171717'
        },
        ink: {
          light: '#111111',
          dark: '#f5f5f5'
        },
        muted: {
          light: '#666666',
          dark: '#a3a3a3'
        },
        line: {
          light: '#e7e5e4',
          dark: '#262626'
        }
      },
      boxShadow: {
        soft: '0 20px 60px rgba(0, 0, 0, 0.08)'
      }
    }
  }
}
