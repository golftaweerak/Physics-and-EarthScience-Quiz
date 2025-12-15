import { Gamification, BADGES, ACHIEVEMENTS, SHOP_ITEMS } from './gamification.js';
import { getDetailedProgressForAllQuizzes, calculateStrengthsAndWeaknesses } from './data-manager.js';
import { ModalHandler } from './modal-handler.js';
import { showToast } from './toast.js';

const AVATARS = [
    '🧑‍🎓', '👨‍🎓', '👩‍🎓', '👨‍🔬', '👩‍🔬', '👨‍🚀', '👩‍🚀', '👽', '🤖', 
    '🌍', '🪐', '🌑', '☀️', '⭐', '☄️', '🚀', '🛰️', '🔭',
    '⚛️', '🧬', '🦠', '🧠', '🦉', '🦊', '🦁', '🐯', '🐶'
];

// NEW: Proficiency Group Definitions for Radar Chart
const PROFICIENCY_GROUPS = {
    'Mechanics': { 
        label: 'กลศาสตร์', 
        keywords: ['บทที่ 1:', 'บทที่ 2:', 'บทที่ 3:', 'บทที่ 4:', 'บทที่ 5:', 'บทที่ 6:', 'บทที่ 7:', 'บทที่ 8:', 'บทที่ 15:', 'ธรรมชาติทางฟิสิกส์', 'การเคลื่อนที่', 'แรง', 'สมดุล', 'งาน', 'โมเมนตัม', 'ของแข็ง'] 
    },
    'Electricity': { 
        label: 'ไฟฟ้าและแม่เหล็ก', 
        keywords: ['บทที่ 12:', 'บทที่ 13:', 'บทที่ 14:', 'ไฟฟ้า', 'แม่เหล็ก'] 
    },
    'WavesLight': { 
        label: 'คลื่นและแสง', 
        keywords: ['บทที่ 9:', 'บทที่ 10:', 'บทที่ 11:', 'บทที่ 17:', 'คลื่น', 'เสียง', 'แสง'] 
    },
    'ModernHeat': { 
        label: 'สสารและฟิสิกส์ยุคใหม่', 
        keywords: ['บทที่ 16:', 'บทที่ 18:', 'บทที่ 19:', 'ความร้อน', 'อะตอม', 'นิวเคลียร์'] 
    },
    'Astronomy': { 
        label: 'ดาราศาสตร์', 
        keywords: ['เอกภพ', 'กาแล็กซี', 'ดาวฤกษ์', 'ระบบสุริยะ', 'เทคโนโลยีอวกาศ', 'ทรงกลมฟ้า', 'ดาวเคราะห์', 'ดาราศาสตร์'] 
    },
    'Geology': { 
        label: 'ธรณีวิทยา', 
        keywords: ['โครงสร้างโลก', 'แปรสัณฐาน', 'ธรณี', 'หิน', 'แร่', 'แผนที่', 'ดิน', 'ทรัพยากรธรณี'] 
    },
    'Meteorology': { 
        label: 'อุตุนิยมวิทยา', 
        keywords: ['ลมฟ้าอากาศ', 'ภูมิอากาศ', 'อากาศ', 'หมุนเวียน', 'เมฆ', 'พยากรณ์', 'สมุทร', 'บรรยากาศ', 'อุตุนิยมวิทยา'] 
    }
};

// Theme colors for Radar Chart
const THEME_COLORS = {
    'theme-forest': { border: '#059669', background: 'rgba(5, 150, 105, 0.2)', point: '#059669' },
    'theme-sunset': { border: '#ea580c', background: 'rgba(234, 88, 12, 0.2)', point: '#ea580c' },
    'theme-ocean': { border: '#0891b2', background: 'rgba(8, 145, 178, 0.2)', point: '#0891b2' },
    'theme-berry': { border: '#db2777', background: 'rgba(219, 39, 119, 0.2)', point: '#db2777' },
    'theme-midnight': { border: '#475569', background: 'rgba(71, 85, 105, 0.2)', point: '#475569' },
    'default': { border: 'rgba(59, 130, 246, 1)', background: 'rgba(59, 130, 246, 0.2)', point: 'rgba(59, 130, 246, 1)' }
};

// Base Hues for History Chart Lines based on Theme
const THEME_HUES = {
    'theme-forest': 160, // Green
    'theme-sunset': 25,  // Orange
    'theme-ocean': 190,  // Cyan
    'theme-berry': 330,  // Pink
    'theme-midnight': 220 // Slate/Blue-ish
};

export async function initializeProfile() {
    const game = new Gamification();
    renderUserInfo(game);
    renderTrackProgress(game);
    renderBadges(game);
    renderAchievements(game);
    renderQuestHistory(game);
    renderShop(game);
    setupShopSystem(game);
    setupAvatarSystem(game);
    setupNameEditSystem(game);
    setupTitleSystem(game);
    setupThemeSystem(game);
    setupResetSystem(game);
    setupCollapsibleSections();
    await renderRadarChart(game);
    await renderProficiencyHistoryChart(game);
    await renderStrengthsWeaknesses();
}

function renderUserInfo(game) {
    const overall = game.getCurrentLevel();
    const rankTitleEl = document.getElementById('profile-rank-title');
    if (rankTitleEl) rankTitleEl.textContent = `${overall.title} (Lv.${overall.level})`;

    const totalXpEl = document.getElementById('profile-total-xp');
    if (totalXpEl) totalXpEl.textContent = game.state.xp.toLocaleString();

    const quizzesCountEl = document.getElementById('profile-quizzes-count');
    if (quizzesCountEl) quizzesCountEl.textContent = game.state.quizzesCompleted.toLocaleString();
    
    // Update display name
    const nameEl = document.getElementById('profile-display-name');
    if (nameEl) nameEl.textContent = game.state.displayName || 'ผู้เรียน (Guest)';
    
    // Update avatar display
    const avatarEl = document.getElementById('profile-avatar-display');
    if (avatarEl) {
        const avatar = game.state.avatar || '🧑‍🎓';
        const isImage = avatar.includes('/') || avatar.includes('.');
        if (isImage) {
            avatarEl.innerHTML = `<img src="${avatar}" alt="Profile Avatar" class="w-full h-full rounded-full object-cover">`;
        } else {
            avatarEl.innerHTML = avatar;
        }
    }

    // Update Title
    const titleEl = document.getElementById('profile-title-display');
    if (titleEl) {
        titleEl.textContent = game.state.selectedTitle ? `《 ${game.state.selectedTitle} 》` : '';
        titleEl.classList.toggle('hidden', !game.state.selectedTitle);
    }

    // Update Shop XP
    const shopXpEl = document.getElementById('shop-user-xp');
    if (shopXpEl) shopXpEl.textContent = game.state.xp.toLocaleString();

    // Update Theme Display (Optional, maybe just a text or icon)
    const themeEl = document.getElementById('profile-theme-display');
    if (themeEl) {
        themeEl.textContent = game.state.selectedTheme ? '🎨 ธีม: กำหนดเอง' : '🎨 ธีม: มาตรฐาน';
    }
}

function setupNameEditSystem(game) {
    const nameModal = new ModalHandler('name-edit-modal');
    const editBtn = document.getElementById('edit-name-btn');
    const saveBtn = document.getElementById('save-name-btn');
    const nameInput = document.getElementById('new-display-name');

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (nameInput) nameInput.value = game.state.displayName || '';
            nameModal.open();
            // Focus input after modal opens
            setTimeout(() => nameInput?.focus(), 100);
        });
    }

    if (saveBtn && nameInput) {
        const saveName = () => {
            const newName = nameInput.value.trim();
            if (newName) {
                game.setDisplayName(newName);
                renderUserInfo(game);
                nameModal.close();
                showToast('บันทึกสำเร็จ', 'เปลี่ยนชื่อเรียบร้อยแล้ว', '✏️');
            } else {
                showToast('ข้อผิดพลาด', 'กรุณาระบุชื่อ', '⚠️', 'error');
            }
        };

        saveBtn.addEventListener('click', saveName);
        
        // Allow Enter key to save
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveName();
        });
    }
}

function setupResetSystem(game) {
    const resetBtn = document.getElementById('reset-gamification-btn');
    if (!resetBtn) return;

    // Reuse the common confirmation modal
    const confirmModal = new ModalHandler('confirm-action-modal');
    const confirmBtn = document.getElementById('confirm-action-btn');
    const titleEl = document.getElementById('confirm-modal-title');
    const descEl = document.getElementById('confirm-modal-description');

    resetBtn.addEventListener('click', () => {
        if (titleEl) titleEl.textContent = 'รีเซ็ตข้อมูลความคืบหน้า?';
        if (descEl) descEl.innerHTML = 'คุณแน่ใจหรือไม่ที่จะลบข้อมูลเลเวล, XP, และเหรียญรางวัลทั้งหมด? <br><strong class="text-red-600 dark:text-red-500">การกระทำนี้ไม่สามารถย้อนกลับได้</strong>';
        
        // Clone button to remove old listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            game.resetProgress();
            confirmModal.close();
            window.location.reload(); // Reload to reflect changes
        });
        
        confirmModal.open();
    });
}

function setupCollapsibleSections() {
    const headers = document.querySelectorAll('.collapsible-header');
    const expandAllBtn = document.getElementById('expand-all-btn');
    const collapseAllBtn = document.getElementById('collapse-all-btn');

    // Function to toggle a single section
    const toggleSection = (header, forceExpand = null) => {
        const targetId = header.dataset.target;
        const content = document.getElementById(targetId); // This is the outer container
        const icon = header.querySelector('.chevron-icon');
        
        if (!content || !icon) return;

        // Check current state (if max-height is 0, it's collapsed)
        const isCollapsed = content.style.maxHeight === '0px';
        const shouldExpand = forceExpand !== null ? forceExpand : isCollapsed;

        if (shouldExpand) {
            // Expand
            // content.classList.remove('hidden'); // No longer using hidden class for animation
            content.style.maxHeight = content.scrollHeight + "px";
            content.style.opacity = "1";
            icon.classList.remove('-rotate-90'); // Point down
        } else {
            // Collapse
            // content.style.maxHeight = content.scrollHeight + "px"; // No longer needed if max-height is not initially 0
            // Force reflow - might not be needed depending on initial state
            content.offsetHeight; 
            content.style.maxHeight = "0px";
            content.style.opacity = "0";
            icon.classList.add('-rotate-90'); // Point right
        }
    };

    headers.forEach(header => {
        header.addEventListener('click', (e) => {
            // Prevent triggering if clicking on interactive elements inside header
            if (e.target.closest('button') || e.target.closest('a')) return;
            toggleSection(header);
        });
    });

    // Global controls
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', () => {
            headers.forEach(header => toggleSection(header, true));
        });
    }

    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', () => {
            headers.forEach(header => toggleSection(header, false));
        });
    }
}

function setupAvatarSystem(game) {
    const avatarModal = new ModalHandler('avatar-modal');
    const editBtn = document.getElementById('edit-avatar-btn');
    const avatarDisplay = document.getElementById('profile-avatar-display');
    const grid = document.getElementById('avatar-grid');

    // Open modal handlers
    if (editBtn) editBtn.addEventListener('click', () => avatarModal.open());
    if (avatarDisplay) avatarDisplay.addEventListener('click', () => avatarModal.open());

    // Render avatar grid
    if (grid) {
        renderAvatarGrid(game, grid);

        grid.addEventListener('click', (e) => {
            const btn = e.target.closest('.avatar-option');
            if (btn) {
                const newAvatar = btn.dataset.avatar;
                game.setAvatar(newAvatar);
                renderUserInfo(game); // Update UI immediately

                // Play success sound
                const audio = new Audio('./assets/audio/correct.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => {}); // Ignore potential auto-play errors

                avatarModal.close();
                showToast('บันทึกสำเร็จ', 'เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว', '😎');
                
                // Update selection highlight visually
                grid.querySelectorAll('.avatar-option').forEach(b => {
                    b.classList.remove('bg-blue-100', 'dark:bg-blue-900/50', 'ring-2', 'ring-blue-500');
                });
                btn.classList.add('bg-blue-100', 'dark:bg-blue-900/50', 'ring-2', 'ring-blue-500');
            }
        });
    }
}

function renderAvatarGrid(game, grid) {
    // Combine default avatars with purchased ones
    const inventory = game.getInventory();
    const purchasedAvatars = SHOP_ITEMS.filter(i => i.type === 'avatar' && inventory.includes(i.id)).map(i => i.value);
    const allAvatars = [...AVATARS, ...purchasedAvatars];
    const uniqueAvatars = [...new Set(allAvatars)];

    grid.innerHTML = uniqueAvatars.map(avatar => {
        const isImage = avatar.includes('/') || avatar.includes('.');
        const content = isImage 
            ? `<img src="${avatar}" alt="Avatar" class="w-8 h-8 rounded-full object-cover mx-auto">` 
            : avatar;

        return `
        <button class="avatar-option text-3xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${game.state.avatar === avatar ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500' : ''}" data-avatar="${avatar}">
            ${content}
        </button>
    `}).join('');
}

function setupTitleSystem(game) {
    const titleModal = new ModalHandler('title-modal');
    const editBtn = document.getElementById('edit-title-btn');
    const grid = document.getElementById('title-grid');

    if (editBtn) editBtn.addEventListener('click', () => {
        renderTitleGrid(game, grid, titleModal);
        titleModal.open();
    });
}

function renderTitleGrid(game, grid, modal) {
    if (!grid) return;
    const unlockedIds = game.state.unlockedAchievements || [];
    const unlockedTitles = ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id) && a.rewardTitle).map(a => a.rewardTitle);

    // Add purchased titles
    const inventory = game.getInventory();
    const purchasedTitles = SHOP_ITEMS.filter(i => i.type === 'title' && inventory.includes(i.id)).map(i => i.value);
    
    const allTitles = [...new Set([...unlockedTitles, ...purchasedTitles])];

    // Add "No Title" option
    let html = `
        <button class="title-option w-full text-left p-3 rounded-lg border transition-colors ${!game.state.selectedTitle ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/50' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}" data-title="">
            <span class="font-bold text-gray-600 dark:text-gray-400">ไม่ใส่ฉายา</span>
        </button>
    `;

    allTitles.forEach(title => {
        const isSelected = game.state.selectedTitle === title;
        const activeClass = isSelected ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/50' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700';
        html += `
            <button class="title-option w-full text-left p-3 rounded-lg border transition-colors ${activeClass}" data-title="${title}">
                <span class="font-bold text-gray-800 dark:text-gray-200">《 ${title} 》</span>
            </button>
        `;
    });

    if (allTitles.length === 0) {
        html += `<p class="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">ปลดล็อกความสำเร็จเพื่อรับฉายาใหม่!</p>`;
    }

    grid.innerHTML = html;

    grid.querySelectorAll('.title-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const title = btn.dataset.title;
            game.equipTitle(title || null);
            renderUserInfo(game);
            modal.close();
            showToast('บันทึกสำเร็จ', title ? `เลือกฉายา "${title}" แล้ว` : 'ลบฉายาแล้ว', '🏷️');
        });
    });
}

function setupThemeSystem(game) {
    const themeModal = new ModalHandler('theme-modal');
    const editBtn = document.getElementById('edit-theme-btn');
    const grid = document.getElementById('theme-grid');

    if (editBtn) editBtn.addEventListener('click', () => {
        renderThemeGrid(game, grid, themeModal);
        themeModal.open();
    });
}

function renderThemeGrid(game, grid, modal) {
    if (!grid) return;
    const inventory = game.getInventory();
    const purchasedThemes = SHOP_ITEMS.filter(i => i.type === 'theme' && inventory.includes(i.id));
    
    let html = `
        <button class="theme-option w-full text-left p-3 rounded-lg border transition-colors ${!game.state.selectedTheme ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/50' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}" data-theme="">
            <span class="font-bold text-gray-800 dark:text-gray-200">🎨 ค่าเริ่มต้น (Default)</span>
        </button>
    `;

    purchasedThemes.forEach(item => {
        const isSelected = game.state.selectedTheme === item.value;
        const activeClass = isSelected ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/50' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700';
        html += `
            <button class="theme-option w-full text-left p-3 rounded-lg border transition-colors ${activeClass}" data-theme="${item.value}">
                <span class="font-bold text-gray-800 dark:text-gray-200">${item.icon} ${item.name}</span>
            </button>
        `;
    });

    grid.innerHTML = html;

    grid.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            game.equipTheme(theme || null);
            renderUserInfo(game);
            modal.close();
            showToast('บันทึกสำเร็จ', 'เปลี่ยนธีมเรียบร้อยแล้ว', '🎨');
        });
    });
}

function setupShopSystem(game) {
    const shopModal = new ModalHandler('shop-details-modal');
    const container = document.getElementById('shop-items-grid');
    const buyBtn = document.getElementById('shop-modal-buy-btn');
    
    // Elements in modal to update
    const iconEl = document.getElementById('shop-modal-icon');
    const titleEl = document.getElementById('shop-modal-title');
    const typeEl = document.getElementById('shop-modal-type');
    const descEl = document.getElementById('shop-modal-desc');
    const statusEl = document.getElementById('shop-modal-status');

    let currentItemId = null;

    if (container) {
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.shop-item-card');
            if (card) {
                const itemId = card.dataset.id;
                const item = SHOP_ITEMS.find(i => i.id === itemId);
                if (item) {
                    currentItemId = itemId;
                    
                    // Populate Modal
                    if (iconEl) iconEl.textContent = item.icon;
                    if (titleEl) titleEl.textContent = item.name;
                    if (typeEl) typeEl.textContent = item.type === 'avatar' ? 'Avatar' : (item.type === 'theme' ? 'Theme' : 'Title');
                    if (descEl) descEl.textContent = item.desc;
                    
                    const inventory = game.getInventory();
                    const isOwned = inventory.includes(item.id);
                    const canBuy = game.state.xp >= item.cost;
                    const isConsumable = item.type === 'consumable';
                    const quantity = isConsumable ? game.getItemCount(item.id) : 0;

                    if (isOwned && !isConsumable) {
                        buyBtn.disabled = true;
                        buyBtn.className = 'w-full py-3 rounded-xl text-white font-bold text-lg shadow-md bg-gray-400 cursor-not-allowed';
                        buyBtn.innerHTML = '<span>เป็นเจ้าของแล้ว</span>';
                        statusEl.textContent = 'คุณมีสินค้านี้แล้ว';
                        statusEl.className = 'mt-2 text-sm font-medium text-green-600 dark:text-green-400';
                        statusEl.classList.remove('hidden');
                    } else if (!canBuy) {
                        buyBtn.disabled = true;
                        buyBtn.className = 'w-full py-3 rounded-xl text-white font-bold text-lg shadow-md bg-gray-400 cursor-not-allowed';
                        buyBtn.innerHTML = `<span>XP ไม่พอ (${item.cost} XP)</span>`;
                        statusEl.textContent = `ต้องการอีก ${item.cost - game.state.xp} XP`;
                        statusEl.className = 'mt-2 text-sm font-medium text-red-500';
                        statusEl.classList.remove('hidden');
                    } else {
                        buyBtn.disabled = false;
                        buyBtn.className = 'w-full py-3 rounded-xl text-white font-bold text-lg shadow-md transition-transform transform hover:scale-105 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700';
                        buyBtn.innerHTML = `<span>ยืนยันการแลก</span> <span class="bg-white/20 px-2 py-0.5 rounded text-sm">${item.cost} XP</span>`;
                        
                        if (isConsumable) {
                            statusEl.textContent = `คุณมีอยู่แล้ว: ${quantity} ชิ้น`;
                            statusEl.className = 'mt-2 text-sm font-medium text-blue-600 dark:text-blue-400';
                            statusEl.classList.remove('hidden');
                        } else {
                            statusEl.classList.add('hidden');
                        }
                    }

                    shopModal.open();
                }
            }
        });
    }

    if (buyBtn) {
        buyBtn.addEventListener('click', () => {
            if (!currentItemId) return;
            
            const result = game.buyItem(currentItemId);
            if (result.success) {
                showToast('ซื้อสำเร็จ', result.message, '🛒');
                renderUserInfo(game);
                renderShop(game); // Re-render grid to update status
                shopModal.close();
            } else {
                showToast('ซื้อไม่สำเร็จ', result.message, '❌', 'error');
            }
        });
    }
}

function renderShop(game) {
    const container = document.getElementById('shop-items-grid');
    if (!container) return;

    const inventory = game.getInventory();

    container.innerHTML = SHOP_ITEMS.map(item => {
        const isOwned = inventory.includes(item.id);
        const canBuy = game.state.xp >= item.cost;
        const isConsumable = item.type === 'consumable';
        const quantity = isConsumable ? game.getItemCount(item.id) : 0;
        
        let statusClass = '';
        let statusText = `${item.cost} XP`;

        if (isOwned && !isConsumable) {
            statusClass = 'text-green-600 dark:text-green-400';
            statusText = '✓ เป็นเจ้าของแล้ว';
        } else if (isConsumable && quantity > 0) {
            statusClass = 'text-blue-600 dark:text-blue-400';
            statusText = `มีอยู่: ${quantity} | ${item.cost} XP`;
        } else if (!canBuy) {
            statusClass = 'text-red-500';
        } else {
            statusClass = 'text-blue-600 dark:text-blue-400';
        }

        return `
            <div class="shop-item-card bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center transition-all hover:shadow-md cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 group" data-id="${item.id}">
                <div class="text-4xl mb-3 transform group-hover:scale-110 transition-transform">${item.icon}</div>
                <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-1 text-sm">${item.name}</h4>
                <p class="text-xs font-bold ${statusClass}">${statusText}</p>
            </div>
        `;
    }).join('');
}

function renderTrackProgress(game) {
    const container = document.getElementById('track-progress-container');
    const physics = game.getPhysicsLevel();
    const earth = game.getEarthLevel();

    const createTrackHTML = (name, data, colorClass, icon) => `
        <div>
            <div class="flex justify-between items-end mb-1">
                <span class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    ${icon} ${name} <span class="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">Lv.${data.level}</span>
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">${data.currentXP} XP</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                <div class="${colorClass} h-4 rounded-full transition-all duration-1000 relative" style="width: ${data.progressPercent}%">
                    <div class="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                </div>
            </div>
            <p class="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">${data.title}</p>
        </div>
    `;

    container.innerHTML = 
        createTrackHTML('Physics Track', physics, 'bg-purple-500', '⚛️') +
        createTrackHTML('Earth Science Track', earth, 'bg-teal-500', '🌍');
}

function renderBadges(game) {
    const container = document.getElementById('profile-badges-grid');
    const earnedBadgeIds = game.state.badges;

    container.innerHTML = BADGES.map(badge => {
        const isEarned = earnedBadgeIds.includes(badge.id);
        const opacityClass = isEarned ? 'opacity-100' : 'opacity-40 grayscale';
        const borderClass = isEarned 
            ? (badge.tier === 'gold' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
                : badge.tier === 'silver' ? 'border-gray-400 bg-gray-50 dark:bg-gray-800' 
                : 'border-orange-400 bg-orange-50 dark:bg-orange-900/20')
            : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800';

        return `
            <div class="flex flex-col items-center p-3 rounded-xl border-2 ${borderClass} ${opacityClass} transition-all duration-300 hover:scale-105 relative group">
                <div class="text-3xl mb-2">${badge.icon}</div>
                <div class="text-xs font-bold text-center truncate w-full">${badge.name}</div>
                ${!isEarned ? '<div class="absolute inset-0 flex items-center justify-center"><span class="text-xs font-bold text-gray-500 bg-white/80 dark:bg-black/80 px-2 py-1 rounded">Locked</span></div>' : ''}
                
                <!-- Tooltip -->
                <div class="absolute bottom-full mb-2 hidden group-hover:block w-32 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-20 text-center pointer-events-none">
                    ${badge.desc}
                </div>
            </div>
        `;
    }).join('');
}

function renderAchievements(game) {
    const container = document.getElementById('profile-achievements-list');
    if (!container) return;

    const unlockedIds = game.state.unlockedAchievements || [];

    container.innerHTML = ACHIEVEMENTS.map(ach => {
        const isUnlocked = unlockedIds.includes(ach.id);
        const opacityClass = isUnlocked ? 'opacity-100' : 'opacity-50 grayscale';
        const bgClass = isUnlocked ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';

        return `
            <div class="flex items-center gap-3 p-3 rounded-lg border ${bgClass} ${opacityClass} transition-all">
                <div class="text-2xl flex-shrink-0">${ach.icon}</div>
                <div class="flex-grow min-w-0">
                    <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">${ach.title}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${ach.desc}</p>
                </div>
                ${isUnlocked ? '<span class="text-green-500 text-lg">✓</span>' : '<span class="text-xs text-gray-400">Locked</span>'}
            </div>
        `;
    }).join('');
}

function renderQuestHistory(game) {
    const container = document.getElementById('profile-quest-history');
    if (!container) return;

    const history = game.state.questHistory || [];

    if (history.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 text-sm py-4">ยังไม่มีประวัติการทำภารกิจ</p>`;
        return;
    }

    container.innerHTML = history.map(item => `
        <div class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded border border-gray-100 dark:border-gray-700">
            <div class="flex flex-col">
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">${item.desc}</span>
                <span class="text-[10px] text-gray-400">${item.date}</span>
            </div>
            <span class="text-xs font-bold text-green-600 dark:text-green-400">+${item.xp} XP</span>
        </div>
    `).join('');
}

async function renderRadarChart(game) {
    const ctx = document.getElementById('skills-radar-chart')?.getContext('2d');
    if (!ctx) return;
    const chartContainer = ctx.canvas.parentElement;
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js is not loaded. Skipping radar chart rendering.");
        return;
    }

    try {
        // 1. Fetch and Aggregate Data
        const allProgress = await getDetailedProgressForAllQuizzes();
    
        // Initialize stats based on new groups
        const stats = {};
        Object.keys(PROFICIENCY_GROUPS).forEach(key => {
            stats[key] = { correct: 0, total: 0, quizzes: new Set() };
        });
        stats['General'] = { correct: 0, total: 0, quizzes: new Set() }; // Fallback
    
        allProgress.forEach(quiz => {
            if (!quiz.userAnswers) return;

            quiz.userAnswers.forEach(ans => { 
                if (ans) {
                    // Determine sub-category string
                    let subCatStr = '';
                    if (ans.subCategory) {
                        if (typeof ans.subCategory === 'string') subCatStr = ans.subCategory;
                        else if (ans.subCategory.main) subCatStr = ans.subCategory.main;
                    }
                    
                    // Find matching group
                    let matchedGroup = 'General';
                    const matches = (text, keywords) => keywords.some(k => text.includes(k));

                    for (const [groupKey, groupDef] of Object.entries(PROFICIENCY_GROUPS)) {
                        if (matches(subCatStr, groupDef.keywords)) {
                            matchedGroup = groupKey;
                            break;
                        }
                    }

                    stats[matchedGroup].total++;
                    if (ans.isCorrect) stats[matchedGroup].correct++;
                    stats[matchedGroup].quizzes.add(quiz);
                }
            });
        });

        // 2. Calculate Percentages 
        const labels = Object.values(PROFICIENCY_GROUPS).map(g => g.label);
        const dataPoints = Object.keys(PROFICIENCY_GROUPS).map(key => {
            const s = stats[key];
            return s.total > 0 ? (s.correct / s.total) * 100 : 0;
        });

        // 3. Render Chart 
        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDark ? '#e5e7eb' : '#374151';

        // Determine colors based on theme
        const currentTheme = game?.state?.selectedTheme;
        const themeColors = THEME_COLORS[currentTheme] || THEME_COLORS['default'];

        // Destroy existing chart if it exists (Chart.js doesn't automatically replace)
        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        new Chart(ctx, { 
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'ความถนัด (%)',
                    data: dataPoints,
                    fill: true,
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                pointBackgroundColor: themeColors.point,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: themeColors.border
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: gridColor },
                        grid: { color: gridColor },
                        pointLabels: {
                            color: textColor,
                            font: { family: "'Kanit', sans-serif", size: 11 }
                        },
                        ticks: {
                            display: false, // Hide scale numbers for cleaner look
                            backdropColor: 'transparent'
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const key = Object.keys(PROFICIENCY_GROUPS)[context.dataIndex];
                                const s = stats[key];
                                return `${context.label}: ${context.raw.toFixed(1)}% (${s.correct}/${s.total})`;
                            }
                        }
                    }
                }
            }
        });    
    } catch (error) {
        console.error("Failed to render radar chart:", error);
        if (chartContainer) {
            chartContainer.innerHTML = `<p class="text-center text-sm text-red-500">ไม่สามารถโหลดข้อมูลสำหรับแผนภูมิได้</p>`;
        }
    }
}

function showProficiencyDetails(label, data) {
    const modal = new ModalHandler('proficiency-modal');
    const titleEl = document.getElementById('proficiency-modal-title');
    const contentEl = document.getElementById('proficiency-modal-content');
    
    if (titleEl) titleEl.textContent = `รายการข้อสอบ: ${label}`;
    
    if (contentEl) {
        if (data.quizzes.size === 0) {
            contentEl.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 py-4">ยังไม่มีประวัติการทำข้อสอบในหมวดหมู่นี้</p>';
        } else {
            const quizzes = Array.from(data.quizzes).sort((a, b) => (b.lastAttemptTimestamp || 0) - (a.lastAttemptTimestamp || 0));
            contentEl.innerHTML = quizzes.map(quiz => {
                // Calculate score for this specific quiz
                const score = quiz.score || 0;
                const total = quiz.shuffledQuestions ? quiz.shuffledQuestions.length : (quiz.amount || 0);
                const percent = total > 0 ? Math.round((score / total) * 100) : 0;
                const date = quiz.lastAttemptTimestamp ? new Date(quiz.lastAttemptTimestamp).toLocaleDateString('th-TH') : 'ไม่ระบุ';
                
                // Determine URL
                let quizUrl = quiz.url;
                if (!quizUrl && (quiz.id || quiz.customId)) {
                    quizUrl = `./quiz/index.html?id=${quiz.id || quiz.customId}`;
                }

                let scoreClass = 'text-red-500';
                if (percent >= 80) scoreClass = 'text-green-500';
                else if (percent >= 50) scoreClass = 'text-yellow-500';

                return `
                    <a href="${quizUrl || '#'}" class="block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">${quiz.title}</h4>
                            <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">${date}</span>
                        </div>
                        <div class="flex justify-between items-center mt-2">
                            <span class="text-xs text-gray-500 dark:text-gray-400">${quiz.category || 'ทั่วไป'}</span>
                            <span class="text-sm font-bold ${scoreClass}">${score}/${total} (${percent}%)</span>
                        </div>
                    </a>
                `;
            }).join('');
        }
    }
    
    modal.open();
}

async function renderProficiencyHistoryChart(game) {
    const ctx = document.getElementById('proficiency-history-chart')?.getContext('2d');
    if (!ctx) return;

    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js is not loaded. Skipping history chart rendering.");
        return;
    }

    try {
        const allProgress = await getDetailedProgressForAllQuizzes();
        
        // Prepare data structure: { 'Mechanics': [{date, score}, ...], ... }
        const historyData = {};
        Object.keys(PROFICIENCY_GROUPS).forEach(key => {
            historyData[key] = [];
        });

        // Process all quizzes
        allProgress.forEach(quiz => {
            if (!quiz.userAnswers || !quiz.lastAttemptTimestamp) return;

            // Determine which group this quiz belongs to
            // We use the first answer's subcategory or quiz category to match keywords
            let matchedGroup = null;
            const firstAnswer = quiz.userAnswers.find(a => a);
            
            let searchString = quiz.category || '';
            if (firstAnswer && firstAnswer.subCategory) {
                if (typeof firstAnswer.subCategory === 'string') searchString += ' ' + firstAnswer.subCategory;
                else if (firstAnswer.subCategory.main) searchString += ' ' + firstAnswer.subCategory.main;
            }

            const matches = (text, keywords) => keywords.some(k => text.includes(k));

            for (const [groupKey, groupDef] of Object.entries(PROFICIENCY_GROUPS)) {
                if (matches(searchString, groupDef.keywords)) {
                    matchedGroup = groupKey;
                    break;
                }
            }

            if (matchedGroup) {
                const score = quiz.score || 0;
                const total = quiz.shuffledQuestions ? quiz.shuffledQuestions.length : (quiz.amount || 0);
                const percentage = total > 0 ? (score / total) * 100 : 0;
                
                historyData[matchedGroup].push({
                    x: new Date(quiz.lastAttemptTimestamp),
                    y: percentage,
                    title: quiz.title
                });
            }
        });

        // Sort data by date
        Object.keys(historyData).forEach(key => {
            historyData[key].sort((a, b) => a.x - b.x);
        });

        // Create Datasets
        const datasets = Object.keys(PROFICIENCY_GROUPS).map((key, index) => {
            const group = PROFICIENCY_GROUPS[key];
            const data = historyData[key];
            
            // Generate a color for this line (using HSL for distinct colors)
            const hue = (index * 360 / Object.keys(PROFICIENCY_GROUPS).length) % 360;
            const color = `hsla(${hue}, 70%, 50%, 1)`;
            const bg = `hsla(${hue}, 70%, 50%, 0.1)`;

            return {
                label: group.label,
                data: data,
                borderColor: color,
                backgroundColor: bg,
                borderWidth: 2,
                tension: 0.3, // Smooth lines
                pointRadius: 3,
                pointHoverRadius: 5,
                hidden: data.length === 0 // Hide empty datasets by default
            };
        }).filter(ds => ds.data.length > 0); // Only show groups with data

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        // Destroy existing chart if it exists to prevent canvas reuse errors
        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: { day: 'd MMM' },
                            tooltipFormat: 'd MMM yyyy HH:mm'
                        },
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: gridColor },
                        ticks: { color: textColor, callback: v => v + '%' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: textColor, font: { family: "'Kanit', sans-serif" } }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.y.toFixed(1)}% (${ctx.raw.title})`
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });

    } catch (error) {
        console.error("Failed to render history chart:", error);
    }
}

async function renderStrengthsWeaknesses() {
    const strengthsList = document.getElementById('strengths-list');
    const weaknessesList = document.getElementById('weaknesses-list');

    if (!strengthsList || !weaknessesList) return;

    try {
        const { strengths, weaknesses } = await calculateStrengthsAndWeaknesses();

        if (strengths.length > 0) {
            strengthsList.innerHTML = strengths.map(s => `
                <li class="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800/30 flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate mr-2" title="${s.name}">${s.name}</span>
                    <span class="text-xs font-bold text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-sm">${s.percentage.toFixed(0)}%</span>
                </li>
            `).join('');
        } else {
            strengthsList.innerHTML = `<li class="text-sm text-gray-500 dark:text-gray-400 italic">ยังไม่มีข้อมูลเพียงพอ</li>`;
        }

        if (weaknesses.length > 0) { 
            weaknessesList.innerHTML = weaknesses.map(w => `
                <li class="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-100 dark:border-yellow-800/30 flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate mr-2" title="${w.name}">${w.name}</span>
                    <span class="text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-sm">${w.percentage.toFixed(0)}%</span>
                </li>
            `).join('');
        } else {
            weaknessesList.innerHTML = `<li class="text-sm text-gray-500 dark:text-gray-400 italic">ยังไม่มีข้อมูลเพียงพอ</li>`;
        }
    } catch (error) {
        console.error("Failed to render strengths and weaknesses:", error);
        if (strengthsList) strengthsList.innerHTML = `<li class="text-sm text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</li>`;
        if (weaknessesList) weaknessesList.innerHTML = `<li class="text-sm text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</li>`;
    }
}