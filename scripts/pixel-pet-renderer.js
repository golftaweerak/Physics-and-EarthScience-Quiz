/**
 * PixelPetRenderer - คลาสสำหรับเรนเดอร์สัตว์เลี้ยง 2D Pixel Art สไตล์ Kawaii / Tamagotchi
 * บน HTML5 Canvas ด้วยสีสดใส สัดส่วน Chibi น่ารัก และ Animation ขยับได้สมจริง
 */
export class PixelPetRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`PixelPetRenderer: Canvas with id "${canvasId}" not found.`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');

        // --- State ---
        this.frameCount = 0;
        this.particles = []; // Store active particles (hearts & stars)
        
        this.lastFrameTime = 0;
        this.mood = 'normal'; // internal animation state: normal, happy, shock, sleep
        this.baseMood = 'normal'; // external state from game logic
        this.animationState = 'idle'; // 'idle', 'interact', 'happy', 'eat'
        this.animationTimer = 0;
        this.animationDuration = 0;
        this.shouldSpawnHearts = false;
        this.animationFrameId = null;

        // --- Pet Properties ---
        this.petType = 'dog';
        this.stage = 0; // 0: ไข่, 1: วัยเด็ก, 2: ตัวเต็มวัย
        this.walkOffset = 0;
        this.eatDirection = 1;
        this.eatPhase = 'none';
        this.speechBubble = null;

        // --- Physics & Kawaii Modifiers ---
        this.blinkTimer = 0;
        this.isBlinking = false;

        // Palette definitions (Kawaii Pastel Style)
        this.palettes = {
            'dog': {
                outline: '#2D1E18', main: '#FFA726', shadow: '#E65100',
                light: '#FFF3E0', white: '#FFFFFF', nose: '#5D4037',
                cheek: '#FF8A80', eye: '#3E2723', innerEar: '#FF8A80'
            },
            'cat': { 
                outline: '#2D1E18', main: '#FFB74D', shadow: '#F57C00',
                light: '#FFF3E0', white: '#FFFFFF', nose: '#FF8A80',
                cheek: '#FF80AB', eye: '#1B5E20', innerEar: '#FF8A80'
            },
            'dragon': { 
                outline: '#1B4D3E', main: '#4DB6AC', shadow: '#00796B',
                light: '#E0F2F1', white: '#FFFFFF', nose: '#80CBC4',
                cheek: '#FF8A80', eye: '#004D40', horn: '#FFF176', wing: '#CE93D8'
            },
            'egg': { 
                outline: '#455A64', main: '#FFFDE7', shadow: '#CFD8DC',
                light: '#FFFFFF', white: '#FFFFFF', spot: '#F8BBD0',
                cheek: '#FF8A80', eye: '#263238', bow: '#FF4081'
            },
            // Evolved Sci-Fi / Nature Palettes
            'physics': { 
                outline: '#1A237E', main: '#90CAF9', shadow: '#1565C0',
                light: '#E3F2FD', white: '#FFFFFF', nose: '#FF4081',
                cheek: '#80DEEA', eye: '#00E5FF', visor: '#00E5FF'
            },
            'earth': { 
                outline: '#1B5E20', main: '#8D6E63', shadow: '#4E342E',
                light: '#D7CCC8', white: '#DCEDC8', nose: '#5D4037',
                cheek: '#FF8A80', eye: '#33691E', leaf: '#76FF03'
            },
            // Fun Bonus Types
            'clippy': {
                outline: '#263238', main: '#CFD8DC', shadow: '#90A4AE',
                light: '#ECEFF1', white: '#FFFFFF', nose: '#37474F',
                cheek: '#FF8A80', eye: '#111111'
            },
            'snake': {
                outline: '#1B5E20', main: '#9CCC65', shadow: '#558B2F',
                light: '#DCEDC8', white: '#FFFFFF', nose: '#FF1744',
                cheek: '#FF8A80', eye: '#1B5E20'
            },
            'duck': {
                outline: '#E65100', main: '#FFEE58', shadow: '#FBC02D',
                light: '#FFFDE7', white: '#FFFFFF', nose: '#FF9800',
                cheek: '#FF8A80', eye: '#212121'
            }
        };

        if (this.canvas) {
            this.resize();
            this.resizeHandler = () => this.resize();
            window.addEventListener('resize', this.resizeHandler);
            this.startLoop();
        }
    }

    destroy() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    setBaseMood(mood) {
        this.baseMood = mood || 'normal';
    }

    _drawRect(x, y, w, h, color) {
        if (!color) return;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
    }

    // --- Kawaii Helper Drawing Methods ---
    _drawKawaiiEyes(hx, ey, spacing, C) {
        const isBlinking = this.isBlinking && this.mood === 'normal';

        if (this.mood === 'sleep') {
            // Sleeping eyes ^ ^
            this._drawRect(hx + 8, ey + 4, 6, 2, C.outline);
            this._drawRect(hx + 8 + spacing, ey + 4, 6, 2, C.outline);
        } else if (this.mood === 'happy') {
            // Happy winking eyes ^ ^
            this._drawRect(hx + 8, ey + 2, 6, 2, C.outline);
            this._drawRect(hx + 10, ey, 2, 2, C.outline);
            this._drawRect(hx + 8 + spacing, ey + 2, 6, 2, C.outline);
            this._drawRect(hx + 10 + spacing, ey, 2, 2, C.outline);
        } else if (this.mood === 'shock') {
            // Shocked wide eyes O O
            this._drawRect(hx + 7, ey, 8, 8, C.white);
            this._drawRect(hx + 7 + spacing, ey, 8, 8, C.white);
            this._drawRect(hx + 7, ey, 8, 1, C.outline);
            this._drawRect(hx + 7, ey + 7, 8, 1, C.outline);
            this._drawRect(hx + 7, ey, 1, 8, C.outline);
            this._drawRect(hx + 14, ey, 1, 8, C.outline);

            this._drawRect(hx + 7 + spacing, ey, 8, 1, C.outline);
            this._drawRect(hx + 7 + spacing, ey + 7, 8, 1, C.outline);
            this._drawRect(hx + 7 + spacing, ey, 1, 8, C.outline);
            this._drawRect(hx + 14 + spacing, ey, 1, 8, C.outline);

            this._drawRect(hx + 10, ey + 3, 3, 3, C.eye);
            this._drawRect(hx + 10 + spacing, ey + 3, 3, 3, C.eye);
        } else if (isBlinking) {
            // Blink closed eyes - -
            this._drawRect(hx + 8, ey + 4, 6, 2, C.outline);
            this._drawRect(hx + 8 + spacing, ey + 4, 6, 2, C.outline);
        } else {
            // Big Kawaii Glossy Eyes with Catchlights
            let ex1 = hx + 8;
            let ex2 = hx + 8 + spacing;

            // Left Eye
            this._drawRect(ex1 + 1, ey, 5, 8, C.eye);
            this._drawRect(ex1, ey + 1, 7, 6, C.eye);
            this._drawRect(ex1 + 4, ey + 1, 2, 2, C.white); // Top-right catchlight
            this._drawRect(ex1 + 2, ey + 5, 1, 1, C.white); // Bottom-left small catchlight

            // Right Eye
            this._drawRect(ex2 + 1, ey, 5, 8, C.eye);
            this._drawRect(ex2, ey + 1, 7, 6, C.eye);
            this._drawRect(ex2 + 4, ey + 1, 2, 2, C.white); // Top-right catchlight
            this._drawRect(ex2 + 2, ey + 5, 1, 1, C.white); // Bottom-left small catchlight
        }
    }

    _drawRosyCheeks(hx, hy, spacing, C) {
        // Cute glowing blush under eyes
        this._drawRect(hx + 4, hy + 20, 5, 3, C.cheek || '#FF8A80');
        this._drawRect(hx + 5 + spacing, hy + 20, 5, 3, C.cheek || '#FF8A80');
    }

    _drawEgg(ctx, palette) {
        const x = 4, y = 8;
        const C = palette;

        // Egg Outline & Body (Cute rounded egg shape)
        this._drawRect(x + 6, y, 12, 2, C.outline);
        this._drawRect(x + 4, y + 2, 16, 2, C.outline);
        this._drawRect(x + 2, y + 4, 20, 20, C.main);
        this._drawRect(x + 4, y + 2, 16, 24, C.main);
        this._drawRect(x + 6, y, 12, 28, C.main);

        // Outline Edges
        this._drawRect(x + 2, y + 4, 2, 20, C.outline);
        this._drawRect(x + 20, y + 4, 2, 20, C.outline);
        this._drawRect(x + 4, y + 24, 16, 2, C.outline);
        this._drawRect(x + 6, y + 26, 12, 2, C.outline);

        // Highlight
        this._drawRect(x + 6, y + 4, 4, 4, C.light);

        // Spots & Ribbon
        this._drawRect(x + 14, y + 8, 4, 4, C.spot);
        this._drawRect(x + 6, y + 18, 5, 5, C.spot);
        this._drawRect(x + 16, y + 20, 3, 3, C.spot);

        // Cute Ribbon Bow on Top
        this._drawRect(x + 9, y - 4, 6, 4, C.bow);
        this._drawRect(x + 6, y - 3, 3, 3, C.bow);
        this._drawRect(x + 15, y - 3, 3, 3, C.bow);

        // Kawaii Face on Egg!
        this._drawKawaiiEyes(x + 2, y + 10, 10, C);
        this._drawRosyCheeks(x + 2, y + 2, 10, C);
        
        // Cute Mouth
        this._drawRect(x + 11, y + 18, 2, 1, C.outline);
    }

    _drawChibiBody(ctx, C, bodyY) {
        const x = 4;
        // Chubby Body (Overlaps head for cute neckless Chibi look)
        this._drawRect(x + 2, bodyY + 2, 20, 14, C.main);
        this._drawRect(x + 4, bodyY, 16, 18, C.main);
        this._drawRect(x + 2, bodyY + 2, 20, 14, C.outline); // Body outline
        this._drawRect(x + 3, bodyY + 1, 18, 16, C.main);

        // Soft Belly Patch
        this._drawRect(x + 7, bodyY + 4, 10, 10, C.light || C.white);

        // Cute Chubby Paws
        this._drawRect(x + 4, bodyY + 12, 5, 5, C.outline);
        this._drawRect(x + 15, bodyY + 12, 5, 5, C.outline);
        this._drawRect(x + 5, bodyY + 13, 3, 3, C.light || C.white);
        this._drawRect(x + 16, bodyY + 13, 3, 3, C.light || C.white);
    }

    _drawDog(ctx, palette, stage, variant) {
        const x = 0, y = 0;
        const C = palette;
        const isBaby = stage < 2;
        const headY = y;
        const bodyY = isBaby ? y + 18 : y + 20;

        // 1. Wagging Tail (behind body)
        let tailWag = Math.sin(this.frameCount * 0.25) * 4;
        if (this.mood === 'happy') tailWag *= 2;
        this._drawRect(x + 22 + tailWag, bodyY + 2, 5, 12, C.outline);
        this._drawRect(x + 23 + tailWag, bodyY + 3, 3, 10, C.main);
        this._drawRect(x + 23 + tailWag, bodyY + 1, 3, 3, C.white); // White Tail Tip

        // 2. Chubby Body (drawn first, head will sit on top)
        this._drawChibiBody(ctx, C, bodyY);

        // 3. Kawaii Big Head (overlaps body to eliminate neck gap)
        let hx = x - 4;
        let hy = headY + 2;
        let hw = 40;
        let hh = 26;

        // Floppy Cute Ears
        const earTwitch = Math.sin(this.frameCount * 0.1) * 2;
        this._drawRect(hx - 2, hy + 2 + earTwitch, 6, 12, C.outline);
        this._drawRect(hx - 1, hy + 3 + earTwitch, 4, 10, C.shadow);
        this._drawRect(hx, hy + 5 + earTwitch, 2, 6, C.innerEar);

        this._drawRect(hx + 36, hy + 2 - earTwitch, 6, 12, C.outline);
        this._drawRect(hx + 37, hy + 3 - earTwitch, 4, 10, C.shadow);
        this._drawRect(hx + 38, hy + 5 - earTwitch, 2, 6, C.innerEar);

        // Head Shape & Fill
        this._drawRect(hx + 4, hy, hw - 8, hh, C.main);
        this._drawRect(hx + 2, hy + 2, hw - 4, hh - 4, C.main);
        this._drawRect(hx, hy + 4, hw, hh - 8, C.main);

        // Head Top/Side Outline ONLY (bottom merges into body)
        this._drawRect(hx + 4, hy, hw - 8, 1, C.outline);
        this._drawRect(hx, hy + 4, 1, hh - 8, C.outline);
        this._drawRect(hx + hw - 1, hy + 4, 1, hh - 8, C.outline);

        // Sci-Fi Variant Visor/Antenna
        if (variant === 'physics') {
            this._drawRect(hx + 18, hy - 8, 4, 8, '#78909C');
            this._drawRect(hx + 17, hy - 11, 6, 4, '#00E5FF');
        }

        // Nature Variant Flower
        if (variant === 'earth') {
            this._drawRect(hx + 8, hy - 4, 8, 8, '#FF4081');
            this._drawRect(hx + 10, hy - 2, 4, 4, '#FFEE58');
        }

        // Eyes & Blush
        let spacing = 18;
        let ey = hy + 6;
        this._drawKawaiiEyes(hx, ey, spacing, C);
        this._drawRosyCheeks(hx, hy - 2, spacing, C);

        // Cute Snout & Mouth
        this._drawRect(hx + 15, hy + 13, 10, 8, C.light || C.white);
        this._drawRect(hx + 18, hy + 13, 4, 3, C.nose);

        if (this.mood === 'happy') {
            this._drawRect(hx + 18, hy + 17, 4, 4, C.outline);
            this._drawRect(hx + 19, hy + 18, 2, 3, '#FF5252');
        } else {
            this._drawRect(hx + 17, hy + 17, 2, 1, C.outline);
            this._drawRect(hx + 19, hy + 18, 2, 1, C.outline);
            this._drawRect(hx + 21, hy + 17, 2, 1, C.outline);
        }
    }

    _drawCat(ctx, palette, stage, variant) {
        const x = 0, y = 0;
        const C = palette;
        const isBaby = stage < 2;
        const headY = y;
        const bodyY = isBaby ? y + 18 : y + 20;

        // 1. Tail (behind body)
        let tailWag = Math.sin(this.frameCount * 0.15) * 4;
        this._drawRect(x + 22 + tailWag, bodyY - 4, 5, 16, C.outline);
        this._drawRect(x + 23 + tailWag, bodyY - 3, 3, 14, C.main);
        this._drawRect(x + 23 + tailWag, bodyY - 6, 3, 3, C.white);

        // 2. Body
        this._drawChibiBody(ctx, C, bodyY);

        // 3. Kawaii Head
        let hx = x - 4;
        let hy = headY + 2;
        let hw = 40;
        let hh = 26;

        // Pointy Kitty Ears
        this._drawRect(hx + 4, hy - 8, 8, 10, C.outline);
        this._drawRect(hx + 5, hy - 7, 6, 8, C.main);
        this._drawRect(hx + 6, hy - 5, 4, 5, C.innerEar);

        this._drawRect(hx + 28, hy - 8, 8, 10, C.outline);
        this._drawRect(hx + 29, hy - 7, 6, 8, C.main);
        this._drawRect(hx + 30, hy - 5, 4, 5, C.innerEar);

        // Head Shape
        this._drawRect(hx + 4, hy, hw - 8, hh, C.main);
        this._drawRect(hx + 2, hy + 2, hw - 4, hh - 4, C.main);
        this._drawRect(hx, hy + 4, hw, hh - 8, C.main);

        // Outline
        this._drawRect(hx + 4, hy, hw - 8, 1, C.outline);
        this._drawRect(hx, hy + 4, 1, hh - 8, C.outline);
        this._drawRect(hx + hw - 1, hy + 4, 1, hh - 8, C.outline);

        // Whiskers
        this._drawRect(hx - 2, hy + 14, 5, 1, C.outline);
        this._drawRect(hx - 3, hy + 17, 5, 1, C.outline);
        this._drawRect(hx + 37, hy + 14, 5, 1, C.outline);
        this._drawRect(hx + 38, hy + 17, 5, 1, C.outline);

        // Eyes & Blush
        let spacing = 18;
        let ey = hy + 6;
        this._drawKawaiiEyes(hx, ey, spacing, C);
        this._drawRosyCheeks(hx, hy - 2, spacing, C);

        // Cute Kitty Mouth (:3)
        this._drawRect(hx + 19, hy + 14, 2, 2, C.nose);
        this._drawRect(hx + 16, hy + 17, 3, 1, C.outline);
        this._drawRect(hx + 19, hy + 18, 2, 1, C.outline);
        this._drawRect(hx + 21, hy + 17, 3, 1, C.outline);
    }

    _drawDragon(ctx, palette, stage, variant) {
        const x = 0, y = 0;
        const C = palette;
        const isBaby = stage < 2;
        const headY = isBaby ? y + 2 : y;
        const bodyY = isBaby ? y + 28 : y + 34;

        // 1. Flapping Wings
        let wingFlap = Math.sin(this.frameCount * 0.25) * 4;
        this._drawRect(x - 8, bodyY - 12 + wingFlap, 12, 18, C.outline);
        this._drawRect(x - 7, bodyY - 11 + wingFlap, 10, 16, C.wing || C.shadow);

        this._drawRect(x + 28, bodyY - 12 + wingFlap, 12, 18, C.outline);
        this._drawRect(x + 29, bodyY - 11 + wingFlap, 10, 16, C.wing || C.shadow);

        // 2. Body & Tail
        this._drawChibiBody(ctx, C, bodyY);
        this._drawRect(x + 26, bodyY + 6, 10, 6, C.main); // Tail
        this._drawRect(x + 34, bodyY + 4, 4, 4, C.horn || C.shadow); // Tail spike

        // 3. Kawaii Head
        let hx = x - 4;
        let hy = headY + 2;
        let hw = 40;
        let hh = 28;

        // Little Horns
        this._drawRect(hx + 6, hy - 8, 4, 9, C.outline);
        this._drawRect(hx + 7, hy - 7, 2, 8, C.horn);

        this._drawRect(hx + 30, hy - 8, 4, 9, C.outline);
        this._drawRect(hx + 31, hy - 7, 2, 8, C.horn);

        // Head Shape
        this._drawRect(hx + 4, hy, hw - 8, hh, C.main);
        this._drawRect(hx + 2, hy + 2, hw - 4, hh - 4, C.main);
        this._drawRect(hx, hy + 4, hw, hh - 8, C.main);

        // Eyes & Blush
        let spacing = 18;
        let ey = hy + 8;
        this._drawKawaiiEyes(hx, ey, spacing, C);
        this._drawRosyCheeks(hx, hy, spacing, C);

        // Cute Snout
        this._drawRect(hx + 17, hy + 17, 2, 3, C.shadow);
        this._drawRect(hx + 21, hy + 17, 2, 3, C.shadow);
        this._drawRect(hx + 18, hy + 21, 4, 1, C.outline);
    }

    _drawClippy(ctx, palette) {
        const x = 4, y = 10;
        const C = palette;
        const bob = Math.sin(this.frameCount * 0.1) * 2;

        // Metallic Clip Body
        this._drawRect(x + 4, y + 4 + bob, 16, 26, C.outline);
        this._drawRect(x + 6, y + 6 + bob, 12, 22, C.main);
        this._drawRect(x + 8, y + 8 + bob, 8, 18, C.light);

        // Big Kawaii Eyes
        this._drawKawaiiEyes(x - 2, y + 10 + bob, 12, C);
        this._drawRosyCheeks(x - 2, y + 6 + bob, 12, C);
    }

    _drawSnake(ctx, palette) {
        const x = 4, y = 16;
        const C = palette;
        const bob = Math.sin(this.frameCount * 0.15) * 2;

        // Coiled Body
        this._drawRect(x + 2, y + 10, 24, 12, C.shadow);
        this._drawRect(x + 4, y + 6, 20, 14, C.main);
        this._drawRect(x + 8, y + 10, 12, 8, C.light);

        // Kawaii Head
        this._drawKawaiiEyes(x - 2, y + 4 + bob, 12, C);
        this._drawRosyCheeks(x - 2, y + 0 + bob, 12, C);

        // Cute tongue
        if (this.frameCount % 40 < 15) {
            this._drawRect(x + 15, y + 16 + bob, 2, 6, C.nose);
        }
    }

    _drawDuck(ctx, palette) {
        const x = 2, y = 12;
        const C = palette;
        const bob = Math.sin(this.frameCount * 0.2) * 2;

        // Chubby Duck Body
        this._drawRect(x + 4, y + 14, 24, 14, C.main);
        this._drawRect(x + 8, y + 18 + bob, 12, 6, C.shadow); // Wing

        // Head
        this._drawRect(x + 12, y, 16, 16, C.main);

        // Cute Beak
        this._drawRect(x + 26, y + 7, 8, 5, C.nose);

        // Eyes & Blush
        this._drawKawaiiEyes(x + 6, y + 3, 10, C);
        this._drawRosyCheeks(x + 6, y - 1, 10, C);
    }

    _drawFood(ctx, type) {
        const x = 0, y = 0;
        const bob = Math.sin(this.frameCount * 0.5) * 2;
        
        const cx = x - 6;

        if (type === 'bone') {
            this._drawRect(cx, y + bob, 12, 5, '#FFE0B2');
            this._drawRect(cx - 2, y + bob - 2, 5, 5, '#FFA726');
            this._drawRect(cx + 9, y + bob - 2, 5, 5, '#FFA726');
        } else if (type === 'fish') {
            this._drawRect(cx, y + bob, 12, 7, '#4FC3F7');
            this._drawRect(cx + 12, y + bob + 1, 4, 5, '#0288D1');
            this._drawRect(cx + 3, y + bob + 2, 2, 2, '#FFFFFF');
        } else if (type === 'meat') {
            this._drawRect(cx + 3, y + bob - 4, 4, 15, '#FFF3E0');
            this._drawRect(cx - 2, y + bob, 14, 9, '#FF5252');
        }
    }

    _drawHeart(ctx, x, y, scale, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.fillStyle = `rgba(255, 64, 129, ${alpha})`;
        // 5x5 heart matrix
        const H = [
            [0,1,0,1,0],
            [1,1,1,1,1],
            [1,1,1,1,1],
            [0,1,1,1,0],
            [0,0,1,0,0]
        ];
        for(let r=0; r<5; r++) {
            for(let c=0; c<5; c++) {
                if(H[r][c]) ctx.fillRect(c, r, 1, 1);
            }
        }
        ctx.restore();
    }

    _drawSpeechBubble(ctx, x, y, scale, text) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        const w = 24;
        const h = 16;
        const bx = -w/2;
        const by = -h - 6;

        // Rounded bubble background
        this._drawRect(bx + 1, by, w - 2, h, '#FFFFFF');
        this._drawRect(bx, by + 1, w, h - 2, '#FFFFFF');
        this._drawRect(bx + 1, by, w - 2, 1, '#2D1E18');
        this._drawRect(bx + 1, by + h - 1, w - 2, 1, '#2D1E18');
        this._drawRect(bx, by + 1, 1, h - 2, '#2D1E18');
        this._drawRect(bx + w - 1, by + 1, 1, h - 2, '#2D1E18');
        
        // Tail
        this._drawRect(0, by + h, 3, 2, '#FFFFFF');
        this._drawRect(-1, by + h, 1, 2, '#2D1E18');
        this._drawRect(3, by + h, 1, 2, '#2D1E18');
        this._drawRect(0, by + h + 2, 2, 1, '#2D1E18');

        // Emoji Text
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000000';
        ctx.fillText(text, 0, by + h/2 + 1);

        ctx.restore();
    }

    playAnimation(name, duration = 1000) {
        if (this.animationState !== 'idle') return;

        this.animationState = name;
        this.animationDuration = duration;
        this.animationTimer = 0;

        if (name === 'eat') {
            this.eatPhase = 'walk_in';
            this.walkOffset = 0;
            this.eatDirection = Math.random() < 0.5 ? 1 : -1;
        }
    }

    setPet(type, stage) {
        if (this.petType !== type || this.stage !== stage) {
            this.petType = type;
            this.stage = stage;
        }
    }

    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        if (parent) {
            const dpr = window.devicePixelRatio || 1;
            const rect = parent.getBoundingClientRect();
            
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            
            this.ctx.scale(dpr, dpr);
            this.width = rect.width;
            this.height = rect.height;
        }
    }

    startLoop() {
        const loop = (time) => {
            if (this.lastFrameTime === 0) {
                this.lastFrameTime = time;
            }
            const delta = time - this.lastFrameTime;
            this.lastFrameTime = time;

            this.update(delta);
            this.render();

            this.animationFrameId = requestAnimationFrame(loop);
        };
        this.animationFrameId = requestAnimationFrame(loop);
    }

    update(delta) {
        this.frameCount++;

        // Blinking system (~Every 3.5 seconds for 8 frames)
        this.blinkTimer += delta;
        if (this.blinkTimer > 3500) {
            this.isBlinking = true;
            if (this.blinkTimer > 3650) {
                this.isBlinking = false;
                this.blinkTimer = Math.random() * 500; // Offset next blink
            }
        }
        
        // Particles
        for(let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.y -= p.speed;
            p.life -= 0.025;
            if(p.life <= 0) this.particles.splice(i, 1);
        }
        
        // Speech Bubble
        if (this.speechBubble) {
            this.speechBubble.timer--;
            if (this.speechBubble.timer <= 0) this.speechBubble = null;
        }

        if (this.animationState !== 'idle' && this.animationState !== 'eat') {
            this.animationTimer += delta;
            if (this.animationTimer >= this.animationDuration) {
                this.animationState = 'idle';
            }
        }

        if (this.animationState === 'interact') {
            this.mood = (this.frameCount % 20 < 10) ? 'shock' : 'happy';
        } else if (this.animationState === 'happy' || this.animationState === 'levelup') {
            this.mood = 'happy';
        } else if (this.animationState === 'eat') {
            const targetDist = 24 * this.eatDirection;
            const walkSpeed = 0.5 * this.eatDirection;

            if (this.eatPhase === 'walk_in') {
                if (Math.abs(this.walkOffset) < Math.abs(targetDist)) {
                    this.walkOffset += walkSpeed;
                    this.mood = 'normal';
                } else {
                    this.walkOffset = targetDist;
                    this.eatPhase = 'eating';
                    this.mood = 'happy';
                }
            } else if (this.eatPhase === 'eating') {
                this.animationTimer += delta;
                if (this.animationTimer >= this.animationDuration) {
                    this.eatPhase = 'finish';
                    this.shouldSpawnHearts = true;
                    
                    const emojis = ['😋', '🍖', '❤️', '✨', '🥰', '💖'];
                    this.speechBubble = {
                        text: emojis[Math.floor(Math.random() * emojis.length)],
                        timer: 120
                    };
                }
            } else if (this.eatPhase === 'finish') {
                this.eatPhase = 'walk_out';
            } else if (this.eatPhase === 'walk_out') {
                if (Math.abs(this.walkOffset) > 0) {
                    this.walkOffset -= walkSpeed;
                    this.mood = 'normal';
                } else {
                    this.walkOffset = 0;
                    this.animationState = 'idle';
                }
            }
        } else {
            this.mood = 'normal';
        }
    }

    render() {
        if (!this.ctx || !this.canvas) return;
        
        if (!this.width || !this.height || this.width === 0 || this.height === 0) {
            this.resize();
        }

        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        
        const scale = Math.max(1, Math.floor(Math.min(w / 96, h / 80)));

        ctx.clearRect(0, 0, w, h);

        // --- Kawaii Squash & Stretch Bobbing ---
        const bobSpeed = (this.animationState === 'eat' && (this.eatPhase === 'walk_in' || this.eatPhase === 'walk_out')) ? 6 : 22;
        const bob = Math.sin(this.frameCount / bobSpeed) * (scale * 0.15);
        let yOffset = bob;
        let xOffset = 0;

        if (this.mood === 'happy') {
            yOffset -= Math.abs(Math.sin(this.frameCount / 8)) * scale * 0.6;
        } else if (this.mood === 'shock') {
            xOffset += (Math.random() - 0.5) * scale * 0.3;
        }

        const petWidth = 32 * scale;
        const petHeight = 64 * scale;
        const startX = (w - petWidth) / 2 + xOffset + (this.walkOffset * scale);
        const startY = (h - petHeight) / 2 + yOffset;

        // Shadow
        const shadowW = petWidth * 0.65;
        const shadowH = scale * 1.8;
        const shadowY = startY + petHeight - (scale * 2);
        const shadowScale = 1.0 - Math.min(0.5, Math.abs(yOffset - bob) / (scale * 5));
        ctx.fillStyle = `rgba(45, 30, 24, ${0.15 * shadowScale})`;
        ctx.beginPath();
        ctx.ellipse(w / 2 + (this.walkOffset * scale), shadowY, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // --- Transformations ---
        ctx.save();
        ctx.translate(startX, startY);
        ctx.scale(scale, scale);

        if ((this.animationState === 'eat' || this.animationState === 'walk') && this.eatDirection === -1) {
            const petLogicalWidth = 32;
            ctx.translate(petLogicalWidth, 0);
            ctx.scale(-1, 1);
        }

        // --- Determine Variant & Palette ---
        const baseType = this.petType.split('_')[0];
        const variant = this.petType.split('_')[1] || 'normal';

        let palette = this.palettes[baseType] || this.palettes.dog;
        if (variant === 'physics') palette = this.palettes.physics;
        if (variant === 'earth') palette = this.palettes.earth;

        // --- Select and Draw Pet ---
        if (this.stage === 0) {
            this._drawEgg(this.ctx, this.palettes.egg);
        } else {
            switch (baseType) {
                case 'cat':
                    this._drawCat(this.ctx, palette, this.stage, variant);
                    break;
                case 'dog':
                    this._drawDog(this.ctx, palette, this.stage, variant);
                    break;
                case 'dragon':
                    this._drawDragon(this.ctx, palette, this.stage, variant);
                    break;
                case 'clippy':
                    this._drawClippy(this.ctx, palette);
                    break;
                case 'snake':
                    this._drawSnake(this.ctx, palette);
                    break;
                case 'duck':
                    this._drawDuck(this.ctx, palette);
                    break;
            }
        }
        ctx.restore();

        // --- Food ---
        if (this.animationState === 'eat' && this.eatPhase !== 'walk_out') {
            let foodType = 'bone';
            if (baseType === 'cat' || baseType === 'duck') foodType = 'fish';
            if (baseType === 'dragon' || baseType === 'snake') foodType = 'meat';
            
            const foodX = w / 2 + (48 * scale * this.eatDirection);
            const foodY = startY + (40 * scale);
            
            ctx.save();
            ctx.translate(foodX, foodY);
            ctx.scale(scale, scale);
            this._drawFood(this.ctx, foodType);
            ctx.restore();
        }

        // --- Hearts Particles ---
        if (this.shouldSpawnHearts) {
            const centerX = startX + (16 * scale);
            const centerY = startY;
            for(let i=0; i<6; i++) {
                this.particles.push({
                    x: centerX + (Math.random() * 24 - 12) * scale,
                    y: centerY,
                    speed: (Math.random() * 1.2 + 0.6),
                    life: 1.0,
                    scale: scale
                });
            }
            this.shouldSpawnHearts = false;
        }

        this.particles.forEach(p => {
            this._drawHeart(ctx, p.x, p.y, Math.max(1, p.scale/2), p.life);
        });

        // --- Speech Bubble ---
        if (this.speechBubble) {
            const bubbleX = startX + (petWidth / 2);
            const bubbleY = startY;
            this._drawSpeechBubble(ctx, bubbleX, bubbleY, scale, this.speechBubble.text);
        }
    }
}
