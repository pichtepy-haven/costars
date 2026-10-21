/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FCF9F2',
        page: '#F5F4EF',
        paper: '#FFFEFA',
        charcoal: '#342D2D',
        wine: '#810102',
        wineSoft: '#A43A35',
        sand: '#E8E2D8',
        ink: '#242321',
        muted: '#6B6662',
        amber: '#D69A3C',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Cabin', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 32px rgba(52, 48, 45, 0.08)',
        card: '0 4px 14px rgba(52, 48, 45, 0.06)',
      },
    },
  },
  plugins: [],
}