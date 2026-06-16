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
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        dark: {
          bg: '#0F172A',       // Deep slate bg (Notion/Linear dark)
          card: '#1E293B',     // Card bg
          hover: '#334155',    // Card hover
          border: '#1E293B',   // Border slate
          accent: '#8B5CF6'    // Accent purple
        },
        brand: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
          emerald: '#10B981',
          rose: '#F43F5E',
          orange: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 15px rgba(139, 92, 246, 0.15)',
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.15)'
      }
    },
  },
  plugins: [],
}
