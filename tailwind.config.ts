import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Original Gameboy DMG-01 color palette
        'gb-darkest': '#0f380f',
        'gb-dark': '#306230',
        'gb-light': '#8bac0f',
        'gb-lightest': '#9bbc0f',
        // LCD screen background
        'gb-screen': '#9bbc0f',
        // Shell colors
        'gb-shell': '#8b8b8b',
        'gb-shell-dark': '#6b6b6b',
        'gb-shell-accent': '#4a0082',
      },
      fontFamily: {
        'pixel': ['var(--font-pixel)', 'monospace'],
      },
      animation: {
        'blink': 'blink 1s step-start infinite',
        'scanline': 'scanline 8s linear infinite',
        'pixel-fade': 'pixelFade 0.3s steps(4) forwards',
        'slide-up': 'slideUp 0.2s steps(4) forwards',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pixelFade: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'lcd': 'inset 0 0 20px rgba(15, 56, 15, 0.3)',
        'lcd-pixel': 'inset 0 0 0 1px rgba(15, 56, 15, 0.1)',
        'button': '0 4px 0 #4a4a4a, 0 6px 8px rgba(0,0,0,0.3)',
        'button-pressed': '0 2px 0 #4a4a4a, 0 3px 4px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}

export default config
