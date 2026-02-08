/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vs: {
          bg: "#1e1e1e",        // VS Code Main Background
          sidebar: "#252526",   // Sidebar/Header
          border: "#333333",    // Borders
          accent: "#007acc",    // Blue Accent
          text: "#d4d4d4",      // Main Text
          muted: "#858585",     // Comments/Secondary Text
          green: "#4ec9b0",     // Success
          red: "#f44747"        // Error
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'], 
        sans: ['Inter', 'sans-serif'],      
      }
    },
  },
  plugins: [],
}