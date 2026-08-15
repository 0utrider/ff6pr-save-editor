import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig(({ command }) => ({
  // Production is served from https://0utrider.github.io/ff6pr-save-editor/
  // (a GitHub project page, not a user/org page or custom domain) — asset
  // URLs need this subpath prefix there or they 404. Keep the dev server at
  // root so local testing (npm run dev) still just works at "/".
  base: command === "build" ? "/ff6pr-save-editor/" : "/",
  plugins: [preact()],
}));
