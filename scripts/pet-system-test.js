import { PixelPetRenderer } from './pixel-pet-renderer.js';
// เราจะคัดลอกค่าคงที่และ Logic ที่จำเป็นมาจาก gamification.js
// เพื่อให้หน้าทดสอบนี้ทำงานได้ด้วยตัวเองและไม่ขึ้นกับส่วนอื่นๆ ที่ซับซ้อน

// --- ส่วนที่คัดลอกมาจาก gamification.js ---
const PET_TYPES = {
    'dog': { id: 'dog', name: 'สุนัข', icon: '🐶', stages: ['egg', 'dog_baby', 'dog_adult'] },
    'cat': { id: 'cat', name: 'แมว', icon: '😺', stages: ['egg', 'cat_baby', 'cat_adult'] },
    'dragon': { id: 'dragon', name: 'มังกร', icon: '🐉', stages: ['egg', 'dragon_baby', 'dragon_adult'] },
    'dog_physics': { id: 'dog_physics', name: 'Robo-Dog', icon: '🤖', stages: ['egg', 'dog_baby', 'dog_physics'] },
    'dog_earth': { id: 'dog_earth', name: 'Gaia Dog', icon: '🌿', stages: ['egg', 'dog_baby', 'dog_earth'] },
    'cat_physics': { id: 'cat_physics', name: 'Quantum Cat', icon: '⚛️', stages: ['egg', 'cat_baby', 'cat_physics'] },
    'cat_earth': { id: 'cat_earth', name: 'Geo Cat', icon: '🍄', stages: ['egg', 'cat_baby', 'cat_earth'] },
    'dragon_physics': { id: 'dragon_physics', name: 'Mecha Dragon', icon: '🚀', stages: ['egg', 'dragon_baby', 'dragon_physics'] },
    'dragon_earth': { id: 'dragon_earth', name: 'Elder Dragon', icon: '🏔️', stages: ['egg', 'dragon_baby', 'dragon_earth'] }
};

const PET_LEVELS = [
    { level: 1, xp: 0, stage: 0 },      // Egg
    { level: 2, xp: 500, stage: 1 },   // Baby
    { level: 3, xp: 1500, stage: 1 },
    { level: 4, xp: 3000, stage: 2 },  // Adult
    { level: 5, xp: 5000, stage: 2 },
    { level: 6, xp: 7500, stage: 2 },
    { level: 7, xp: 10000, stage: 2 },
    { level: 8, xp: 15000, stage: 2 },
    { level: 9, xp: 22000, stage: 2 },
    { level: 10, xp: 30000, stage: 2 },
];
// --- จบส่วนที่คัดลอก ---

// ระบบจัดการ State ของสัตว์เลี้ยงแบบง่ายๆ สำหรับหน้าทดสอบนี้โดยเฉพาะ
const petState = {
    data: {
        type: 'dog',
        name: 'เพื่อนซี้สี่ขา',
        xp: 0,
        level: 1,
        stageIndex: 0
    },
    load() {
        const saved = localStorage.getItem('pet_test_state_v2');
        if (saved) {
            this.data = JSON.parse(saved);
        }
    },
    save() {
        localStorage.setItem('pet_test_state_v2', JSON.stringify(this.data));
    },
    reset() {
        this.data.xp = 0;
        this.data.level = 1;
        this.data.stageIndex = 0;
        this.save();
    }
};

// --- ฟังก์ชัน Logic ที่ปรับปรุงมาจาก gamification.js ---
function levelUpPet() {
    let newLevelData = null;
    for (const levelData of PET_LEVELS) {
        if (petState.data.xp >= levelData.xp) {
            newLevelData = levelData;
        } else {
            break;
        }
    }

    if (newLevelData && newLevelData.level > petState.data.level) {
        console.log(`Pet leveled up! ${petState.data.level} -> ${newLevelData.level}`);
        petState.data.level = newLevelData.level;
        petState.data.stageIndex = newLevelData.stage;
        petState.save();

        // Simulate Branching at Level 4
        if (petState.data.level === 4) {
            const baseType = petState.data.type.split('_')[0];
            if (['dog', 'cat', 'dragon'].includes(baseType)) {
                // Randomly evolve for testing purposes
                const evolveType = Math.random() > 0.5 ? 'physics' : 'earth';
                const newType = `${baseType}_${evolveType}`;
                if (PET_TYPES[newType]) {
                    console.log(`[TEST] Evolving to ${newType}`);
                    petState.data.type = newType;
                }
            }
        }
        return true;
    }
    return false;
}

function getPetInfo() {
    const petData = PET_TYPES[petState.data.type];
    if (!petData) return null;

    const currentLevelData = PET_LEVELS.find(l => l.level === petState.data.level) || PET_LEVELS[0];
    const nextLevelData = PET_LEVELS.find(l => l.level === petState.data.level + 1);

    const xpForThisLevel = petState.data.xp - currentLevelData.xp;
    const xpNeededForNextLevel = nextLevelData ? (nextLevelData.xp - currentLevelData.xp) : 0;
    const progressPercent = xpNeededForNextLevel > 0 ? (xpForThisLevel / xpNeededForNextLevel) * 100 : 100;

    return {
        ...petState.data,
        spriteName: petData.stages[petState.data.stageIndex],
        icon: petData.icon,
        progressPercent: Math.min(100, progressPercent),
        currentLevelBaseXP: currentLevelData.xp,
        nextLevelXP: nextLevelData ? nextLevelData.xp : petState.data.xp
    };
}

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', () => {
    petState.load();

    const renderer = new PixelPetRenderer('gamification-pet-canvas');
    const legacyRenderer = new PixelPetRenderer('pet-canvas'); // For the old display

    const petSelect = document.getElementById('pet-select');
    const addXpBtn = document.getElementById('add-xp-btn');
    const resetBtn = document.getElementById('reset-pet-btn');
    const feedBtn = document.getElementById('feed-pet-btn');

    // UI Elements for New Profile Card
    const petNameEl = document.getElementById('gamification-pet-name');
    const petLevelEl = document.getElementById('gamification-pet-level');
    const petXpBarEl = document.getElementById('gamification-pet-xp-bar');
    const petCurrentXpEl = document.getElementById('gamification-pet-current-xp');
    const petNextXpEl = document.getElementById('gamification-pet-next-xp');

    // Legacy UI elements
    const legacyNameEl = document.getElementById('pet-display-name');
    const legacyLevelEl = document.getElementById('pet-display-level');
    const legacyXpEl = document.getElementById('pet-display-xp');
    const legacyNextXpEl = document.getElementById('pet-display-next-xp');
    const legacyXpBarEl = document.getElementById('pet-display-xp-bar');

    function renderAll() {
        const petInfo = getPetInfo();
        if (!petInfo) return;

        // Update Renderers
        renderer.setPet(petInfo.type, petInfo.stageIndex);
        legacyRenderer.setPet(petInfo.type, petInfo.stageIndex);

        // Update New Profile Card UI
        petNameEl.textContent = petInfo.name;
        petLevelEl.textContent = `Lv.${petInfo.level}`;
        petCurrentXpEl.textContent = petInfo.xp.toLocaleString();
        petNextXpEl.textContent = petInfo.nextLevelXP.toLocaleString();
        petXpBarEl.style.width = `${petInfo.progressPercent}%`;

        // Update Legacy UI
        legacyNameEl.textContent = petInfo.name;
        legacyLevelEl.textContent = petInfo.level;
        legacyXpEl.textContent = petInfo.xp.toLocaleString();
        legacyNextXpEl.textContent = petInfo.nextLevelXP.toLocaleString();
        const legacyProgress = petInfo.nextLevelXP > petInfo.currentLevelBaseXP ? ((petInfo.xp - petInfo.currentLevelBaseXP) / (petInfo.nextLevelXP - petInfo.currentLevelBaseXP)) * 100 : 100;
        legacyXpBarEl.style.width = `${Math.min(100, legacyProgress)}%`;
    }

    function populatePetSelector() {
        Object.values(PET_TYPES).forEach(petType => {
            const option = document.createElement('option');
            option.value = petType.id;
            option.textContent = `${petType.icon} ${petType.name}`;
            petSelect.appendChild(option);
        });
        petSelect.value = petState.data.type;
    }

    // --- Event Listeners ---
    addXpBtn.addEventListener('click', () => {
        petState.data.xp += 150; // Add 150 XP for testing
        if (levelUpPet()) {
            renderer.playAnimation('happy', 1200);
            legacyRenderer.playAnimation('happy', 1200);
        }
        petState.save();
        renderAll();
    });

    resetBtn.addEventListener('click', () => {
        petState.reset();
        renderAll();
        renderer.playAnimation('shock', 800);
        legacyRenderer.playAnimation('shock', 800);
    });

    petSelect.addEventListener('change', (e) => {
        const newType = e.target.value;
        if (petState.data.type !== newType) {
            petState.data.type = newType;
            petState.reset();
            renderAll();
        }
    });

    feedBtn?.addEventListener('click', () => {
        renderer.playAnimation('eat', 2000);
        legacyRenderer.playAnimation('eat', 2000);
    });

    document.getElementById('gamification-pet-canvas')?.addEventListener('click', () => {
        renderer.playAnimation('interact', 500);
    });
    document.getElementById('pet-canvas')?.addEventListener('click', () => {
        legacyRenderer.playAnimation('interact', 500);
    });

    // --- Initial Load ---
    populatePetSelector();
    renderAll();
});
