// src/constants/theme.js
// Exact match with website theme

export const COLORS = {
  // Backgrounds
  bg: '#070710',
  bgCard: 'rgba(255,255,255,0.04)',
  bgCardHover: 'rgba(255,255,255,0.07)',
  bgInput: 'rgba(255,255,255,0.05)',
  bgInputFocus: 'rgba(139,92,246,0.07)',

  // Purple (primary)
  purple: '#7c3aed',
  purpleLight: '#a855f7',
  purplePale: '#c084fc',
  purpleBorder: 'rgba(139,92,246,0.25)',
  purpleBg: 'rgba(139,92,246,0.12)',

  // Cyan
  cyan: '#06b6d4',
  cyanLight: '#22d3ee',

  // Green
  green: '#4ade80',
  greenBg: 'rgba(74,222,128,0.1)',
  greenBorder: 'rgba(74,222,128,0.25)',

  // Red
  red: '#ef4444',
  redLight: '#f87171',
  redBg: 'rgba(239,68,68,0.1)',
  redBorder: 'rgba(239,68,68,0.25)',

  // Text
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.35)',
  textDim: 'rgba(255,255,255,0.2)',

  // Borders
  border: 'rgba(255,255,255,0.08)',
  borderMd: 'rgba(255,255,255,0.12)',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#7c3aed', '#6366f1', '#0891b2'],
  gradientPurple: ['#7c3aed', '#6366f1'],
  gradientTitle: ['#c084fc', '#818cf8', '#22d3ee'],

  // Gold / Premium
  gold: '#f59e0b',
  goldBg: 'rgba(245,158,11,0.1)',
  goldBorder: 'rgba(245,158,11,0.25)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  // Will use System fonts since custom fonts need assets
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const SHADOWS = {
  purple: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
};
