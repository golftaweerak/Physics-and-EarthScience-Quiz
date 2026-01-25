import { BaseSimulation } from '../../simulation-engine.js';

/**
 * SimulationModule for Physics M.4 Chapter 2: Linear Motion
 */
export class SimulationModule extends BaseSimulation {
  constructor(config) {
    super({
      ...config,
      id: 'm4-ch2-linear-motion',
      title: 'บทที่ 2: การเคลื่อนที่แนวตรง',
      description: 'ศึกษาความสัมพันธ์ระหว่างตำแหน่ง ความเร็ว และความเร่ง ในการเคลื่อนที่แนวตรง',
      initialState: {
        x: 50,          // Position (pixels)
        v: 0,           // Velocity (px/s)
        a: 2,           // Acceleration (px/s^2)
        u: 0,           // Initial velocity
        time: 0,
        history: [],    // For graphs
        isPaused: true,
        scale: 1        // 1px = 1 meter for simplicity
      },
      controls: [
        { id: 'ctrl-u', label: 'ความเร็วต้น (u)', key: 'u', type: 'slider', min: 0, max: 100, step: 1, unit: ' m/s' },
        { id: 'ctrl-a', label: 'ความเร่ง (a)', key: 'a', type: 'slider', min: -50, max: 50, step: 1, unit: ' m/s²' }
      ],
      quests: [
        {
          id: 'q1',
          text: 'ปรับความเร่ง (a) เป็น 0 และกด "เริ่ม" เพื่อดูการเคลื่อนที่คงที่',
          condition: (state) => state.a === 0 && !state.isPaused && state.time > 1
        },
        {
          id: 'q2',
          text: 'ปรับความเร่ง (a) ให้มากกว่า 20 เพื่อดูความชันของกราฟความเร็ว',
          condition: (state) => state.a > 20 && !state.isPaused && state.time > 2
        },
        {
          id: 'q3',
          text: 'ปล่อยให้รถวิ่งไปไกลกว่า 500 เมตร',
          condition: (state) => state.x > 500
        }
      ]
    });

    this.trackY = 0;
    this.carWidth = 60;
    this.carHeight = 30;
  }

  reset() {
    this.state.x = 50;
    this.state.v = this.state.u;
    this.state.time = 0;
    this.state.history = [];
    this.resetQuests(); // Properly reset quest UI and state
  }

  update(dt) {
    const seconds = 1 / 60; // Assuming 60fps for physics calc
    this.state.time += seconds;

    // Physics: v = u + at
    this.state.v = this.state.u + (this.state.a * this.state.time);

    // Physics: s = ut + 0.5at^2
    this.state.x = 50 + (this.state.u * this.state.time) + (0.5 * this.state.a * Math.pow(this.state.time, 2));

    // Log history for graphs every 5 frames
    if (Math.floor(this.state.time * 60) % 5 === 0) {
      this.state.history.push({ t: this.state.time, x: this.state.x, v: this.state.v, a: this.state.a });
      if (this.state.history.length > 200) this.state.history.shift();
    }

    // Loop track
    if (this.state.x > this.canvas.width + 100) {
      this.state.time = 0;
      this.state.x = -this.carWidth;
    }
  }

  render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.trackY = canvas.height * 0.7;

    // Draw Track
    ctx.beginPath();
    ctx.moveTo(0, this.trackY);
    ctx.lineTo(canvas.width, this.trackY);
    ctx.strokeStyle = this.canvas.parentElement.classList.contains('dark') ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw Distance Markers
    ctx.fillStyle = this.canvas.parentElement.classList.contains('dark') ? '#475569' : '#94a3b8';
    ctx.font = '10px Kanit';
    for (let i = 0; i < canvas.width; i += 100) {
      ctx.fillRect(i, this.trackY, 2, 10);
      ctx.fillText(`${i}m`, i + 5, this.trackY + 20);
    }

    // Draw Car
    ctx.save();
    ctx.translate(this.state.x, this.trackY - this.carHeight - 5);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(5, this.carHeight + 2, this.carWidth, 4);

    // Body
    const carGradient = ctx.createLinearGradient(0, 0, 0, this.carHeight);
    carGradient.addColorStop(0, '#3b82f6');
    carGradient.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = carGradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, this.carWidth, this.carHeight, 8);
    ctx.fill();

    // Windows
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    ctx.roundRect(this.carWidth * 0.6, 5, this.carWidth * 0.3, this.carHeight * 0.4, 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(15, this.carHeight, 8, 0, Math.PI * 2);
    ctx.arc(45, this.carHeight, 8, 0, Math.PI * 2);
    ctx.fill();
    // Alloy
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(15, this.carHeight, 3, 0, Math.PI * 2);
    ctx.arc(45, this.carHeight, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Educational Overlay (Formulas)
    this.renderFormulas();

    // Draw Data Readout
    ctx.fillStyle = this.canvas.parentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b';
    ctx.font = 'bold 16px Kanit';

    ctx.fillText(`เวลา: ${this.state.time.toFixed(1)} s`, 20, 40);
    ctx.fillText(`ความเร็ว (v): ${this.state.v.toFixed(1)} m/s`, 20, 70);
    ctx.fillText(`ระยะทาง (s): ${this.state.x.toFixed(1)} m`, 20, 100);

    // Draw Mini Graphs
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
    ctx.fillText('สูตรคำนวณที่เกี่ยวข้อง:', 0, 10);

    ctx.font = '14px "Sarabun", sans-serif';
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';

    // v = u + at
    const vText = `v = ${this.state.u} + (${this.state.a} × ${this.state.time.toFixed(1)}) = ${this.state.v.toFixed(1)} m/s`;
    ctx.fillText(vText, 0, 35);

    // s = ut + 0.5at^2
    const sText = `s = (${this.state.u} × ${this.state.time.toFixed(1)}) + (0.5 × ${this.state.a} × ${this.state.time.toFixed(1)}²)`;
    ctx.fillText(sText, 0, 60);
    ctx.fillText(`  = ${this.state.x.toFixed(1)} m`, 0, 80);

    ctx.restore();
  }

  renderGraphs() {
    if (this.state.history.length < 2) return;

    const graphW = 180;
    const graphH = 80;
    const margin = 20;
    const startX = this.canvas.width - graphW - margin;

    // v-t Graph
    this.drawGraph(startX, 40, graphW, graphH, 'v', '#3b82f6', 'v-t (ความเร็ว-เวลา)');
    // s-t Graph
    this.drawGraph(startX, 150, graphW, graphH, 'x', '#10b981', 's-t (ระยะทาง-เวลา)');
  }

  drawGraph(x, y, w, h, key, color, title) {
    const { ctx } = this;
    const isDark = this.canvas.parentElement.classList.contains('dark');

    // Box
    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = 'bold 11px Kanit';
    ctx.fillText(title, x, y - 8);

    // Axes
    ctx.beginPath();
    ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
    ctx.moveTo(x + 10, y + 5);
    ctx.lineTo(x + 10, y + h - 10);
    ctx.lineTo(x + w - 5, y + h - 10);
    ctx.stroke();

    // Data Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const vals = this.state.history.map(h => h[key]);
    const min = Math.min(0, ...vals);
    const max = Math.max(10, ...vals) * 1.1; // Add 10% padding
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
