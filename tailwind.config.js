/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#121212',
        surface: '#1E1E1E',
        accent: '#FF5722', // Неоновый оранжевый для кнопок (цвет угля)
      }
    },
  },
  plugins: [],
}