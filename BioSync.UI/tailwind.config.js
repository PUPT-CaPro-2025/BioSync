/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'selector',
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        darkRed: '#9F0303',
        brightRed: '#D31119',
        darkOrange: '#E4581D',
        f2White: 'F2E8E9',
        f4White: '#F4F4F4',
        cleanWhite: '#FFFFFF',
      },
      fontSize: {
        'custom-32': '32px',
        'custom-24': '24px',
        'custom-20': '20px',
        'custom-16': '16px',
        'custom-14': '14px',
        'custom-12': '12px',
      },
    },
  },
  plugins: [],
}

