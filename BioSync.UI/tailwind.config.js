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
        darkerOrange: '#8f3813',
        f2White: 'F2E8E9',
        f4White: '#F4F4F4',
        cleanWhite: '#FFFFFF',
        darkGray: '#393939',
        lightGray: '#7F7F7F',
      },
      fontSize: {
        'custom-32': '32px',
        'custom-24': '24px',
        'custom-20': '20px',
        'custom-16': '16px',
        'custom-14': '14px',
        'custom-12': '12px',
      },
      borderColor: {
        darkRed: '#9F0303',
        brightRed: '#D31119',
        darkOrange: '#E4581D',
        f2White: 'F2E8E9',
        f4White: '#F4F4F4',
        cleanWhite: '#FFFFFF',
        darkGray: '#393939',
        lightGray: '#7F7F7F',
      },
      backgroundImage: {
        'gradient-red-orange': 'linear-gradient(to right, #9F0303, #D31119, #E4581D)',
        'gradient-dark-red-orange': 'linear-gradient(to right, #860404, #ad0f14, #ac4113)',
        lightGray: '#7F7F7F',
      },
      padding: {
        '15': '60px',
        '19': '72px',
        sixpx: '6px',
        thirtypx: '30px',
      },
      margin: {
        '4px': '4px',  
        '2px': '2px',  
    }
    },
  },
  plugins: [],
}

