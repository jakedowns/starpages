// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/starpages/',

  // Customizing the build options:
  build: {
    rollupOptions: {
      input: 'public/pixel-mixer.html',
      output: {
        dir: `dist/${new Date().getFullYear()}${new Date().getMonth()+1}${new Date().getDate()}`,
        format: 'es'
      }
    }
  },

  // Server-specific configurations for development:
  server: {
    // Set the host URL
    host: '0.0.0.0', // Listen on all network interfaces
    // host: 'specific-hostname', // Or set a specific hostname

    // Other server options can be set here
    port: 3010, // Optional: Set a specific port

    // cause WSL
    watch: {
        usePolling: true,
        interval: 500
    },

    hmr: {
      // HMR-specific configurations
      protocol: 'ws', // or 'wss' for secure connections
      host: '127.0.0.1',
      port: 3009,
      // You can specify other options as needed
    }
  }
});
