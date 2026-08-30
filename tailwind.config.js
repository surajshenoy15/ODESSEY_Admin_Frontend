/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 16px 44px rgba(4, 28, 53, 0.09)',
        lift: '0 24px 70px rgba(4, 28, 53, 0.14)',
      },
      colors: {
        brand: {
          50: '#eef3f7', 100: '#dce7ef', 200: '#bdcfdd', 300: '#91adbf', 400: '#63879f',
          500: '#466b85', 600: '#35566e', 700: '#29465c', 800: '#20394d', 900: '#162f43', 950: '#041c35',
        },
        accent: {
          50: '#fff2ec', 100: '#ffe1d3', 200: '#ffc0a6', 300: '#ff9870', 400: '#f87343',
          500: '#f15a29', 600: '#d94418', 700: '#b53414', 800: '#912c17', 900: '#762719',
        },
        cream: '#f5f1e9', paper: '#fffdf8',
        'logo-blue': '#08284c', 'logo-orange': '#f15a29', 'logo-yellow': '#f4c430', 'logo-green': '#2d8b63', 'logo-navy': '#041c35',
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'], display: ['Archivo', 'Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}
