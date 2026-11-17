import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the build work at any URL path: GitHub Pages
// (https://nikhilk70.github.io/Addon-Automotive/), a custom domain root, or a
// local file server. Routing uses HashRouter (/#/shop), so no server rewrites are needed.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173 },
});
