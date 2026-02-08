/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Earth globe color palette
        earth: {
          cream: "#fef5bd", // Light background & highlights
          brown: "#5a412f", // Dark text & accents
          orange: "#ff7000", // Primary action
          oLight: "#ff8e3a", // Secondary action & hover
        },
        // Neutral palette - supporting colors
        neutral: {
          bg: "#fef5bd",
          50: "#fffef9",
          100: "#fef5bd",
          200: "#fce8a0",
          300: "#f5d580",
          400: "#edc560",
          500: "#deb040",
          600: "#c99820",
          700: "#a87d1a",
          800: "#5a412f",
          900: "#3d2b1f",
        },
        // Primary accent - orange
        accent: {
          50: "#fff7f0",
          100: "#ffe8dc",
          200: "#ffd4b8",
          300: "#ffb88a",
          400: "#ff9956",
          500: "#ff7000",
          600: "#ff6b00",
          700: "#cc5500",
          800: "#994000",
          900: "#662b00",
        },
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
        display: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "36px" }],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.08)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.08)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08)",
      },
      spacing: {
        0.5: "2px",
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        7: "28px",
        8: "32px",
        9: "36px",
        10: "40px",
        12: "48px",
        14: "56px",
        16: "64px",
      },
      transitionDuration: {
        200: "200ms",
        300: "300ms",
        400: "400ms",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideInUp 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant(
        "supports-backdrop-blur",
        "@supports (backdrop-filter: blur(1px))",
      );
    },
  ],
};
