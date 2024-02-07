import { nextui } from "@nextui-org/react";
import Typography from '@tailwindcss/typography'

// require("@tailwindcss/typography")
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [nextui(), Typography()],
};
