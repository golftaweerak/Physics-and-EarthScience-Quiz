import { PixelPetRenderer } from './pixel-pet-renderer.js';

// Data definitions (can be moved to gamification.js later)
const PET_TYPES = {
    'dog': { id: 'dog', name: 'สุนัข', icon: '🐶', stages: ['🥚', '🐾', '🐕'] },
    'cat': { id: 'cat', name: 'แมว', icon: '😺', stages: ['🥚', '🐾', '🐈'] },
    'dragon': { id: 'dragon', name: 'มังกร', icon: '🐉', stages: ['🥚', '🔥', '🐲'] }
};

const PET_LEVELS = [
    { level: 1, xp: 0, stage: 0 },      // Egg
    { level: 2, xp: 500, stage: 1 },   // Baby
    { level: 3, xp: 1500, stage: 1 },
    { level: 4, xp: 3000, stage: 2 },  // Adult
    { level: 5, xp: 5000, stage: 2 },
];

class Pet {
    constructor(type = 'dog', name = 'My Pet') {
        this.type = type;
        this.name = name;
        this.xp = 0;
        this.level = 1;
        this.stageIndex = 0; // 0: egg, 1: baby, 2: adult
        
        // NEW: Initialize the renderer
        this.renderer = new PixelPetRenderer('pet-canvas');
        this.lastLevel = 1;

        this.loadState();
        this.render();

        // NEW: Add interaction listener
        document.getElementById('pet-canvas')?.addEventListener('click', () => {
            this.renderer.playAnimation('interact', 500);
        });
    }

    addXP(amount) {
        this.xp += amount;
        console.log(`Added ${amount} XP. Total Pet XP: ${this.xp}`);
        this.levelUpCheck();
        this.saveState();
        this.render();
    }

    levelUpCheck() {
        let newLevelData = null;
        for (const levelData of PET_LEVELS) {
            if (this.xp >= levelData.xp) {
                newLevelData = levelData;
            } else {
                break;
            }
        }

        if (newLevelData && newLevelData.level > this.level) {
            console.log(`Level Up! ${this.level} -> ${newLevelData.level}`);
            this.level = newLevelData.level;
            this.stageIndex = newLevelData.stage;
            
            if (this.level > this.lastLevel) {
                setTimeout(() => {
                    this.renderer.playAnimation('happy', 1200);
                }, 200); // Timeout to allow sprite to change
                this.lastLevel = this.level;
            }
        }
    }

    getCurrentStageIcon() {
        const petData = PET_TYPES[this.type];
        if (!petData) return '❓';
        return petData.stages[this.stageIndex] || petData.stages[petData.stages.length - 1];
    }

    getNextLevelXP() {
        const nextLevelData = PET_LEVELS.find(l => l.level === this.level + 1);
        return nextLevelData ? nextLevelData.xp : this.xp;
    }
    
    getCurrentLevelXP() {
        const currentLevelData = PET_LEVELS.find(l => l.level === this.level);
        return currentLevelData ? currentLevelData.xp : 0;
    }

    render() {
        // NEW: Update the renderer
        this.renderer.setPet(this.type, this.stageIndex);

        document.getElementById('pet-display-name').textContent = this.name;
        document.getElementById('pet-display-level').textContent = this.level;
        document.getElementById('pet-display-xp').textContent = this.xp.toLocaleString();
        
        const nextXP = this.getNextLevelXP();
        const currentLevelXP = this.getCurrentLevelXP();
        
        document.getElementById('pet-display-next-xp').textContent = nextXP.toLocaleString();

        const xpForThisLevel = this.xp - currentLevelXP;
        const xpNeededForNextLevel = nextXP - currentLevelXP;
        
        const progressPercent = xpNeededForNextLevel > 0 ? (xpForThisLevel / xpNeededForNextLevel) * 100 : 100;
        document.getElementById('pet-display-xp-bar').style.width = `${Math.min(100, progressPercent)}%`;
    }

    saveState() {
        const state = {
            type: this.type,
            name: this.name,
            xp: this.xp,
            level: this.level,
            stageIndex: this.stageIndex,
            lastLevel: this.lastLevel
        };
        localStorage.setItem('pet_test_state', JSON.stringify(state));
    }

    loadState() {
        const savedState = localStorage.getItem('pet_test_state');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.type = state.type || this.type;
            this.name = state.name || this.name;
            this.xp = state.xp || 0;
            this.level = state.level || 1;
            this.stageIndex = state.stageIndex || 0;
            this.lastLevel = state.lastLevel || 1;
        }
    }

    reset() {
        localStorage.removeItem('pet_test_state');
        // Re-initialize with defaults
        this.name = 'My Pet';
        this.xp = 0; // Start at Level 1 (Egg)
        this.level = 1;
        this.stageIndex = 0;
        this.lastLevel = 1;
        this.render();
    }
    
    changeType(newType) {
        if (PET_TYPES[newType]) {
            this.type = newType;
            this.reset(); // Reset progress when changing pet type
        }
    }
}

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', () => {
    const petSelect = document.getElementById('pet-select');
    
    // Populate dropdown
    Object.values(PET_TYPES).forEach(petType => {
        const option = document.createElement('option');
        option.value = petType.id;
        option.textContent = `${petType.icon} ${petType.name}`;
        petSelect.appendChild(option);
    });

    let myPet = new Pet();
    petSelect.value = myPet.type;

    document.getElementById('add-xp-btn').addEventListener('click', () => {
        myPet.addXP(150);
    });

    document.getElementById('feed-pet-btn')?.addEventListener('click', () => {
        myPet.renderer.playAnimation('eat', 2000);
    });

    document.getElementById('reset-pet-btn').addEventListener('click', () => {
        myPet.reset();
        petSelect.value = myPet.type;
    });
    
    petSelect.addEventListener('change', (e) => {
        myPet.changeType(e.target.value);
    });
});
