import { BaseSimulation } from '../../simulation-engine.js';

/**
 * SimulationModule for Physics M.4 Chapter 2: Vertical Motion (Free Fall)
 */
export class SimulationModule extends BaseSimulation {
  constructor(config) {
    super({
      ...config,
      id: 'm4-ch2-vertical-motion',
      title: 'บทที่ 2: การเคลื่อนที่แนวดิ่ง',
      description: 'ศึกษาการตกแบบเสรีภายใต้แรงโน้มถ่วง (Free Fall)',
      initialState: {
        y: 50,          // Position from top (pixels)
        v: 0,           // Velocity (px/s)
        g: 9.8,         // Gravity (m/s^2)
        u: 0,           // Initial velocity
        time: 0,
        history: [],
        isPaused: true,
        groundY: 0      // Calculated on render
      },
      controls: [
        { id: 'ctrl-u', label: 'ความเร็วต้น (u) [ทิศลงเป็น +]', key: 'u', type: 'slider', min: -50, max: 100, step: 1, unit: ' m/s' },
        { id: 'ctrl-g', label: 'แรงโน้มถ่วง (g)', key: 'g', type: 'slider', min: 0, max: 20, step: 0.1, unit: ' m/s²' }
      ],
      quests: [
        {
          id: 'q1',
          text: 'กด "เริ่ม" เพื่อให้ลูกบอลตกถึงพื้น',
          condition: (state) => state.y >= state.groundY && state.time > 0
        },
        {
          id: 'q2',
          text: 'ปรับความเร็วต้น (u) เป็นลบ (โยนขึ้น) และดูจุดสูงสุด',
          condition: (state) => state.u < 0 && state.v > -1 && state.v < 1 && state.time > 0.5
        },
        {
          id: 'q3',
          text: 'ปรับแรงโน้มถ่วง (g) ให้เป็น 20 m/s² (ดาวเคราะห์มวลมาก)',
          condition: (state) => state.g === 20
        }
      ]
    });

    this.ballRadius = 20;
    this.padding = 100; // Sky height
  }

  reset() {
    this.state.y = this.padding;
    this.state.v = this.state.u;
    this.state.time = 0;
    this.state.history = [];
    this.resetQuests();
  }

  update(dt) {
    const seconds = 1 / 60;
    this.state.time += seconds;

    // Physics: v = u + gt
    this.state.v = this.state.u + (this.state.g * this.state.time);

    // Physics: s = ut + 0.5gt^2
    const displacement = (this.state.u * this.state.time) + (0.5 * this.state.g * Math.pow(this.state.time, 2));
    this.state.y = this.padding + (displacement * 5); // ScaleFactor: 5px/m

    // Ground collision
    if (this.state.y > this.state.groundY) {
      this.state.y = this.state.groundY;
      this.state.v = 0;
      this.state.isPaused = true;
    }

    // Log history
    if (Math.floor(this.state.time * 60) % 5 === 0) {
      this.state.history.push({ t: this.state.time, y: this.state.y, v: this.state.v, g: this.state.g });
      if (this.state.history.length > 200) this.state.history.shift();
    }
  }

  render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.state.groundY = canvas.height - 40;
    const isDark = this.canvas.parentElement.classList.contains('dark');

    // Draw Sky/Ground Interface
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, this.state.groundY);

    // Ground
    ctx.fillStyle = isDark ? '#0f172a' : '#e2e8f0';
    ctx.fillRect(0, this.state.groundY, canvas.width, 40);
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.state.groundY);
    ctx.lineTo(canvas.width, this.state.groundY);
    ctx.stroke();

    // Draw Height Rulers (Left)
    ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
    ctx.font = '10px Kanit';
    for (let h = 0; h < (this.state.groundY - this.padding); h += 50) {
      const py = this.padding + h;
      ctx.fillRect(0, py, 15, 1);
      ctx.fillText(`${(h / 5).toFixed(0)}m`, 20, py + 4);
    }

    // Draw Ball
    ctx.save();
    const ballX = canvas.width / 2;
    ctx.translate(ballX, this.state.y - this.ballRadius);

    // Shadow on ground
    const distanceToGround = this.state.groundY - this.state.y;
    const shadowOpacity = Math.max(0, 0.3 - (distanceToGround / 500));
    ctx.fillStyle = `rgba(0,0,0,${shadowOpacity})`;
    ctx.beginPath();
    ctx.ellipse(0, distanceToGround + this.ballRadius, this.ballRadius * 0.8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ball Body
    const gradient = ctx.createRadialGradient(-5, -5, 2, 0, 0, this.ballRadius);
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(1, '#f59e0b');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    ctx.restore();

    // Formulas
    this.renderFormulas();

    // Stats
    ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
    ctx.font = 'bold 16px Kanit';
    ctx.fillText(`เวลา: ${this.state.time.toFixed(1)} s`, 20, 40);
    ctx.fillText(`ความเร็ว (v): ${this.state.v.toFixed(1)} m/s`, 20, 70);
    ctx.fillText(`ความสูง (h): ${((this.state.groundY - this.state.y) / 5).toFixed(1)} m`, 20, 100);

    this.renderGraphs();
  }

  renderFormulas() {
    const { ctx, canvas } = this;
    const isDark = this.canvas.parentElement.classList.contains('dark');

    ctx.save();
    ctx.translate(20, 140);

    ctx.fillStyle = isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.roundRect(-10, -10, 240, 100, 12);
    ctx.fill();
    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = 'bold 12px Kanit';
    ctx.fillText('สูตรการตกแบบเสรี:', 0, 10);

    ctx.font = '14px "Sarabun", sans-serif';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';

    // v = u + gt
    const vText = `v = ${this.state.u} + (${this.state.g} × ${this.state.time.toFixed(1)}) = ${this.state.v.toFixed(1)} m/s`;
    ctx.fillText(vText, 0, 35);

    // h = ut + 0.5gt^2
    const hText = `s = (${this.state.u}t) + (1/2)gt²`;
    ctx.fillText(hText, 0, 60);
    ctx.fillText(`  = ${((this.state.y - this.padding) / 5).toFixed(1)} m (จากจุดเริ่ม)`, 0, 80);

    ctx.restore();
  }

  renderGraphs() {
    if (this.state.history.length < 2) return;
    const graphW = 180;
    const graphH = 80;
    const margin = 20;
    const startX = this.canvas.width - graphW - margin;

    this.drawGraph(startX, 40, graphW, graphH, 'v', '#f59e0b', 'v-t (ความเร็ว-เวลา)');
    this.drawGraph(startX, 150, graphW, graphH, 'y', '#10b981', 'y-t (ตำแหน่ง-เวลา)');
  }

  drawGraph(x, y, w, h, key, color, title) {
    const { ctx } = this;
    const isDark = this.canvas.parentElement.classList.contains('dark');

    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.stroke();

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = 'bold 11px Kanit';
    ctx.fillText(title, x, y - 8);

    ctx.beginPath();
    ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
    ctx.moveTo(x + 10, y + 5);
    ctx.lineTo(x + 10, y + h - 10);
    ctx.lineTo(x + w - 5, y + h - 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    const vals = this.state.history.map(h => h[key]);
    const min = Math.min(...vals, 0);
    const max = Math.max(...vals, 10) * 1.1;
    const range = max - min;

    this.state.history.forEach((point, i) => {
      const px = x + 10 + (i / 199) * (w - 20);
      const py = y + h - 10 - ((point[key] - min) / range) * (h - 20);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }
}
