import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// vite configuration for react and tailwind css v4
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // keep frontend dev server port consistent
    port: 5173,
    open: true,
  },
});