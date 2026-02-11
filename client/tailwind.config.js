/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vs-bg': '#1e1e1e',
        'vs-sidebar': '#252526',
        'vs-border': '#3e3e42',
        'vs-accent': '#007acc',
        'vs-text': '#cccccc',
      }
    },
  },
  plugins: [],
}