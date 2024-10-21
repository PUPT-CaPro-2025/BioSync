/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'selector',
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        darkRed: '#68191F',
        brightRed: '#AB3130',
        darkOrange: '#F5B436',
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
        darkRed: '#68191F',
        brightRed: '#AB3130',
        darkOrange: '#F5B436',
        darkerOrange: '#B75E2E',
        f2White: '#F2E8E9',
        f4White: '#F4F4F4',
        cleanWhite: '#FFFFFF',
        darkGray: '#393939',
        lightGray: '#7F7F7F',
        semiGray: '#E3E3E3',
      },
      borderWidth: {
        '1': '1px',
        '2': '2px'
      },
      backgroundImage: {
        'gradient-red': 'linear-gradient(to right,  #68191F, #AB3130)',
        'gradient-dark-red': 'linear-gradient(to right, #3A0F12, #5C1919)',
        'gradient-orange-red-down': 'linear-gradient(to bottom, #E4581D, #F9653F)',
        lightGray: '#7F7F7F',
      },
      padding: {
        '15': '60px',
        '19': '72px',
        fifthteenpx: '15px',
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
        'weight400': '400',
        'weight700': '700',
      },
      lineHeight: {
        '30px': '30px',
      },
      opacity: {
        '1': '0.1',
      },
      zIndex: {
        '2': '2',
      },
    },
  },
  plugins: [],
}

