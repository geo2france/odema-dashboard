import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  plugins: [react(), svgr(),
    visualizer({ open: false }) ,
    Icons({ compiler: 'jsx', jsx: 'react' })  ],
  base: './',
  build: {
    chunkSizeWarningLimit: 4200,
  }
});
