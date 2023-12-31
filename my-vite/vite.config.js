// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Basic project configurations go here
  // You can specify plugins, define server options, build options, etc.

  // For example, if you are using React:
  // plugins: [react()]

  // If you need to resolve specific dependencies or alias paths:
  // resolve: {
  //   alias: {
  //     'your-alias': 'your-real-path'
  //   }
  // },

  // Customizing the build options:
  // build: {
  //   // Options like minify, sourcemap, lib configurations, etc.
  // },

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
