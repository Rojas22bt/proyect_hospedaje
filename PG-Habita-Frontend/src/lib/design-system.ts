// src/lib/design-system.ts - VERSIÓN CORREGIDA
export const brandColors = {
  primary: '#D7263D',
  secondary: '#02182B',
  accent: '#0197F6',
  light: '#F5F5F5',
  dark: '#1A1A1A'
} as const

export const animations = {
  fadeIn: 'animate-fade-in',
  scaleIn: 'animate-scale-in',
  slideUp: 'animate-slide-up',
  bounce: 'animate-bounce-soft',
  pulseGlow: 'animate-pulse-glow',
  float: 'animate-float',
  shimmer: 'animate-shimmer',
  slideInRight: 'animate-slide-in-right',
  slideInLeft: 'animate-slide-in-left',
  gradientShift: 'animate-gradient-shift',
  wave: 'animate-wave'
} as const

// Clases de utilidad mejoradas con animaciones
export const designClasses = {
  // Cards con animaciones
  card: 'shadow-2xl border-2 border-gray-200 rounded-xl bg-white animate-scale-in hover:shadow-3xl transition-all duration-500 hover:scale-105',
  cardHover: 'transform transition-all duration-500 hover:scale-105 hover:shadow-3xl',

  // Botones con animaciones avanzadas
  button: {
    primary: `bg-gradient-to-r from-habita-primary to-red-600 hover:from-red-600 hover:to-habita-primary
              text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105
              hover:animate-pulse-glow active:scale-95`,
    secondary: `bg-gradient-to-r from-habita-secondary to-blue-900 hover:from-blue-900 hover:to-habita-secondary
                text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105
                active:scale-95`,
    accent: `bg-gradient-to-r from-habita-accent to-blue-500 hover:from-blue-500 hover:to-habita-accent
             text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105
             active:scale-95`,
    outline: `border-2 border-gray-200 hover:border-habita-primary text-gray-700 hover:text-habita-primary
              bg-white hover:bg-habita-primary/5 transition-all duration-500 hover:scale-105
              hover:shadow-lg active:scale-95`
  },

  // Inputs con animaciones
  input: `border-2 border-gray-200 focus:border-habita-primary focus:ring-2 focus:ring-habita-primary/20
          transition-all duration-500 focus:scale-105 bg-white/80 backdrop-blur-sm`,

  // Gradientes animados
  gradient: {
    primary: 'bg-gradient-to-r from-habita-primary to-red-600 animate-gradient-shift bg-200%',
    secondary: 'bg-gradient-to-r from-habita-secondary to-blue-900 animate-gradient-shift bg-200%',
    card: 'bg-gradient-to-br from-white via-gray-50 to-blue-50/50',
    shimmer: 'bg-gradient-shimmer animate-shimmer bg-200%'
  },

  // Efectos especiales
  effects: {
    glow: 'shadow-lg shadow-habita-primary/20 hover:shadow-xl hover:shadow-habita-primary/30',
    float: 'animate-float hover:animate-bounce-soft',
    wave: 'animate-wave'
  }, // ← COMA AQUÍ ES LO QUE FALTABA

  dropdown: {
    content: `bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-2xl
              animate-unroll-paper overflow-hidden`,
    item: `px-3 py-2.5 text-sm transition-all duration-300 cursor-pointer
           hover:bg-habita-primary/10 hover:text-habita-primary
           hover:scale-105 hover:shadow-md rounded-lg mx-2 my-1
           border-l-4 border-transparent hover:border-habita-primary`,
    separator: 'bg-gradient-to-r from-transparent via-gray-200 to-transparent h-px mx-2 my-1'
  },

  select: {
    content: `bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-2xl
              animate-unroll-paper overflow-hidden max-h-80`,
    item: `px-3 py-2.5 text-sm transition-all duration-300 cursor-pointer
           hover:bg-gradient-to-r hover:from-habita-primary/10 hover:to-blue-50
           hover:text-habita-primary data-[state=checked]:bg-habita-primary/20
           data-[state=checked]:text-habita-primary data-[state=checked]:font-semibold
           hover:scale-105 rounded-lg mx-2 my-1 border-l-4 border-transparent
           hover:border-habita-primary data-[state=checked]:border-habita-primary`,
    trigger: `border-2 border-gray-200 focus:border-habita-primary transition-all duration-300
              bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg`
  }
} as const

// Utilidades para stagger animations
export const staggerClasses = (index: number) => ({
  animationDelay: `${index * 100}ms`,
  animationFillMode: 'both'
} as React.CSSProperties)