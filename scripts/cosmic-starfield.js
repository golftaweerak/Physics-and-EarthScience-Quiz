/**
 * ระบบจำลองท้องฟ้าอวกาศ 3 มิติ (Cosmic Dynamic Starfield & Shooting Stars)
 * ปรับขนาดอัตโนมัติตามหน้าจอ มีดาวระยิบระยับ ฝุ่นเนบิวลา และดาวตก
 */

export class CosmicStarfield {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.shootingStars = [];
    this.numStars = 220;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.dustParticles = [];

    this.resize();
    this.initStars();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  initStars() {
    this.stars = [];
    const colors = ['#FFFFFF', '#FFEAA7', '#74B9FF', '#A8DADC', '#FF7675', '#DFE6E9'];

    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: Math.random() * 2 + 0.5,
        radius: Math.random() * 1.8 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initStars();
    });

    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX - this.width / 2) * 0.03;
      this.targetMouseY = (e.clientY - this.height / 2) * 0.03;

      // Add gentle stardust on mouse movement
      if (Math.random() < 0.3) {
        this.addDust(e.clientX, e.clientY);
      }
    });

    // Touch support for mobile/tablets
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        this.targetMouseX = (t.clientX - this.width / 2) * 0.03;
        this.targetMouseY = (t.clientY - this.height / 2) * 0.03;
      }
    });
  }

  addDust(x, y) {
    if (this.dustParticles.length > 40) return;
    this.dustParticles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      life: 1.0,
      decay: Math.random() * 0.02 + 0.015,
      size: Math.random() * 2.5 + 1,
      color: Math.random() > 0.5 ? '#00F0FF' : '#FFD700'
    });
  }

  spawnShootingStar() {
    if (this.shootingStars.length >= 2) return;
    const startX = Math.random() * this.width * 0.8;
    const startY = Math.random() * (this.height * 0.4);
    const length = Math.random() * 120 + 80;
    const speed = Math.random() * 10 + 12;
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.2;

    this.shootingStars.push({
      x: startX,
      y: startY,
      length: length,
      speed: speed,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      opacity: 1,
      decay: 0.02,
      thickness: Math.random() * 1.8 + 1.2
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Smooth mouse parallax interpolation
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Draw deep space background gradient & subtle nebulae
    const grad = this.ctx.createRadialGradient(
      this.width * 0.5, this.height * 0.5, 50,
      this.width * 0.5, this.height * 0.5, Math.max(this.width, this.height) * 0.8
    );
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#090d1e');
    grad.addColorStop(1, '#050714');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw twinkling stars with depth
    const time = Date.now() * 0.002;
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const offsetX = this.mouseX * s.z;
      const offsetY = this.mouseY * s.z;

      const currentAlpha = Math.max(0.1, s.alpha + Math.sin(time + s.twinkleOffset) * 0.35);

      this.ctx.save();
      this.ctx.globalAlpha = currentAlpha;
      this.ctx.fillStyle = s.color;
      this.ctx.shadowBlur = s.radius > 1.5 ? 8 : 2;
      this.ctx.shadowColor = s.color;

      this.ctx.beginPath();
      this.ctx.arc(s.x + offsetX, s.y + offsetY, s.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Draw stardust particles
    for (let i = this.dustParticles.length - 1; i >= 0; i--) {
      const p = this.dustParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.dustParticles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.life * 0.8;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Spawn shooting stars randomly
    if (Math.random() < 0.012) {
      this.spawnShootingStar();
    }

    // Render shooting stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.x += s.dx;
      s.y += s.dy;
      s.opacity -= s.decay;

      if (s.opacity <= 0 || s.x > this.width + 100 || s.y > this.height + 100) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      const tailX = s.x - (s.dx / s.speed) * s.length;
      const tailY = s.y - (s.dy / s.speed) * s.length;

      const starGrad = this.ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      starGrad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
      starGrad.addColorStop(0.2, `rgba(0, 240, 255, ${s.opacity * 0.8})`);
      starGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      this.ctx.save();
      this.ctx.strokeStyle = starGrad;
      this.ctx.lineWidth = s.thickness;
      this.ctx.lineCap = 'round';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#00F0FF';

      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(tailX, tailY);
      this.ctx.stroke();
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Auto init helper if canvas exists globally
export function initCosmicStarfield(canvasId = 'cosmic-canvas') {
  let canvas = document.getElementById(canvasId);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.className = 'fixed inset-0 w-full h-full pointer-events-none -z-10';
    document.body.prepend(canvas);
  }
  return new CosmicStarfield(canvasId);
}
