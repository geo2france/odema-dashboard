import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [react(), svgr(),
    visualizer({ open: false }) 
  ],
  base: './',
  build: {
    chunkSizeWarningLimit: 4200,
  }
});
