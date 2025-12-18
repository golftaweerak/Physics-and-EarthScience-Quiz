import { loadComponent } from './component-loader.js';
import { initializeCommonComponents } from './common-init.js';
import { initializeAuth } from './auth-controller.js';
import { ModalHandler } from './modal-handler.js';
import { SHOP_ITEMS, TRACK_TITLES } from './gamification.js';
import './gamification-controller.js'; // Import to ensure the listener in it runs

async function main() {
    try {
        // 1. Load Components
        await Promise.all([
            loadComponent('#main_header-placeholder', './components/main_header.html'),
            loadComponent('#footer-placeholder', './components/footer.html'),
            loadComponent('#modals-placeholder', './components/modals_common.html')
        ]);

        // 2. Initialize Common
        initializeCommonComponents();

        // 3. Initialize Auth & Game (เชื่อมต่อข้อมูลผู้ใช้)
        const gameInstance = initializeAuth();

        // 4. Setup Page Interactions
        setupProfileInteractions(gameInstance);

        // 5. Listen for updates to render charts
        window.addEventListener('gamification-updated', (e) => {
            if (e.detail.gameInstance) {
                renderProfileCharts(e.detail.gameInstance);
                updateInventoryUI(e.detail.gameInstance);
            }
        });

    } catch (error) {
        console.error("Error initializing profile:", error);
    }
}

function setupProfileInteractions(game) {
    // Modals
    const avatarModal = new ModalHandler('avatar-modal');
    const nameModal = new ModalHandler('name-edit-modal');
    const titleModal = new ModalHandler('title-modal');
    const themeModal = new ModalHandler('theme-modal');

    // Buttons
    document.getElementById('edit-avatar-btn')?.addEventListener('click', () => {
        populateAvatarModal(game);
        avatarModal.open();
    });
    document.getElementById('edit-name-btn')?.addEventListener('click', () => {
        const nameInput = document.getElementById('new-display-name');
        if (nameInput) nameInput.value = game.state.displayName;
        nameModal.open();
    });
    document.getElementById('edit-title-btn')?.addEventListener('click', () => {
        populateTitleModal(game);
        titleModal.open();
    });
    document.getElementById('edit-theme-btn')?.addEventListener('click', () => {
        populateThemeModal(game);
        themeModal.open();
    });

    // Save Name
    document.getElementById('save-name-btn')?.addEventListener('click', () => {
        const newName = document.getElementById('new-display-name')?.value.trim();
        if (newName) {
            game.setDisplayName(newName);
            nameModal.close();
        }
    });

    // Collapse/Expand All
    document.getElementById('expand-all-btn')?.addEventListener('click', () => toggleAllSections(true));
    document.getElementById('collapse-all-btn')?.addEventListener('click', () => toggleAllSections(false));

    // Individual Section Toggles
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.dataset.target;
            const content = document.getElementById(targetId);
            const icon = header.querySelector('.chevron-icon');
            if (content) {
                const isClosed = content.style.maxHeight === '0px';
                content.style.maxHeight = isClosed ? '2000px' : '0px';
                content.style.opacity = isClosed ? '1' : '0';
                if (icon) icon.style.transform = isClosed ? 'rotate(0deg)' : 'rotate(-90deg)';
            }
        });
    });
}

function toggleAllSections(expand) {
    document.querySelectorAll('.collapsible-content').forEach(content => {
        content.style.maxHeight = expand ? '2000px' : '0px';
        content.style.opacity = expand ? '1' : '0';
    });
    document.querySelectorAll('.chevron-icon').forEach(icon => {
        icon.style.transform = expand ? 'rotate(0deg)' : 'rotate(-90deg)';
    });
}

function renderProfileCharts(game) {
    const ctxRadar = document.getElementById('skills-radar-chart')?.getContext('2d');
    if (ctxRadar) {
        // Destroy old chart if exists
        const existingChart = Chart.getChart(ctxRadar);
        if (existingChart) existingChart.destroy();

        const physicsLevel = game.getPhysicsLevel().level;
        const earthLevel = game.getEarthLevel().level;

        new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: ['ฟิสิกส์', 'วิทย์โลก', 'ความสม่ำเสมอ', 'ความแม่นยำ', 'ประสบการณ์'],
                datasets: [{
                    label: 'ระดับความสามารถ',
                    data: [
                        physicsLevel, 
                        earthLevel, 
                        Math.min(20, game.state.streak), // Cap streak at 20 for chart
                        Math.min(20, Math.round((game.state.totalCorrectAnswers / (game.state.quizzesCompleted * 10 || 1)) * 20)), // Estimate accuracy
                        game.getCurrentLevel().level
                    ],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        suggestedMax: 20
                    }
                }
            }
        });
    }
}

function populateAvatarModal(game) {
    const grid = document.getElementById('avatar-grid');
    if (!grid) return;
    
    // Default Avatars + Shop Avatars owned
    const defaults = ['🧑‍🎓', '👨‍🔬', '👩‍🔬', '🚀', '🪐', '⚛️', '🔭'];
    const ownedItems = game.getInventory();
    const shopAvatars = SHOP_ITEMS.filter(i => i.type === 'avatar' && ownedItems.includes(i.id)).map(i => i.value);
    
    const allAvatars = [...defaults, ...shopAvatars];
    
    grid.innerHTML = allAvatars.map(av => `
        <div class="text-3xl p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-center avatar-option" data-avatar="${av}">
            ${av}
        </div>
    `).join('');

    grid.querySelectorAll('.avatar-option').forEach(el => {
        el.addEventListener('click', () => {
            game.setAvatar(el.dataset.avatar);
            new ModalHandler('avatar-modal').close();
        });
    });
}

function populateTitleModal(game) {
    const grid = document.getElementById('title-grid');
    if (!grid) return;

    const currentLevel = game.getCurrentLevel().level;
    const unlockedTitles = TRACK_TITLES.overall.slice(0, currentLevel);
    const ownedItems = game.getInventory();
    const shopTitles = SHOP_ITEMS.filter(i => i.type === 'title' && ownedItems.includes(i.id)).map(i => i.value);

    const allTitles = [...unlockedTitles, ...shopTitles];

    grid.innerHTML = allTitles.map(t => `
        <div class="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg title-option text-sm" data-title="${t}">
            ${t}
        </div>
    `).join('');

    grid.querySelectorAll('.title-option').forEach(el => {
        el.addEventListener('click', () => {
            game.equipTitle(el.dataset.title);
            document.getElementById('profile-title-display').textContent = el.dataset.title;
            document.getElementById('profile-title-display').classList.remove('hidden');
            new ModalHandler('title-modal').close();
        });
    });
}

function populateThemeModal(game) {
    const grid = document.getElementById('theme-grid');
    if (!grid) return;

    const ownedItems = game.getInventory();
    const shopThemes = SHOP_ITEMS.filter(i => i.type === 'theme' && ownedItems.includes(i.id));
    
    // Add default theme
    const allThemes = [{ name: 'มาตรฐาน', value: null }, ...shopThemes];

    grid.innerHTML = allThemes.map(t => `
        <div class="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg theme-option text-sm flex justify-between items-center" data-theme="${t.value || ''}">
            <span>${t.name}</span>
            ${t.value === game.state.selectedTheme ? '✅' : ''}
        </div>
    `).join('');

    grid.querySelectorAll('.theme-option').forEach(el => {
        el.addEventListener('click', () => {
            const themeVal = el.dataset.theme || null;
            game.equipTheme(themeVal);
            new ModalHandler('theme-modal').close();
        });
    });
}

function updateInventoryUI(game) {
    // Update Shop UI (show owned items)
    const shopGrid = document.getElementById('shop-items-grid');
    if (shopGrid) {
        // Re-render shop items to update "Owned" status
        // This logic is handled in gamification-controller.js via renderShop(), 
        // but we might need to trigger it or ensure it checks inventory correctly.
        // For now, gamification-controller.js handles the shop rendering.
    }
}

document.addEventListener('DOMContentLoaded', main);
