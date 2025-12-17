import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: '#D7263D',
                    foreground: '#FFFFFF'
                },
                secondary: {
                    DEFAULT: '#02182B',
                    foreground: '#FFFFFF'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                habita: {
                    primary: '#D7263D',
                    secondary: '#02182B',
                    accent: '#0197F6',
                    light: '#F5F5F5',
                    dark: '#1A1A1A'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            // Todas las keyframes deben estar dentro de este objeto, separadas por comas.
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0'
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)'
                    }
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)'
                    },
                    to: {
                        height: '0'
                    }
                },
                'fade-in': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(10px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },
                'scale-in': {
                    '0%': {
                        transform: 'scale(0.95)',
                        opacity: '0'
                    },
                    '100%': {
                        transform: 'scale(1)',
                        opacity: '1'
                    }
                },
                'slide-up': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(20px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },
                'bounce-soft': {
                    '0%, 100%': {
                        transform: 'translateY(0)'
                    },
                    '50%': {
                        transform: 'translateY(-5px)'
                    }
                },
                'pulse-glow': {
                    '0%, 100%': {
                        boxShadow: '0 0 5px rgba(215, 38, 61, 0.3)'
                    },
                    '50%': {
                        boxShadow: '0 0 20px rgba(215, 38, 61, 0.6), 0 0 30px rgba(215, 38, 61, 0.4)'
                    }
                },
                'float': {
                    '0%, 100%': {
                        transform: 'translateY(0px)'
                    },
                    '50%': {
                        transform: 'translateY(-8px)'
                    }
                },
                'shimmer': {
                    '0%': {
                        backgroundPosition: '-200px 0'
                    },
                    '100%': {
                        backgroundPosition: '200px 0'
                    }
                },
                'slide-in-right': {
                    '0%': {
                        transform: 'translateX(100%)',
                        opacity: '0'
                    },
                    '100%': {
                        transform: 'translateX(0)',
                        opacity: '1'
                    }
                },
                'slide-in-left': {
                    '0%': {
                        transform: 'translateX(-100%)',
                        opacity: '0'
                    },
                    '100%': {
                        transform: 'translateX(0)',
                        opacity: '1'
                    }
                },
                'rotate-3d': {
                    '0%': {
                        transform: 'rotateY(0deg)'
                    },
                    '100%': {
                        transform: 'rotateY(360deg)'
                    }
                },
                'gradient-shift': {
                    '0%, 100%': {
                        backgroundPosition: '0% 50%'
                    },
                    '50%': {
                        backgroundPosition: '100% 50%'
                    }
                },
                'wave': {
                    '0%': {
                        transform: 'translateX(0)'
                    },
                    '50%': {
                        transform: 'translateX(-10px)'
                    },
                    '100%': {
                        transform: 'translateX(0)'
                    }
                },
                'typewriter': {
                    'from': {
                        width: '0'
                    },
                    'to': {
                        width: '100%'
                    }
                },
                'blink': {
                    '0%, 50%': {
                        opacity: '1'
                    },
                    '51%, 100%': {
                        opacity: '0'
                    }
                },
                'unroll-paper': {
                    '0%': {
                        transform: 'scaleY(0) translateY(-20px)',
                        opacity: '0',
                        transformOrigin: 'top'
                    },
                    '50%': {
                        transform: 'scaleY(0.5) translateY(-10px)',
                        opacity: '0.5'
                    },
                    '100%': {
                        transform: 'scaleY(1) translateY(0)',
                        opacity: '1',
                        transformOrigin: 'top'
                    }
                },
                'roll-up-paper': {
                    '0%': {
                        transform: 'scaleY(1) translateY(0)',
                        opacity: '1',
                        transformOrigin: 'top'
                    },
                    '50%': {
                        transform: 'scaleY(0.5) translateY(-10px)',
                        opacity: '0.5'
                    },
                    '100%': {
                        transform: 'scaleY(0) translateY(-20px)',
                        opacity: '0',
                        transformOrigin: 'top'
                    }
                },
                'slide-down-gentle': {
                    '0%': {
                        transform: 'translateY(-10px) scale(0.95)',
                        opacity: '0'
                    },
                    '100%': {
                        transform: 'translateY(0) scale(1)',
                        opacity: '1'
                    }
                },
                'fade-scale-in': {
                    '0%': {
                        opacity: '0',
                        transform: 'scale(0.9)'
                    },
                    '70%': {
                        opacity: '0.7',
                        transform: 'scale(1.02)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'scale(1)'
                    }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.5s ease-out',
                'scale-in': 'scale-in 0.3s ease-out',
                'slide-up': 'slide-up 0.6s ease-out',
                'bounce-soft': 'bounce-soft 2s infinite',
                'pulse-glow': 'pulse-glow 2s infinite',
                'float': 'float 3s ease-in-out infinite',
                'shimmer': 'shimmer 2s infinite linear',
                'slide-in-right': 'slide-in-right 0.5s ease-out',
                'slide-in-left': 'slide-in-left 0.5s ease-out',
                'rotate-3d': 'rotate-3d 2s linear infinite',
                'gradient-shift': 'gradient-shift 3s ease infinite',
                'wave': 'wave 1.5s ease-in-out infinite',
                'typewriter': 'typewriter 2s steps(20) forwards',
                'blink': 'blink 1s infinite',
                'unroll-paper': 'unroll-paper 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'roll-up-paper': 'roll-up-paper 0.3s ease-out',
                'slide-down-gentle': 'slide-down-gentle 0.3s ease-out',
                'fade-scale-in': 'fade-scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            },
            backgroundImage: {
                'gradient-habita': 'linear-gradient(135deg, #D7263D 0%, #02182B 100%)',
                'gradient-card': 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                'gradient-animated': 'linear-gradient(-45deg, #D7263D, #02182B, #0197F6, #D7263D)',
            },
            backgroundSize: {
                '200%': '200% 200%',
            },
            transitionProperty: {
                'height': 'height',
                'spacing': 'margin, padding',
                'transform': 'transform',
            },
            transitionDuration: {
                '2000': '2000ms',
                '3000': '3000ms',
            }
        }
    },
    plugins: [animate],
} satisfies Config;