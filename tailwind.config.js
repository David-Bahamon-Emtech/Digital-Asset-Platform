/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sidebar-bg': 'var(--sidebar-bg)',
        'sidebar-text': 'var(--sidebar-text)',
        'sidebar-highlight-bg': 'var(--sidebar-highlight-bg)',
        'sidebar-highlight-text': 'var(--sidebar-highlight-text)',
        'emtech-gold': 'var(--emtech-gold)',
      }
    },
  },
  plugins: [],
}