/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#4361EE', dark: '#3046C5', soft: '#EEF2FF' },
        secondary: '#805DCA',
        success: { DEFAULT: '#00AB55', soft: '#E7F8F0' },
        warning: { DEFAULT: '#E2A03F', soft: '#FFF6E5' },
        danger: { DEFAULT: '#E7515A', soft: '#FDEDEF' },
        info: '#2196F3',
        background: '#F5F7FA',
        surface: { DEFAULT: '#FFFFFF', muted: '#F8FAFC' },
        border: '#E5E7EB',
        ink: { DEFAULT: '#0E1726', secondary: '#6B7280', muted: '#9CA3AF' },
      },
      borderRadius: { card: '12px', control: '8px', panel: '14px' },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 4px 14px rgba(15,23,42,.05)',
        panel: '0 10px 30px rgba(15,23,42,.10)',
      },
    },
  },
  plugins: [],
};
