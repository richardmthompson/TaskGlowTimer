import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      /* Soft-neo radius family: 6px controls, 12px card surfaces, 16px hero
         (hub) surfaces, 4px inline code/kbd; the circular timer stays a circle
         via rounded-full at the call site. */
      borderRadius: {
        DEFAULT: "var(--radius)",        /* 6px controls */
        sm: "var(--radius)",             /* 6px */
        md: "var(--radius)",             /* 6px */
        lg: "var(--radius-card)",        /* 12px cards/panels/toasts */
        xl: "var(--radius-hub)",         /* 16px hero surfaces */
        card: "var(--radius-card)",      /* 12px */
        hub: "var(--radius-hub)",        /* 16px */
        code: "var(--radius-code)",      /* 4px, inline code + kbd */
      },
      borderWidth: {
        thin: "var(--border-thin)",     /* 1.5px: chips, kbd, quiet cards */
        frame: "var(--border-frame)",   /* 3px: cards, inputs, navbar */
        heavy: "var(--border-heavy)",   /* 4px: hero surfaces, rare emphasis */
      },
      boxShadow: {
        "neo-sm": "var(--shadow-neo-sm)",
        neo: "var(--shadow-neo)",
        "neo-lg": "var(--shadow-neo-lg)",
        "neo-accent": "var(--shadow-neo-accent)", /* violet emphasis: ONE surface per view */
      },
      transitionTimingFunction: {
        neo: "var(--ease)",
        spring: "var(--ease-spring)",   /* selection lift only */
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        DEFAULT: "var(--duration-default)",
        slow: "var(--duration-slow)",
        spring: "var(--duration-spring)",
      },
      letterSpacing: {
        label: "var(--tracking-label)",
        kicker: "var(--tracking-kicker)",
        nav: "var(--tracking-nav)",
      },
      colors: {
        // Two-layer token model (see client/src/index.css header): the color
        // roles below map to the LOCKED VOX Canvas r2.1 theme layer. Only the
        // `card.border`/`popover.border` sub-keys are app-layer tokens defined
        // in index.css; the previously dangling *-border/sidebar/chart/status
        // entries (undefined + unconsumed) were removed.
        // Flat / base colors (regular buttons)
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "shake-error": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-10px)" },
          "75%": { transform: "translateX(10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shake-error": "shake-error 0.5s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
