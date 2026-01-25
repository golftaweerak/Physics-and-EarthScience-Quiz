import { BaseSimulation } from '../../simulation-engine.js';

/**
 * Consolidated Simulation for Physics M.4 Chapter 2: Motion
 * Features Horizontal and Vertical motion in a single tabbed interface.
 * Uses KaTeX for educational formula rendering.
 */
export class SimulationModule extends BaseSimulation {
  constructor(config) {
    super({
      ...config,
      id: 'm4-ch2-combined',
      title: 'บทที่ 2: การเคลื่อนที่แนวตรงและแนวดิ่ง',
      description: 'ศึกษาความสัมพันธ์ระหว่างระยะทาง ความเร็ว และความเร่ง',
      tabs: [
        {
          id: 'horizontal',
          label: 'การเคลื่อนที่แนวตรง',
          initialState: {
            x: 0,
            v: 0,
            a: 2,
            u: 0,
            time: 0,
            history: [],
            isPaused: true
          },
          controls: [
            { id: 'ctrl-u-h', label: 'ความเร็วต้น (u)', key: 'u', type: 'slider', min: -100, max: 100, unit: ' m/s', onChange: () => this.handleParameterChange() },
            { id: 'ctrl-a-h', label: 'ความเร่ง (a)', key: 'a', type: 'slider', min: -50, max: 50, unit: ' m/s²', onChange: () => this.handleParameterChange() }
          ],
          quests: [
            { id: 'h1', text: 'ปรับความเร่ง (a) เป็น 0 เพื่อดูการเคลื่อนที่สม่ำเสมอ', condition: (state) => state.a === 0 && state.time > 1 },
            { id: 'h2', text: 'ทำให้รถมีความเร็วมากกว่า 50 m/s', condition: (state) => state.v > 50 },
            { id: 'h3', text: 'ให้รถเคลื่อนที่ไปไกลเกิน 500 เมตร', condition: (state) => Math.abs(state.x) > 500 }
          ]
        },
        {
          id: 'vertical',
          label: 'การเคลื่อนที่แนวดิ่ง',
          initialState: {
            y: 0, // Displacement from start
            yBase: 100, // Visual start
            v: 0,
            g: 9.8,
            u: 0,
            time: 0,
            history: [],
            isPaused: true,
            groundY: 1000 // Very deep
          },
          controls: [
            { id: 'ctrl-u-v', label: 'ความเร็วต้น (u) [ทิศลง +]', key: 'u', type: 'slider', min: -100, max: 100, unit: ' m/s', onChange: () => this.handleParameterChange() },
            { id: 'ctrl-g-v', label: 'แรงโน้มถ่วง (g)', key: 'g', type: 'slider', min: 1, max: 30, step: 0.1, unit: ' m/s²', onChange: () => this.handleParameterChange() },
            {
              label: 'เลือกดาวเคราะห์ (Preset)',
              type: 'buttons',
              key: 'g',
              linkId: 'ctrl-g-v',
              linkUnit: ' m/s²',
              onChange: () => this.handleParameterChange(),
              options: [
                { label: 'โลก (9.8)', value: 9.8 },
                { label: 'ดวงจันทร์ (1.6)', value: 1.6 },
                { label: 'อังคาร (3.7)', value: 3.7 },
                { label: 'พฤหัส (24.8)', value: 24.8 }
              ]
            }
          ],
          quests: [
            { id: 'v1', text: 'ทำให้ลูกบอลตกถึงพื้น', condition: (state) => 100 + (state.y * 5) >= state.groundY && state.time > 0 },
            { id: 'v2', text: 'โยนขึ้นฟ้า (u ติดลบ) เพื่อหาจุดสูงสุด', condition: (state) => state.u < 0 && Math.abs(state.v) < 1 && state.time > 0.5 },
            { id: 'v3', text: 'ทดลองบนดาวที่มีแรงโน้มถ่วงมากกว่า 20 m/s²', condition: (state) => state.g > 20 }
          ]
        }
      ]
    });

    this.carWidth = 60;
    this.carHeight = 35;
    this.ballRadius = 20;
    this.scaleFactor = 5; // 5px per meter
  }

  handleParameterChange() {
    this.state.time = 0;
    this.state.history = [];
    // Synchronize initial v and s/h for t=0 display
    this.state.v = parseFloat(this.state.u);
    if (this.activeTabId === 'horizontal') {
      this.state.x = 0;
    } else {
      this.state.y = 0;
    }
  }

  reset() {
    // Preserve user selections
    const currentU = this.state.u;
    const currentA = this.state.a;
    const currentG = this.state.g;

    // Standard reset (resets time, isPaused, etc. to initialState values)
    super.reset();

    // Re-apply user selections ONLY if they are defined (not NaN/undefined)
    if (typeof currentU === 'number' && !isNaN(currentU)) {
      this.state.u = currentU;
    }

    if (this.activeTabId === 'horizontal') {
      if (typeof currentA === 'number' && !isNaN(currentA)) {
        this.state.a = currentA;
      }
    } else {
      if (typeof currentG === 'number' && !isNaN(currentG)) {
        this.state.g = currentG;
      }
    }

    // Full sync
    this.handleParameterChange();

    // UI SYNC: Update the DOM sliders and labels to match the restored state
    this.controls.forEach(ctrl => {
      const input = document.getElementById(ctrl.id);
      const valDisplay = document.getElementById(`${ctrl.id}-val`);
      if (input) input.value = this.state[ctrl.key];
      if (valDisplay) valDisplay.textContent = `${this.state[ctrl.key]}${ctrl.unit || ''}`;
    });

    // Clear Graph container to force redraw of titles/containers
    const graphContainer = document.getElementById('sim-graphs-container');
    if (graphContainer) graphContainer.innerHTML = '';
  }

  update(dt) {
    const seconds = 1 / 60;
    this.state.time += seconds;

    if (this.activeTabId === 'horizontal') {
      this.updateHorizontal(seconds);
    } else {
      this.updateVertical(seconds);
    }

    // Keep history for graphs - Use Time Threshold instead of frame modulo
    const lastPt = this.state.history[this.state.history.length - 1];

    // Auto-Reset History if parameters changed (Rudimentary check)
    // In a production engine we'd track 'lastState' separately, but here we can check if velocity jumps unexpectedly at t=0 or similar.
    // Actually, best way is to hook into the Control's onChange, but since we are in Loop, let's just do:
    // We already moved to Analytical Sync in updateHorizontal/Vertical, effectively calculating state FROM time.
    // To fix graph "kinks", the history should be cleared if the USER changes controls.
    // This is handled by the framework resetting 'state' usually, but 'BaseSimulation' preserves state unless reset() is called.
    // Let's implement a 'checkDirty' in future or just rely on manual Reset for major changes?
    // User requested "Auto-reset graph".
    // Let's detect Time=0 jump or just clearing history when time is reset.

    // For now, ensure we don't have circular json
    if (!lastPt || this.state.time - lastPt.time >= 0.05) {
      this.state.history.push({
        x: this.state.x,
        y: this.state.y,
        v: this.state.v,
        time: this.state.time
      });
      if (this.state.history.length > 500) this.state.history.shift();
    }
  }

  updateHorizontal(dt) {
    const t = this.state.time;
    const u = this.state.u;
    const a = this.state.a;

    // ANALYTICAL SYNC
    this.state.v = u + (a * t);
    this.state.x = (u * t) + (0.5 * a * Math.pow(t, 2));

    // Camera: strictly center the car
    this.state.cameraX = (this.state.x * this.scaleFactor) - (this.canvas.width / 2);
  }

  updateVertical(dt) {
    const t = this.state.time;
    const u = this.state.u;
    const g = this.state.g;

    // ANALYTICAL SYNC
    this.state.v = u + (g * t);
    this.state.y = (u * t) + (0.5 * g * Math.pow(t, 2));

    // Visual ground check
    const visualY = (this.state.yBase || 100) + (this.state.y * this.scaleFactor);
    const groundLimit = (this.state.groundY || 500);

    // Collision Detection (Ball Radius is 20) in Physics Space
    // groundY is canvas pixel coordinate, y is physics displacement
    // Let's rely on visual calculation for simple boundary
    if (visualY >= groundLimit - 20 && this.state.v > 0) { // Hitting ground moving down
      this.state.isPaused = true;
      // Snap to exact ground contact
      // derived from visualY = yBase + y*scale -> y = (visualY - yBase)/scale
      const maxY = (groundLimit - 20 - (this.state.yBase || 100)) / this.scaleFactor;
      this.state.y = maxY;
    }

    // Camera: strictly center the ball
    this.state.cameraY = visualY - (this.canvas.height / 2);
  }

  render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.activeTabId === 'horizontal') {
      this.renderHorizontal();
    } else {
      this.renderVertical();
    }

    this.renderEducationalOverlay();
    this.renderGraphsOverlay();
  }

  renderHorizontal() {
    const { ctx, canvas } = this;
    const trackY = canvas.height * 0.7;
    const isDark = this.canvas.parentElement.classList.contains('dark');
    const offset = this.state.cameraX || 0;

    ctx.save();
    ctx.translate(-offset, 0);

    // Track
    ctx.beginPath();
    ctx.moveTo(offset - 100, trackY);
    ctx.lineTo(offset + canvas.width + 100, trackY);
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Rulers
    ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
    ctx.font = '10px Kanit';
    const startM = Math.floor(offset / (100 * this.scaleFactor)) * 100;
    for (let i = startM - 200; i < (offset + canvas.width + 200) / this.scaleFactor; i += 50) {
      const px = i * this.scaleFactor;
      ctx.fillRect(px, trackY, 2, 10);
      ctx.fillText(`${i}m`, px + 5, trackY + 20);
    }

    // Car
    ctx.save();
    ctx.translate(this.state.x * this.scaleFactor, trackY - this.carHeight - 5);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(5, this.carHeight + 2, this.carWidth, 4);

    // Body
    ctx.fillStyle = this.state.a >= 0 ? '#3b82f6' : '#ef4444';
    ctx.beginPath();
    ctx.roundRect(0, 0, this.carWidth, this.carHeight, 8);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(15, this.carHeight, 8, 0, Math.PI * 2);
    ctx.arc(45, this.carHeight, 8, 0, Math.PI * 2);
    ctx.fill();

    // Vectors (Center of car)
    const cx = this.carWidth / 2;
    const cy = this.carHeight / 2;
    this.drawArrow(ctx, cx, cy, this.state.v * 3, 0, '#3b82f6', 'v');
    this.drawArrow(ctx, cx, cy, this.state.a * 10, 0, '#ef4444', 'a');

    ctx.restore();
    ctx.restore();
  }

  getPlanetTheme() {
    const g = parseFloat(this.state.g);
    if (g < 2) return { sky: '#0f172a', ground: '#94a3b8', name: 'ดวงจันทร์' }; // Moon
    if (g < 5) return { sky: '#451a03', ground: '#92400e', name: 'ดาวอังคาร' }; // Mars
    if (g > 20) return { sky: '#422006', ground: '#78350f', name: 'ดาวพฤหัส' }; // Jupiter
    return { sky: '#0f172a', ground: '#065f46', name: 'โลก' }; // Earth (Default)
  }

  renderVertical() {
    const { ctx, canvas } = this;
    this.state.groundY = 5000;
    const isDark = this.canvas.parentElement.classList.contains('dark');
    const offset = this.state.cameraY || 0;
    const theme = this.getPlanetTheme();

    ctx.save();
    ctx.translate(0, -offset);

    const visualY = (this.state.yBase || 100) + (this.state.y * this.scaleFactor);

    // Dynamic Sky/Atmosphere (Gradient)
    const skyGrd = ctx.createLinearGradient(0, offset, 0, offset + canvas.height);
    skyGrd.addColorStop(0, theme.sky);
    skyGrd.addColorStop(1, isDark ? '#020617' : '#1e293b');
    ctx.fillStyle = skyGrd;
    ctx.fillRect(0, offset, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = theme.ground;
    ctx.fillRect(0, this.state.groundY, canvas.width, 400);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, this.state.groundY);
    ctx.lineTo(canvas.width, this.state.groundY);
    ctx.stroke();

    // Rulers
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px Kanit';
    const startH = Math.floor(offset / this.scaleFactor / 50) * 50;
    for (let h = startH - 100; h < (offset + canvas.height + 200) / this.scaleFactor; h += 20) {
      const py = 100 + (h * this.scaleFactor);
      ctx.fillRect(0, py, 15, 1);
      if (h % 100 === 0) ctx.fillText(`${h.toFixed(0)}m`, 20, py + 4);
    }

    // Ball
    ctx.save();
    ctx.translate(canvas.width / 2, visualY - this.ballRadius);

    // Glow effect
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, this.ballRadius * 2);
    glow.addColorStop(0, '#fbbf24');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, this.ballRadius * 2, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, this.ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  renderEducationalOverlay() {
    const content = document.getElementById('math-formula-content');
    if (!content) return;

    let equations = '';
    const t = this.state.time.toFixed(2);
    const v = this.state.v.toFixed(2);
    const s = this.activeTabId === 'horizontal' ? this.state.x : this.state.y;
    const sVal = s.toFixed(2);

    if (this.activeTabId === 'horizontal') {
      const { u, a } = this.state;

      equations = `
        <div class="mb-4">
            <div id="eq-v-symbolic"></div>
            <div id="eq-v-substituted" class="text-blue-500 dark:text-blue-400 mt-1 font-bold"></div>
        </div>
        <div class="mb-2">
            <div id="eq-s-symbolic"></div>
            <div id="eq-s-substituted" class="text-green-500 dark:text-green-400 mt-1 font-bold"></div>
        </div>
        <div class="text-[11px] text-slate-400 mt-4 border-t border-slate-700/50 pt-2 font-kanit">เวลาที่ใช้ (t): <span class="text-slate-200">${t} s</span></div>
      `;
      content.innerHTML = equations;

      this.renderMath('eq-v-symbolic', `v = u + at`);
      this.renderMath('eq-v-substituted', `v = ${u} + (${a} \\times ${t}) = ${v} \\, \\text{m/s}`);

      this.renderMath('eq-s-symbolic', `s = ut + \\frac{1}{2}at^2`);
      this.renderMath('eq-s-substituted', `s = (${u} \\times ${t}) + \\frac{1}{2}(${a})(${t}^2) = ${sVal} \\, \\text{m}`);
    } else {
      const { u, g } = this.state;

      equations = `
        <div class="mb-4">
            <div id="eq-v-v-symbolic"></div>
            <div id="eq-v-v-substituted" class="text-orange-500 dark:text-orange-400 mt-1 font-bold"></div>
        </div>
        <div class="mb-2">
            <div id="eq-h-v-symbolic"></div>
            <div id="eq-h-v-substituted" class="text-green-500 dark:text-green-400 mt-1 font-bold"></div>
        </div>
        <div class="text-[11px] text-slate-400 mt-4 border-t border-slate-700/50 pt-2 font-kanit">เวลาที่ใช้ (t): <span class="text-slate-200">${t} s</span></div>
      `;
      content.innerHTML = equations;

      this.renderMath('eq-v-v-symbolic', `v = u + gt`);
      this.renderMath('eq-v-v-substituted', `v = ${u} + (${g} \\times ${t}) = ${v} \\, \\text{m/s}`);

      this.renderMath('eq-h-v-symbolic', `s = ut + \\frac{1}{2}gt^2`);
      this.renderMath('eq-h-v-substituted', `s = (${u} \\times ${t}) + \\frac{1}{2}(${g})(${t}^2) = ${sVal} \\, \\text{m}`);
    }
  }

  renderGraphsOverlay() {
    const container = document.getElementById('sim-graphs-container');
    if (!container) return;

    if (container.children.length === 0) {
      container.innerHTML = `
            <div class="w-80 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg pointer-events-auto">
                <canvas id="graph-v-t" width="300" height="150"></canvas>
            </div>
            <div class="w-80 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg pointer-events-auto">
                <canvas id="graph-s-t" width="300" height="150"></canvas>
            </div>
        `;
    }

    this.drawGraphOnElement('graph-v-t', 'v', '#3b82f6', 'v-t (ความเร็ว-เวลา)', 'v (m/s)', 't (s)', 'm/s', 's');
    const posKey = this.activeTabId === 'horizontal' ? 'x' : 'y';
    const label = this.activeTabId === 'horizontal' ? 's (m)' : 'h (m)';
    this.drawGraphOnElement('graph-s-t', posKey, '#10b981', `${label} - t`, label, 't (s)', 'm', 's');
  }

  drawGraphOnElement(canvasId, key, color, title, yLabel, xLabel, yUnit, xUnit) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || this.state.history.length < 2) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const isDark = this.canvas.parentElement.classList.contains('dark');

    ctx.clearRect(0, 0, w, h);

    // Dynamic Axis Margin
    const ax = 55; // Wider for values
    const ay = h - 35;
    const graphW = w - ax - 25;
    const graphH = h - 65;

    // Title (Drawn high up)
    ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
    ctx.font = 'bold 12px Kanit';
    ctx.fillText(title, 10, 18);

    // Bounds Calculation
    const pts = this.state.history;
    const vals = pts.map(pt => pt[key]);
    const times = pts.map(pt => pt.time);
    const minT = times[0];
    const maxT = times[times.length - 1];
    const rangeT = Math.max(0.1, maxT - minT);

    let minV = Math.min(...vals);
    let maxV = Math.max(...vals);

    // Padding & Logic: Ensure 0 is visible if meaningful
    if (minV >= 0) minV = 0; // Displacement/Velocity starting from 0
    if (maxV <= 0) maxV = 0; // Negative velocity/displacement

    // Add 10% vertical padding
    const valRange = maxV - minV;
    maxV += valRange * 0.1;
    minV -= valRange * 0.1;

    const rangeV = Math.max(0.1, maxV - minV);

    // Draw Grid Lines (Scientific: Every 10% or meaningful division)
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
    ctx.lineWidth = 1;
    // 4 Horizontal lines
    for (let i = 0; i <= 4; i++) {
      const gy = ay - (i / 4) * graphH;
      ctx.beginPath(); ctx.moveTo(ax, gy); ctx.lineTo(w - 20, gy); ctx.stroke();
    }
    // 4 Vertical lines
    for (let i = 0; i <= 4; i++) {
      const gx = ax + (i / 4) * graphW;
      ctx.beginPath(); ctx.moveTo(gx, 25); ctx.lineTo(gx, ay); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay - graphH - 5); ctx.lineTo(ax, ay); ctx.lineTo(w - 15, ay);
    ctx.stroke();

    // Value Labels (Extreme positions)
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '9px Kanit';
    ctx.fillText(maxV.toFixed(0), ax - 45, ay - graphH + 5);
    ctx.fillText(minV.toFixed(0), ax - 45, ay);

    // Axis Names (Positioning) - Adjusted to prevent overlap with Title
    ctx.fillStyle = color;
    ctx.font = 'bold 10px Kanit';
    ctx.fillText(yLabel, ax - 45, ay - graphH - 15);
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.fillText(xLabel, w - 25, ay + 20);

    // Zero Axis (Thick Dashed)
    if (minV < 0 && maxV > 0) {
      const zeroY = ay - ((0 - minV) / rangeV) * graphH;
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ax, zeroY); ctx.lineTo(w - 20, zeroY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 1;

      // Zero Label
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText("0", ax - 15, zeroY + 3);
    }

    // Plot Data
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';

    let peakIdx = -1;
    pts.forEach((pt, i) => {
      const px = ax + ((pt.time - minT) / rangeT) * graphW;
      const py = ay - ((pt[key] - minV) / rangeV) * graphH;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);

      // Find highest point (v=0 or inflection)
      if (i > 0 && ((pts[i - 1].v < 0 && pt.v >= 0) || (pts[i - 1].v > 0 && pt.v <= 0))) {
        peakIdx = i;
      }
    });
    ctx.stroke();

    // Peak Marker (Highest Point)
    if (peakIdx !== -1) {
      const peakPt = pts[peakIdx];
      const px = ax + ((peakPt.time - minT) / rangeT) * graphW;
      const py = ay - ((peakPt[key] - minV) / rangeV) * graphH;

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.beginPath(); ctx.moveTo(px, 25); ctx.lineTo(px, ay); ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 9px Kanit';
      ctx.fillText('จุดสูงสุด', px + 5, 35);
    }

    // Latest Value Indicator (Top Right area)
    const lastVal = vals[vals.length - 1];
    ctx.fillStyle = color;
    ctx.font = 'bold 11px Kanit';
    ctx.textAlign = 'right';
    ctx.fillText(`${lastVal.toFixed(1)} ${yUnit}`, w - 20, 18);
    ctx.textAlign = 'left';
  }
}
