/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Tells Tailwind where to find classes
  ],
  theme: {
    extend: {
      // Map CSS variables to Tailwind color names
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