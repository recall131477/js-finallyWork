module.exports = {
  purge: {
    enabled: true,
    content: ['*.html', 'js/*.js'],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      margin: {
        '7.5': '1.875rem',
      },
      padding: {
        '7.5': '1.875rem',
      },
      colors: {
        primary: '#265AE9',
        lightblue: '#E6EBF0',
        gray: '#b4b4b4',
        white: '#ffffff',
        lightpink: '#ffd5cd',
        orange: '#f36a19eb'
      },
      backgroundColor: {
        primary: '#265AE9',
        lightblue: '#E6EBF0'
      },
      fontSize: {
        'xs': '.75rem',
        'sm': '.875rem',
        'base': '1rem',
        'lg': '1.25rem',
        'xl': '2rem',
        '2xl': '5rem',
        '3xl': '12.25rem'
      },
      screens: {
        'sm': '576px',
        'md': '768px',
        'lg': '992px',
        'xl': '1200px'
      },
      fontFamily: {
        'serif': 'Cormorant Garamond'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
