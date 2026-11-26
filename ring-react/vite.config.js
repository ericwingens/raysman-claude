import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" keeps asset paths relative so the built app can be hosted anywhere.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
