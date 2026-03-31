export const colors = {
  brand: {
    salmon: '#F43F5E',
    emerald: '#10B981',
    indigo: '#6366F1',
    amber: '#F59E0B',
    slate500: '#64748B',
    primaryRed:"#FC0808"
  },
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9', // Light gray for icon backgrounds
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    primary: '#6366F1',
    tabBar: '#FFFFFF',
    success: '#10B981',
    danger: '#F43F5E',
  },
  dark: {
    background: '#0B0F19', // Darker navy from your ProfileScreen
    surface: '#161B26', // Card background
    surfaceVariant: '#1E293B', // Icon container background
    text: '#FFFFFF',
    textMuted: '#94A3B8',
    border: '#1E293B',
    primary: '#818CF8',
    tabBar: '#0B0F19',
    success: '#10B981',
    danger: '#F43F5E',
  },
};


// utilities/theme.ts

export const getRandomGradient = () => {
  const gradients = [
    ['#6366F1', '#818CF8'], // Indigo
    ['#10B981', '#34D399'], // Emerald
    ['#F59E0B', '#FBBF24'], // Amber
    ['#F43F5E', '#FB7185'], // Salmon
    ['#8B5CF6', '#A78BFA'], // Violet
    ['#06B6D4', '#22D3EE'], // Cyan
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};
