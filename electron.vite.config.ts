import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [react()],
    root: "src/renderer",
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "src/renderer/index.html"),
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
  },
});