import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 主题色
        primary: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
          cyan: '#06B6D4',
        },
        // 背景色
        bg: {
          primary: '#0F172A',
          secondary: '#1E293B',
          tertiary: '#334155',
        },
        // 文字色
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        // 功能色
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8B5CF6, #3B82F6, #06B6D4)',
        'gradient-text': 'linear-gradient(to right, #A78BFA, #60A5FA, #22D3EE)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
