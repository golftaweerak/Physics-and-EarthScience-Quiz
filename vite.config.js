import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '/Physics-and-EarthScience-Quiz/': resolve(__dirname, 'public/'),
      '/data/': resolve(__dirname, 'data/'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        edit_scores: resolve(__dirname, 'edit-scores.html'),
        leaderboard: resolve(__dirname, 'leaderboard.html'),
        pet_test: resolve(__dirname, 'pet-test.html'),
        preview_data: resolve(__dirname, 'preview-data.html'),
        preview: resolve(__dirname, 'preview.html'),
        profile: resolve(__dirname, 'profile.html'),
        quiz_generator: resolve(__dirname, 'quiz-generator.html'),
        scores: resolve(__dirname, 'scores.html'),
        summary: resolve(__dirname, 'summary.html'),
        quiz: resolve(__dirname, 'quiz/index.html'),
        landing: resolve(__dirname, 'landing.html'),
        simulations: resolve(__dirname, 'simulations.html'),
        simulation_viewer: resolve(__dirname, 'simulation-viewer.html'),
      },
    },
    outDir: 'dist',
  },
  server: {
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
  base: '/Physics-and-EarthScience-Quiz/', // Essential for GitHub Pages sub-path deployment
});
