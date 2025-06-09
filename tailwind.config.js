/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        'glass-dark': 'rgba(17, 25, 40, 0.75)',
        'glass-border': 'rgba(255, 255, 255, 0.125)',
        'primary-gradient-from': '#FF0080',
        'primary-gradient-to': '#7928CA',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropFilter: {
        'glass': 'blur(16px) saturate(180%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.pink.500"), 0 0 20px theme("colors.pink.500")',
        'neon-blue': '0 0 5px theme("colors.blue.500"), 0 0 20px theme("colors.blue.500")',
        'neon-purple': '0 0 5px theme("colors.purple.500"), 0 0 20px theme("colors.purple.500")',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.glass-morphism': {
          background: 'rgba(17, 25, 40, 0.75)',
          'backdrop-filter': 'blur(16px) saturate(180%)',
          'border': '1px solid rgba(255, 255, 255, 0.125)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};
