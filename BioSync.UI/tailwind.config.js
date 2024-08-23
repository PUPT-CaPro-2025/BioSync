/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'selector',
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        darkRed: '#D33C33',
        brightRed: '#F84C42',
        darkOrange: '#FB7E3C',
        darkerOrange: '#B75E2E',
        f2White: '#F2E8E9',
        f4White: '#F4F4F4',
        cleanWhite: '#FFFFFF',
        darkGray: '#393939',
        lightGray: '#7F7F7F',
        semiGray: '#E3E3E3',
      },
      fontSize: {
        'custom-40': '40px',
        'custom-32': '32px',
        'custom-24': '24px',
        'custom-20': '20px',
        'custom-16': '16px',
        'custom-14': '14px',
        'custom-12': '12px',
      },
      borderColor: {
        darkRed: '#D33C33',
        brightRed: '#F84C42',
        darkOrange: '#FB7E3C',
        f2White: 'F2E8E9',
        f4White: '#F4F4F4',
        cleanWhite: '#FFFFFF',
        darkGray: '#393939',
        lightGray: '#7F7F7F',
      },
      borderWidth: {
        '1': '1px',
        '2': '2px'
      },
      backgroundImage: {
        'gradient-red-orange': 'linear-gradient(to right, #F84C42, #F9653F, #FB7E3C)',
        'gradient-dark-red-orange': 'linear-gradient(to right, #D33C33, #C54D31, #B75E2E)',
        'gradient-orange-red-down': 'linear-gradient(to bottom, #E4581D, #F9653F)',
        lightGray: '#7F7F7F',
      },
      padding: {
        '15': '60px',
        '19': '72px',
        nintypx: '90px',
        tenpx: '10px',
        sixpx: '6px',
        thirtypx: '30px',
      },
      margin: {
        '4px': '4px',  
        '2px': '2px',  
      },
      fontWeight: {
        'weight700': '700',
      },
    },
  },
  plugins: [],
}

