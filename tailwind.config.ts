import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Cairo Font Family
      fontFamily: {
        cairo: ["var(--font-cairo)", "system-ui", "sans-serif"],
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      
      // Noon-Inspired Color System
      colors: {
        // Base Colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Card
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Popover
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        
        // Primary - Noon Green
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#E8F5E9",
          100: "#C8E6C9",
          200: "#A5D6A7",
          300: "#81C784",
          400: "#66BB6A",
          500: "#00A651", // Main
          600: "#008F45",
          700: "#007839",
          800: "#00612D",
          900: "#004A21",
        },
        
        // Secondary
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        
        // Muted
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        
        // Accent - Orange for Offers
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "#FFF3E0",
          100: "#FFE0B2",
          200: "#FFCC80",
          300: "#FFB74D",
          400: "#FFA726",
          500: "#F7941D", // Main
          600: "#EF6C00",
          700: "#E65100",
          800: "#D84315",
          900: "#BF360C",
        },
        
        // Destructive - Error Red
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        
        // Status Colors
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        
        // Border & Input
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        
        // Chart Colors
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        
        // Sidebar
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      
      // Border Radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      // RTL-aware spacing
      spacing: {
        "rtl-1": "0.25rem",
        "rtl-2": "0.5rem",
        "rtl-3": "0.75rem",
        "rtl-4": "1rem",
      },
      
      // Keyframes for RTL animations
      keyframes: {
        "fade-in-rtl": {
          from: { opacity: "0", transform: "translateX(10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-rtl": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0, 166, 81, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(0, 166, 81, 0)" },
        },
      },
      
      // Animation utilities
      animation: {
        "fade-in-rtl": "fade-in-rtl 0.3s ease-out",
        "slide-in-rtl": "slide-in-rtl 0.3s ease-out",
        "pulse-green": "pulse-green 2s infinite",
      },
      
      // Box Shadow for hover effects
      boxShadow: {
        "hover-lift": "0 12px 24px -8px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  
  // Plugins
  plugins: [
    tailwindcssAnimate,
    // RTL Plugin - Custom utilities
    function ({ addUtilities, addVariant }: any) {
      // RTL Variant
      addVariant("rtl", "&:where([dir='rtl'], [dir='rtl'] *)");
      addVariant("ltr", "&:where([dir='ltr'], [dir='ltr'] *)");
      
      // RTL Utilities
      addUtilities({
        // Logical Properties
        ".ms-auto": { "margin-inline-start": "auto" },
        ".me-auto": { "margin-inline-end": "auto" },
        ".ps-rtl-1": { "padding-inline-start": "0.25rem" },
        ".ps-rtl-2": { "padding-inline-start": "0.5rem" },
        ".ps-rtl-3": { "padding-inline-start": "0.75rem" },
        ".ps-rtl-4": { "padding-inline-start": "1rem" },
        ".pe-rtl-1": { "padding-inline-end": "0.25rem" },
        ".pe-rtl-2": { "padding-inline-end": "0.5rem" },
        ".pe-rtl-3": { "padding-inline-end": "0.75rem" },
        ".pe-rtl-4": { "padding-inline-end": "1rem" },
        
        // Border Radius
        ".rounded-start-rtl": {
          "border-start-start-radius": "var(--radius)",
          "border-end-start-radius": "var(--radius)",
        },
        ".rounded-end-rtl": {
          "border-start-end-radius": "var(--radius)",
          "border-end-end-radius": "var(--radius)",
        },
        
        // Text Alignment
        ".text-start-rtl": { "text-align": "start" },
        ".text-end-rtl": { "text-align": "end" },
        
        // Noon Gradients
        ".gradient-noon": {
          background: "linear-gradient(135deg, var(--primary) 0%, #00C853 100%)",
        },
        ".gradient-noon-accent": {
          background: "linear-gradient(135deg, var(--accent) 0%, #FFB74D 100%)",
        },
        
        // Hover Lift Effect
        ".hover-lift": {
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        },
        ".hover-lift:hover": {
          transform: "translateY(-4px)",
          "box-shadow": "0 12px 24px -8px rgba(0, 0, 0, 0.15)",
        },
        
        // RTL Scrollbar
        ".scrollbar-rtl::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        ".scrollbar-rtl::-webkit-scrollbar-track": {
          background: "var(--muted)",
          "border-radius": "4px",
        },
        ".scrollbar-rtl::-webkit-scrollbar-thumb": {
          background: "var(--muted-foreground)",
          "border-radius": "4px",
        },
        ".scrollbar-rtl::-webkit-scrollbar-thumb:hover": {
          background: "var(--foreground)",
        },
      });
    },
  ],
};

export default config;
