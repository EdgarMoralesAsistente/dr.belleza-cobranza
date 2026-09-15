import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gasUrl =
    env.GOOGLE_APPS_SCRIPT_URL ||
    env.GAS_URL ||
    env.GOOGLE_SHEETS_URL ||
    env.SHEETS_URL ||
    process.env.GOOGLE_APPS_SCRIPT_URL ||
    process.env.GAS_URL ||
    process.env.GOOGLE_SHEETS_URL ||
    process.env.SHEETS_URL ||
    process.env.VITE_GOOGLE_APPS_SCRIPT_URL ||
    env.VITE_GOOGLE_APPS_SCRIPT_URL ||
    '';

  return {
    plugins: [react(), tailwindcss()],
    envPrefix: ['VITE_', 'GOOGLE_', 'GAS_', 'SHEETS_'],
    define: {
      'import.meta.env.GOOGLE_APPS_SCRIPT_URL': JSON.stringify(gasUrl),
      'import.meta.env.GAS_URL': JSON.stringify(gasUrl),
      'import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL': JSON.stringify(gasUrl),
      'process.env.GOOGLE_APPS_SCRIPT_URL': JSON.stringify(gasUrl),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
