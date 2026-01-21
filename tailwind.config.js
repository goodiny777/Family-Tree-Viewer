/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Colors (Oak Leaf palette)
        primary: {
          DEFAULT: '#5D6B4D',
          dark: '#3A4A35',
          light: '#7A8B6A',
        },
        // Accent Colors (Branch Brown palette)
        accent: {
          DEFAULT: '#8B7355',
          dark: '#6B5344',
          light: '#A08B70',
        },
        // Background Colors (Parchment palette)
        bg: {
          canvas: '#F5EFE0',
          panel: '#E8DCC8',
          aged: '#D4C4A8',
        },
        // Semantic Colors
        semantic: {
          error: '#B54B4B',
          focus: '#4A7B9D',
          highlight: '#F4A825',
        },
        // Node Colors - Male
        node: {
          'male-bg': '#E3EBF6',
          'male-border': '#7A9BC7',
          'male-deceased-bg': '#D4DBE6',
          'male-deceased-border': '#6B8BB7',
          // Node Colors - Female
          'female-bg': '#F6E3EB',
          'female-border': '#C77A9B',
          'female-deceased-bg': '#E6D4DB',
          'female-deceased-border': '#B76B8B',
          // Node Colors - Unknown
          'unknown-bg': '#E8E8E8',
          'unknown-border': '#A0A0A0',
          // Node Colors - Focused
          'focused-bg': '#FFF8E1',
          'focused-border': '#F4A825',
        },
        // Text Colors
        text: {
          primary: '#2D3B2A',
          secondary: '#5D6B4D',
          muted: '#7A8B6A',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Source Sans 3', 'sans-serif'],
      },
      fontSize: {
        // Type Scale from brief
        'h1': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['14px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        'node-name': ['13px', { lineHeight: '1.2', fontWeight: '500' }],
        'node-detail': ['11px', { lineHeight: '1.3', fontWeight: '400' }],
      },
      animation: {
        'slide-in': 'slideIn 250ms ease-out',
        'slide-out': 'slideOut 250ms ease-out',
        'fade-in': 'fadeIn 200ms ease',
        'zoom': 'zoom 200ms ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        zoom: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'node': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'node-hover': '0 4px 8px rgba(0, 0, 0, 0.15)',
        'node-focused': '0 0 0 3px rgba(244, 168, 37, 0.4)',
        'panel': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
