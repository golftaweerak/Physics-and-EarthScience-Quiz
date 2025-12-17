import { initializePage } from './main.js';
import { initializeCustomQuizHandler } from './custom-quiz-handler.js';
import { loadComponent } from './component-loader.js';
import { initializeCommonComponents } from './common-init.js';


/**
 * Initializes the application by loading shared components and then running page-specific scripts.
 */
async function main() {
    // Load all shared components concurrently for better performance.
    const loadPromises = [
        //loadComponent('#main_header-placeholder', './components/main_header.html'),
        loadComponent('#footer-placeholder', './components/footer.html'),
        loadComponent('#modals-placeholder', './components/modals_common.html'),
    ];

    if (document.getElementById('header-placeholder')) {
        loadPromises.push(loadComponent('#header-placeholder', './components/header.html'));
    }

    await Promise.all(loadPromises);

    // Initialize common components like header, menu, etc.
    initializeCommonComponents();

    // Then, initialize scripts specific to the page by checking for key elements.
    if (document.getElementById('quiz-categories-container')) {
        initializePage();
    }
    if (document.getElementById('create-custom-quiz-btn')) {
        initializeCustomQuizHandler();
    }
}

document.addEventListener('DOMContentLoaded', main);