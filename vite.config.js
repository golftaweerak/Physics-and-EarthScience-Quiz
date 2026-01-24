
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
      },
    },
    outDir: 'dist',
  },
  server: {
    open: true,
  },
  base: '/Physics-and-EarthScience-Quiz/', // Essential for GitHub Pages sub-path deployment
});
