/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f0',
          100: '#ffe8de',
          200: '#ffd3be',
          300: '#ffb394',
          400: '#ff865c',
          500: '#FF5B26', // Main brand flight orange from logo
          600: '#e54512',
          700: '#be340b',
          800: '#992c0d',
          900: '#7c270f',
          950: '#431005',
        },
        navy: {
          50: '#f0f4f9',
          100: '#dce5f1',
          200: '#bdcfe3',
          300: '#91b1d1',
          400: '#5e8ebb',
          500: '#3c70a4',
          600: '#2d5786',
          700: '#26466d',
          800: '#0D233A', // Main brand deep navy from logo
          900: '#0B1A2C', // Deep dark mode background
          950: '#060f1c',
        },
        warm: {
          50: '#FCFBF7',
          100: '#FAF8F0',
          200: '#F5EFE0',
          300: '#EDE4CD',
          900: '#181614',
        },
        tealbrand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#169B88', // Emerald/teal headline color from inspiration
          700: '#0f766e',
          800: '#0d5d57',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Playfair Display"', 'Merriweather', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'scan': 'scan 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { top: '0%' },
          '50%': { top: '95%' },
          '100%': { top: '0%' },
        }
      }
    },
  },
  plugins: [],
}
