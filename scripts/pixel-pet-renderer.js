/**
 * PixelPetRenderer - คลาสสำหรับเรนเดอร์สัตว์เลี้ยง 2D Pixel Art บน HTML5 Canvas
 * รองรับการวาดจากข้อมูล Grid และมี Animation ขยับขึ้นลง (Bobbing)
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
        this.particles = []; // Store active particles (hearts)
        
        this.lastFrameTime = 0;
        this.mood = 'normal'; // internal state: normal, happy, shock, sleep
        this.animationState = 'idle'; // 'idle', 'interact', 'happy', 'eat'
        this.animationTimer = 0;
        this.animationDuration = 0;

        // --- Pet Properties ---
        this.petType = 'dog';
        this.stage = 0; // 0: ไข่, 1: วัยเด็ก, 2: ตัวเต็มวัย
        this.walkOffset = 0; // For walking animation
        this.eatDirection = 1; // 1: Right, -1: Left
        this.eatPhase = 'none'; // 'walk_in', 'eating', 'walk_out'
        this.speechBubble = null; // { text: string, timer: number }

        // --- Physics ---
        this.petX = 0;
        this.petY = 0;
        this.jumpVelocity = 0;

        // ชุดสี (Palettes) สำหรับสัตว์เลี้ยงแต่ละประเภท
        this.palettes = {
            'dog': {
                outline: '#5D4037', main: '#A1887F', shadow: '#6D4C41',
                light: '#D7CCC8', white: '#FFFFFF', nose: '#795548',
                cheek: '#BCAAA4', eye: '#212121'
            },
            'cat': { 
                outline: '#5D4037', main: '#FFB74D', shadow: '#F57C00',
                light: '#FFE0B2', white: '#FFFFFF', nose: '#FF8A80',
                cheek: '#F48FB1', eye: '#212121'
            },
            'dragon': { 
                outline: '#1B5E20', main: '#66BB6A', shadow: '#388E3C',
                light: '#A5D6A7', white: '#FFFFFF', nose: '#C8E6C9',
                cheek: '#81C784', eye: '#212121'
            },
            'egg': { 
                outline: '#90A4AE', main: '#ECEFF1', shadow: '#B0BEC5',
                light: '#FFFFFF', white: '#FFFFFF', nose: '#CFD8DC',
                cheek: '#ECEFF1', eye: '#263238'
            }
        };

        // เริ่มต้นการทำงาน
        if (this.canvas) {
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.startLoop();
        }
    }

    // --- Private Drawing Methods ---
    _drawRect(x, y, w, h, color) {
        if (!color) return;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
    }

    _drawEgg(ctx, palette) {
        const x = 0, y = 0;
        const C = palette;
        this._drawRect(x + 4, y, 8, 2, C.outline);
        this._drawRect(x + 2, y + 2, 12, 2, C.outline);
        this._drawRect(x + 4, y + 2, 8, 12, C.main);
        this._drawRect(x + 2, y + 4, 12, 8, C.main);
        this._drawRect(x, y + 6, 16, 4, C.main);
        this._drawRect(x, y + 4, 2, 6, C.outline);
        this._drawRect(x + 14, y + 4, 2, 6, C.outline);
        this._drawRect(x + 2, y + 12, 12, 2, C.outline);
        this._drawRect(x + 4, y + 14, 8, 2, C.outline);
        // Shadow
        this._drawRect(x + 6, y + 10, 4, 2, C.shadow);
    }

    _drawCat(ctx, palette, stage) {
        const x = 0, y = 0;
        const C = palette;
        const isBaby = stage < 2;
        const headY = isBaby ? y + 5 : y;
        const bodyY = isBaby ? y + 30 : y + 37;

        // 1. Tail
        let tailWag = Math.sin(this.frameCount * 0.1) * 4;
        if (this.mood === 'happy') tailWag *= 2;
        this._drawRect(x + 23 + tailWag, bodyY - 17, 8, 20, C.outline); 
        this._drawRect(x + 24 + tailWag, bodyY - 16, 6, 18, C.main); 
        this._drawRect(x + 24 + tailWag, bodyY - 19, 6, 6, C.white); 

        // 2. Body & Paws
        this._drawRect(x + 2, bodyY, 28, 16, C.main);
        this._drawRect(x + 4, bodyY - 2, 24, 20, C.main);
        this._drawRect(x + 8, bodyY + 3, 16, 12, C.white);
        this._drawRect(x + 6, bodyY + 14, 6, 6, C.outline);
        this._drawRect(x + 20, bodyY + 14, 6, 6, C.outline);
        this._drawRect(x + 7, bodyY + 15, 4, 4, C.white);
        this._drawRect(x + 21, bodyY + 15, 4, 4, C.white);

        // 3. Head
        let hx = x - 4; 
        let hy = headY + 5;
        let hw = 40;
        let hh = isBaby ? 28 : 32;

        // Ears
        this._drawRect(hx + 6, hy - 8, 2, 2, C.outline);
        this._drawRect(hx + 4, hy - 6, 6, 8, C.main);
        this._drawRect(hx + 2, hy - 4, 10, 6, C.main);
        this._drawRect(hx + 32, hy - 8, 2, 2, C.outline);
        this._drawRect(hx + 30, hy - 6, 6, 8, C.main);
        this._drawRect(hx + 28, hy - 4, 10, 6, C.main);

        // Face Shape
        this._drawRect(hx + 2, hy, hw - 4, hh, C.main);
        this._drawRect(hx, hy + 2, hw, hh - 4, C.main);
        this._drawRect(hx + 1, hy + 1, hw - 2, hh - 2, C.main);

        // Stripes
        this._drawRect(hx + 18, hy, 4, 6, C.shadow);
        this._drawRect(hx + 12, hy, 2, 4, C.shadow);
        this._drawRect(hx + 26, hy, 2, 4, C.shadow);

        // Cheeks & Whiskers
        this._drawRect(hx + 4, hy + 22, 4, 4, C.cheek);
        this._drawRect(hx + 32, hy + 22, 4, 4, C.cheek);
        this._drawRect(hx - 3, hy + 21, 5, 1, C.outline);
        this._drawRect(hx - 3, hy + 24, 5, 1, C.outline);
        this._drawRect(hx + 38, hy + 21, 5, 1, C.outline);
        this._drawRect(hx + 38, hy + 24, 5, 1, C.outline);

        // Eyes
        let ex = hx + 8;
        let ey = hy + 12;
        let spacing = 16; 

        if (this.mood === 'sleep') {
            this._drawRect(ex, ey + 4, 6, 2, C.outline);
            this._drawRect(ex + spacing, ey + 4, 6, 2, C.outline);
        } else if (this.mood === 'happy') {
            this._drawRect(ex, ey + 2, 6, 2, C.outline);
            this._drawRect(ex + 2, ey, 2, 2, C.outline);
            this._drawRect(ex + spacing, ey + 2, 6, 2, C.outline);
            this._drawRect(ex + spacing + 2, ey, 2, 2, C.outline);
        } else if (this.mood === 'shock') {
            this._drawRect(ex, ey, 6, 6, C.white);
            this._drawRect(ex + spacing, ey, 6, 6, C.white);
            this._drawRect(ex + 2, ey + 2, 2, 2, C.eye);
            this._drawRect(ex + spacing + 2, ey + 2, 2, 2, C.eye);
        } else {
            this._drawRect(ex + 1, ey, 4, 8, C.eye);
            this._drawRect(ex, ey + 1, 6, 6, C.eye);
            this._drawRect(ex + 3, ey + 1, 2, 2, C.white);
            this._drawRect(ex + spacing + 1, ey, 4, 8, C.eye);
            this._drawRect(ex + spacing, ey + 1, 6, 6, C.eye);
            this._drawRect(ex + spacing + 3, ey + 1, 2, 2, C.white);
        }

        // Nose & Mouth
        this._drawRect(hx + 19, hy + 23, 2, 2, C.nose);
        if (this.mood !== 'shock') {
            this._drawRect(hx + 17, hy + 26, 1, 1, C.outline);
            this._drawRect(hx + 18, hy + 27, 1, 1, C.outline);
            this._drawRect(hx + 19, hy + 26, 2, 1, C.outline);
            this._drawRect(hx + 21, hy + 27, 1, 1, C.outline);
            this._drawRect(hx + 22, hy + 26, 1, 1, C.outline);
        } else {
             this._drawRect(hx + 18, hy + 25, 4, 4, C.eye); 
        }
    }

    _drawDog(ctx, palette, stage) {
        const x = 0, y = 0;
        const C = palette;
        const isBaby = stage < 2;
        const headY = isBaby ? y + 5 : y;
        const bodyY = isBaby ? y + 30 : y + 37;

        // 1. Tail (Wagging)
        let tailWag = Math.sin(this.frameCount * 0.2) * 6;
        if (this.mood === 'happy') tailWag *= 2;
        this._drawRect(x + 22 + tailWag, bodyY - 12, 6, 16, C.outline);
        this._drawRect(x + 23 + tailWag, bodyY - 11, 4, 14, C.main);
        this._drawRect(x + 23 + tailWag, bodyY - 14, 4, 4, C.white); // Tip

        // 2. Body
        this._drawRect(x + 2, bodyY, 28, 16, C.main);
        this._drawRect(x + 4, bodyY - 2, 24, 20, C.main);
        this._drawRect(x + 8, bodyY + 2, 16, 14, C.white); // Belly

        // 3. Paws
        this._drawRect(x + 6, bodyY + 14, 6, 6, C.outline);
        this._drawRect(x + 20, bodyY + 14, 6, 6, C.outline);
        this._drawRect(x + 7, bodyY + 15, 4, 4, C.white);
        this._drawRect(x + 21, bodyY + 15, 4, 4, C.white);

        // 4. Head
        let hx = x - 4;
        let hy = headY + 5;
        let hw = 40;
        let hh = isBaby ? 28 : 32;

        // Ears (Floppy)
        this._drawRect(hx - 2, hy + 4, 6, 12, C.shadow); // Left Ear
        this._drawRect(hx + 36, hy + 4, 6, 12, C.shadow); // Right Ear

        // Face Shape
        this._drawRect(hx + 2, hy, hw - 4, hh, C.main);
        this._drawRect(hx, hy + 2, hw, hh - 4, C.main);
        this._drawRect(hx + 1, hy + 1, hw - 2, hh - 2, C.main);

        // Eyes
        let ex = hx + 8;
        let ey = hy + 10;
        let spacing = 16;
        
        if (this.mood === 'sleep') {
            this._drawRect(ex, ey + 4, 6, 2, C.outline);
            this._drawRect(ex + spacing, ey + 4, 6, 2, C.outline);
        } else {
            this._drawRect(ex + 1, ey, 4, 8, C.eye);
            this._drawRect(ex, ey + 1, 6, 6, C.eye);
            this._drawRect(ex + 3, ey + 1, 2, 2, C.white);
            this._drawRect(ex + spacing + 1, ey, 4, 8, C.eye);
            this._drawRect(ex + spacing, ey + 1, 6, 6, C.eye);
            this._drawRect(ex + spacing + 3, ey + 1, 2, 2, C.white);
        }

        // Snout
        this._drawRect(hx + 14, hy + 18, 12, 10, C.light);
        this._drawRect(hx + 18, hy + 19, 4, 3, C.nose);
        this._drawRect(hx + 18, hy + 23, 1, 3, C.outline); // Mouth line
        this._drawRect(hx + 16, hy + 25, 8, 1, C.outline); // Mouth smile
    }

    _drawDragon(ctx, palette, stage) {
        const x = 0, y = 0;
        const C = palette;
        const isBaby = stage < 2;
        const headY = isBaby ? y + 5 : y;
        const bodyY = isBaby ? y + 30 : y + 37;

        // 1. Wings (Flapping)
        let wingFlap = Math.sin(this.frameCount * 0.2) * 4;
        this._drawRect(x - 10, bodyY - 10 + wingFlap, 12, 20, C.shadow); // Left Wing
        this._drawRect(x + 30, bodyY - 10 + wingFlap, 12, 20, C.shadow); // Right Wing

        // 2. Body & Tail
        this._drawRect(x + 2, bodyY, 28, 16, C.main);
        this._drawRect(x + 12, bodyY + 2, 8, 14, C.light); // Belly scales
        // Tail
        this._drawRect(x + 28, bodyY + 8, 12, 6, C.main);
        this._drawRect(x + 38, bodyY + 4, 4, 4, C.shadow); // Tail spike

        // 3. Head
        let hx = x - 4;
        let hy = headY + 5;
        let hw = 40;
        let hh = isBaby ? 28 : 32;

        // Horns
        this._drawRect(hx + 4, hy - 6, 4, 8, C.white);
        this._drawRect(hx + 32, hy - 6, 4, 8, C.white);

        // Face
        this._drawRect(hx + 2, hy, hw - 4, hh, C.main);
        this._drawRect(hx, hy + 2, hw, hh - 4, C.main);
        
        // Eyes (Reusing logic but simplified)
        this._drawRect(hx + 8, hy + 12, 6, 6, C.eye);
        this._drawRect(hx + 26, hy + 12, 6, 6, C.eye);
        
        // Snout/Nostrils
        this._drawRect(hx + 14, hy + 20, 2, 4, C.shadow);
        this._drawRect(hx + 24, hy + 20, 2, 4, C.shadow);
    }

    _drawFood(ctx, type) {
        const x = 0, y = 0;
        const bob = Math.sin(this.frameCount * 0.5); // Animation ลอยขึ้นลง
        const C = { bone: '#D7CCC8', fish: '#4FC3F7', meat: '#EF5350', outline: '#3E2723' };
        
        // Center the food horizontally (width approx 12)
        const cx = x - 6;

        if (type === 'bone') {
            this._drawRect(cx, y + bob, 10, 4, C.bone);
            this._drawRect(cx - 2, y + bob - 2, 4, 4, C.bone);
            this._drawRect(cx + 8, y + bob - 2, 4, 4, C.bone);
        } else if (type === 'fish') {
            this._drawRect(cx, y + bob, 10, 6, C.fish);
            this._drawRect(cx + 10, y + bob + 2, 4, 4, C.fish);
            this._drawRect(cx + 4, y + bob + 2, 2, 2, C.outline);
        } else if (type === 'meat') {
            this._drawRect(cx + 2, y + bob - 4, 4, 14, '#D7CCC8');
            this._drawRect(cx - 2, y + bob, 12, 8, C.meat);
        }
    }

    _drawHeart(ctx, x, y, scale, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.fillStyle = `rgba(255, 82, 82, ${alpha})`; // Red/Pink
        // 5x5 pixel heart pattern
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
        
        // Bubble Box (centered horizontally)
        const w = 20;
        const h = 14;
        const bx = -w/2;
        const by = -h - 4; // Above head

        // Box background & Border
        this._drawRect(bx + 1, by, w - 2, h, '#FFFFFF');
        this._drawRect(bx, by + 1, w, h - 2, '#FFFFFF');
        this._drawRect(bx + 1, by, w - 2, 1, '#000000'); // Top
        this._drawRect(bx + 1, by + h - 1, w - 2, 1, '#000000'); // Bottom
        this._drawRect(bx, by + 1, 1, h - 2, '#000000'); // Left
        this._drawRect(bx + w - 1, by + 1, 1, h - 2, '#000000'); // Right
        
        // Tail
        this._drawRect(0, by + h, 2, 1, '#FFFFFF');
        this._drawRect(-1, by + h, 1, 1, '#000000');
        this._drawRect(2, by + h, 1, 1, '#000000');
        this._drawRect(0, by + h + 1, 2, 1, '#000000');

        // Emoji Text
        ctx.font = '10px sans-serif'; // Will be scaled
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000000';
        ctx.fillText(text, 0, by + h/2 + 1);

        ctx.restore();
    }

    playAnimation(name, duration = 1000) {
        // Don't interrupt another animation
        if (this.animationState !== 'idle') return;

        this.animationState = name;
        this.animationDuration = duration;
        this.animationTimer = 0;

        if (name === 'eat') {
            this.eatPhase = 'walk_in';
            this.walkOffset = 0;
            this.eatDirection = Math.random() < 0.5 ? 1 : -1; // Randomize direction
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
            // ปรับขนาด Canvas ให้คมชัดบนจอ Retina/High DPI
            const dpr = window.devicePixelRatio || 1;
            const rect = parent.getBoundingClientRect();
            
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            
            // Scale context เพื่อให้วาดที่พิกัดปกติได้
            this.ctx.scale(dpr, dpr);
            
            // เก็บขนาด Logical ไว้คำนวณ
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

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update(delta) {
        this.frameCount++;
        
        // Update Particles
        for(let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.y -= p.speed;
            p.life -= 0.02;
            if(p.life <= 0) this.particles.splice(i, 1);
        }
        
        // Update Speech Bubble
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

        // Map external animation command to internal mood
        if (this.animationState === 'interact') {
            this.mood = (this.frameCount % 20 < 10) ? 'shock' : 'normal';
        } else if (this.animationState === 'happy') {
            this.mood = 'happy';
        } else if (this.animationState === 'levelup') {
            this.mood = 'happy'; // Use happy for level up
        } else if (this.animationState === 'eat') {
            // Complex Eat Sequence
            const targetDist = 24 * this.eatDirection; // Distance to walk (logical units)
            const walkSpeed = 0.5 * this.eatDirection;

            if (this.eatPhase === 'walk_in') {
                // Check if we reached target (considering direction)
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
                    // Spawn Hearts
                    this.shouldSpawnHearts = true;
                    
                    // Spawn Speech Bubble
                    const emojis = ['😋', '🍖', '❤️', '🤤', '✨', '🥰'];
                    this.speechBubble = {
                        text: emojis[Math.floor(Math.random() * emojis.length)],
                        timer: 100 // Show for ~1.5 seconds
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
        
        // Ensure dimensions are valid, retry resize if needed
        if (!this.width || !this.height || this.width === 0 || this.height === 0) {
            this.resize();
        }

        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        
        // Calculate scale to fit the pet within the canvas
        // We need to fit roughly 96 units horizontally (movement) and 80 units vertically
        const scale = Math.max(2, Math.floor(Math.min(w / 96, h / 80)));

        ctx.clearRect(0, 0, w, h);

        // --- Animation Calculations ---
        // Faster bobbing when walking
        const bobSpeed = (this.animationState === 'eat' && (this.eatPhase === 'walk_in' || this.eatPhase === 'walk_out')) ? 5 : 20;
        const bob = Math.sin(this.frameCount / bobSpeed) * (scale * 0.1);
        let yOffset = bob;
        let xOffset = 0;

        if (this.mood === 'happy') {
            yOffset -= Math.abs(Math.sin(this.frameCount / 10)) * scale * 0.5;
        } else if (this.mood === 'shock') {
            xOffset += (Math.random() - 0.5) * scale * 0.2;
        }

        // --- Centering & Drawing ---
        const petWidth = 32 * scale;
        const petHeight = 64 * scale;
        // Apply walkOffset to pet position
        const startX = (w - petWidth) / 2 + xOffset + (this.walkOffset * scale);
        const startY = (h - petHeight) / 2 + yOffset;

        // Draw Shadow
        const shadowW = petWidth * 0.6;
        const shadowH = scale * 1.5;
        const shadowY = startY + petHeight - (scale * 2);
        const shadowScale = 1.0 - Math.min(0.6, Math.abs(yOffset - bob) / (scale * 5));
        ctx.fillStyle = `rgba(0,0,0,${0.1 * shadowScale})`;
        ctx.beginPath();
        ctx.ellipse(w / 2, shadowY, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // --- Flip Context if walking left ---
        ctx.save();
        if (this.animationState === 'eat' && this.eatDirection === -1) {
            const centerX = startX + petWidth / 2;
            ctx.translate(centerX, 0);
            ctx.scale(-1, 1);
            ctx.translate(-centerX, 0);
        }

        // --- Select and Draw Pet ---
        if (this.stage === 0) {
            this._drawEgg(ctx, startX, startY, scale, this.palettes.egg);
        } else {
            const palette = this.palettes[this.petType] || this.palettes.dog;
            switch (this.petType) {
                case 'cat':
                    this._drawCat(ctx, startX, startY, scale, palette, this.stage);
                    break;
                case 'dog':
                    this._drawDog(ctx, startX, startY, scale, palette, this.stage);
                    break;
                case 'dragon':
                    this._drawDragon(ctx, startX, startY, scale, palette, this.stage);
                    break;
            }

            // วาดอาหารเมื่ออยู่ในสถานะกิน
            if (this.animationState === 'eat') {
                let foodType = 'bone';
                if (this.petType === 'cat') foodType = 'fish';
                if (this.petType === 'dragon') foodType = 'meat';
                
                // ตำแหน่งอาหาร (Fixed relative to screen center, where pet walks TO)
                // Pet walks 24 units. Food is placed at 48 units from center to be in front of pet.
                const baseCenter = (w - petWidth) / 2 + xOffset;
                const foodX = baseCenter + (48 * scale); 
                const foodY = startY + (40 * scale); // Keep Y relative to pet ground level
                
                // Only draw food if not walking away
                if (this.eatPhase !== 'walk_out') {
                    this._drawFood(ctx, foodX, foodY, scale, foodType);
                }
            }
        }

        // --- Spawn Hearts Logic ---
        if (this.shouldSpawnHearts) {
            const centerX = startX + (16 * scale); // Approx center of pet head
            const centerY = startY;
            for(let i=0; i<5; i++) {
                this.particles.push({
                    x: centerX + (Math.random() * 20 - 10) * scale,
                    y: centerY,
                    speed: (Math.random() * 1 + 0.5) * scale,
                    life: 1.0,
                    scale: scale
                });
            }
            this.shouldSpawnHearts = false;
        }

        // --- Draw Particles ---
        this.particles.forEach(p => {
            this._drawHeart(ctx, p.x, p.y, Math.max(1, p.scale/2), p.life);
        });
    }
}
