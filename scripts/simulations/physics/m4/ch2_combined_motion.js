import { BaseSimulation } from '../../simulation-engine.js';

/**
 * Master Simulation for Physics M.4 Chapter 2: Motion (การเคลื่อนที่แนวตรงและแนวดิ่ง)
 * Comprehensive coverage for Thai High School Physics curriculum:
 * 1. Horizontal Motion (การเคลื่อนที่แนวตรง - ความเร่งคงตัว)
 * 2. Vertical Motion / Free Fall (การเคลื่อนที่แนวดิ่ง & จุดสูงสุด h_max)
 * 3. Two-Vehicle Pursuit (การไล่กวดกันของรถ 2 คัน - s_A = s_B)
 */
export class SimulationModule extends BaseSimulation {
  constructor(config) {
    super({
      ...config,
      id: 'm4-ch2-combined',
      title: 'บทที่ 2: การเคลื่อนที่แนวตรง แนวดิ่ง และการไล่กวดกัน',
      description: 'ศึกษาความสัมพันธ์ระหว่างระยะทาง ความเร็ว ความเร่ง และการวิเคราะห์กราฟตามหลักสูตรฟิสิกส์ ม.4',
      tabs: [
        {
          id: 'distance_displacement',
          label: '1. ระยะทาง vs การกระจัด',
          initialState: {
            x: 0,
            v: 15,
            a: 0,
            u: 15,
            distance: 0,
            displacement: 0,
            speedAvg: 0,
            velocityAvg: 0,
            time: 0,
            pathHistory: [],
            history: [],
            isPaused: true
          },
          controls: [
            { id: 'ctrl-v-dd', label: 'ความเร็ว / ทิศทาง (v) [ความเร็วคงตัว]', key: 'v', type: 'slider', min: -40, max: 40, unit: ' m/s', onChange: (val) => this.handleParameterChange('v', val) },
            {
              label: 'ทิศทางการเคลื่อนที่ (Preset)',
              type: 'buttons',
              key: 'preset_dd',
              onChange: (val) => this.applyDDPreset(val),
              options: [
                { label: 'วิ่งไปทางขวา (v = +20)', value: 'right' },
                { label: 'วิ่งถอยกลับ (v = -20)', value: 'left' },
                { label: 'หยุดพัก (v = 0)', value: 'stop' }
              ]
            }
          ],
          quests: [
            { id: 'dd1', text: 'ปรับความเร็วให้เป็นลบ (วิ่งถอยหลัง) สังเกตระยะทาง (d) เพิ่มขึ้นเสมอ แต่การกระจัด (s) ลดลง', condition: (state) => state.distance > Math.abs(state.displacement) + 10 && state.time > 1 },
            { id: 'dd2', text: 'บังคับให้รถกลับมาใกล้จุดเริ่มต้น (การกระจัด s ≈ 0m แต่ระยะทาง d > 40m)', condition: (state) => state.distance > 40 && Math.abs(state.displacement) < 5 },
            { id: 'dd3', text: 'สะสมระยะทางทั้งหมดให้ได้มากกว่า 150 เมตร', condition: (state) => state.distance > 150 }
          ]
        },
        {
          id: 'ticker_tape',
          label: '2. เครื่องเคาะสัญญาณเวลา',
          initialState: {
            freq: 50, // 50 Hz default standard
            u: 0.3,   // Initial velocity (0.3 m/s = 30 cm/s)
            v: 0.3,   // Current velocity
            a: 0.8,   // Acceleration (0.8 m/s^2 = 80 cm/s^2)
            duration: 1.0, // Run duration in seconds
            x: 0,
            dots: [],
            lastDotTime: 0,
            time: 0,
            history: [],
            isPaused: true,
            isFinished: false,
            calcMode: 'instant', // 'instant' or 'average'
            selectedDot: 3,
            startDot: 2,
            endDot: 5,
            rulerX: 80,
            rulerY: 340,
            tapeZoom: 1.0, // 1.0x baseline for exact 1:1 match with wooden ruler
            tapePanX: 0,
            isDraggingRuler: false
          },
          controls: [
            { id: 'ctrl-duration-tt', label: 'เวลาการวิ่งของรถ (t)', key: 'duration', type: 'slider', min: 0.4, max: 2.0, step: 0.1, unit: ' s', onChange: (val) => this.handleParameterChange('duration', val) },
            { id: 'ctrl-u-tt', label: 'ความเร็วต้น (u)', key: 'u', type: 'slider', min: 0, max: 2.0, step: 0.05, unit: ' m/s', onChange: (val) => this.handleParameterChange('u', val) },
            { id: 'ctrl-a-tt', label: 'ความเร่งรถทดลอง (a)', key: 'a', type: 'slider', min: -2.0, max: 2.0, step: 0.1, unit: ' m/s²', onChange: (val) => this.handleParameterChange('a', val) },
            { id: 'ctrl-freq-tt', label: 'ความถี่เครื่องเคาะ (f)', key: 'freq', type: 'slider', min: 10, max: 50, step: 5, unit: ' Hz', onChange: (val) => this.handleParameterChange('freq', val) },
            {
              label: 'ประเภทการเคลื่อนที่ (Preset)',
              type: 'buttons',
              key: 'preset_tt',
              onChange: (val) => this.applyTTPreset(val),
              options: [
                { label: '50 Hz (เร่งความเร็ว)', value: 'lab_50' },
                { label: 'ความเร็วคงตัว (a=0)', value: 'const_v' },
                { label: 'ความหน่วง (a ติดลบ)', value: 'decel' }
              ]
            },
            {
              label: 'โหมดคำนวณวิเคราะห์',
              type: 'buttons',
              key: 'calcMode',
              onChange: (val) => { this.state.calcMode = val; this.lastFormulaCache = ''; },
              options: [
                { label: 'ความเร็ว ณ จุดหนึ่ง (v_N)', value: 'instant' },
                { label: 'ความเร็วเฉลี่ยช่วงจุด (v_avg)', value: 'average' }
              ]
            },
            { id: 'ctrl-dot-target', label: 'เลือกจุดที่ต้องการหา (จุด N)', key: 'selectedDot', type: 'slider', min: 2, max: 15, step: 1, unit: '', onChange: () => { this.lastFormulaCache = ''; } },
            { id: 'ctrl-dot-start', label: 'เลือกจุดเริ่ม (Start)', key: 'startDot', type: 'slider', min: 1, max: 14, step: 1, unit: '', onChange: () => { this.lastFormulaCache = ''; } },
            { id: 'ctrl-dot-end', label: 'เลือกจุดจบ (End)', key: 'endDot', type: 'slider', min: 2, max: 15, step: 1, unit: '', onChange: () => { this.lastFormulaCache = ''; } }
          ],
          quests: [
            { id: 'tt1', text: 'ตั้งค่าความเร่ง (a > 0) แล้วกดเริ่มจนรถวิ่งครบเวลาเพื่อสร้างแถบกระดาษ', condition: (state) => state.isFinished && state.a > 0 },
            { id: 'tt2', text: 'คลิกจิ้มเลือกจุดบนแถบกระดาษเพื่อหาความเร็ว ณ จุดนั้น (v_N)', condition: (state) => state.calcMode === 'instant' && state.selectedDot > 1 && state.dots.length >= state.selectedDot + 1 },
            { id: 'tt3', text: 'เลือกช่วงจุดเพื่อหาความเร็วเฉลี่ย (v_avg) และลองลากไม้บรรทัดเพื่อวัดระยะทาง', condition: (state) => state.calcMode === 'average' && state.endDot > state.startDot && state.dots.length >= state.endDot }
          ]
        },
        {
          id: 'horizontal',
          label: '3. การเคลื่อนที่แนวตรง',
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
            { id: 'ctrl-u-h', label: 'ความเร็วต้น / ปัจจุบัน (u)', key: 'u', type: 'slider', min: -100, max: 100, unit: ' m/s', onChange: (val) => this.handleParameterChange('u', val) },
            { id: 'ctrl-a-h', label: 'ความเร่ง (a)', key: 'a', type: 'slider', min: -50, max: 50, unit: ' m/s²', onChange: (val) => this.handleParameterChange('a', val) }
          ],
          quests: [
            { id: 'h1', text: 'ปรับความเร่ง (a) เป็น 0 เพื่อดูการเคลื่อนที่ความเร็วคงตัว (v = u)', condition: (state) => state.a === 0 && state.time > 1 },
            { id: 'h2', text: 'เร่งความเร็วให้รถมีความเร็วมากกว่า 50 m/s', condition: (state) => state.v > 50 },
            { id: 'h3', text: 'ทดลองเคลื่อนที่ให้ได้ระยะทางเกิน 500 เมตร', condition: (state) => Math.abs(state.x) > 500 }
          ]
        },
        {
          id: 'vertical',
          label: '4. การเคลื่อนที่แนวดิ่ง',
          initialState: {
            y: 0, // Displacement from start (physics: down is +)
            yBase: 100, // Visual start px
            v: 0,
            g: 9.8,
            u: -30, // Thrown upwards initially for interesting visual
            time: 0,
            history: [],
            isPaused: true,
            groundY: 5000
          },
          controls: [
            { id: 'ctrl-u-v', label: 'ความเร็วต้น / ปัจจุบัน (u) [ทิศขึ้น - / ทิศลง +]', key: 'u', type: 'slider', min: -80, max: 80, unit: ' m/s', onChange: (val) => this.handleParameterChange('u', val) },
            { id: 'ctrl-g-v', label: 'แรงโน้มถ่วง (g)', key: 'g', type: 'slider', min: 1, max: 30, step: 0.1, unit: ' m/s²', onChange: (val) => this.handleParameterChange('g', val) },
            {
              label: 'เลือกดาวเคราะห์ (Preset)',
              type: 'buttons',
              key: 'g',
              linkId: 'ctrl-g-v',
              linkUnit: ' m/s²',
              onChange: (val) => this.handleParameterChange('g', val),
              options: [
                { label: 'โลก (9.8)', value: 9.8 },
                { label: 'ดวงจันทร์ (1.6)', value: 1.6 },
                { label: 'อังคาร (3.7)', value: 3.7 },
                { label: 'พฤหัส (24.8)', value: 24.8 }
              ]
            }
          ],
          quests: [
            { id: 'v1', text: 'โยนลูกบอลขึ้นฟ้า (u ติดลบ) เพื่อสังเกตจุดสูงสุด (v = 0)', condition: (state) => state.u < 0 && Math.abs(state.v) < 1 && state.time > 0.5 },
            { id: 'v2', text: 'ปล่อยลูกบอลให้ตกถึงพื้นดิน', condition: (state) => 100 + (state.y * 5) >= state.groundY && state.time > 0 },
            { id: 'v3', text: 'ทดลองการตกเสรีบนดาวที่มีแรงโน้มถ่วงมากกว่า 20 m/s²', condition: (state) => state.g > 20 }
          ]
        },
        {
          id: 'pursuit',
          label: '5. รถ 2 คัน (การไล่กวด)',
          initialState: {
            vA: 20, // Car A constant velocity (m/s)
            aB: 4,  // Car B acceleration (m/s^2)
            xA: 0,
            xB: 0,
            vB: 0,
            time: 0,
            history: [],
            isPaused: true
          },
          controls: [
            { id: 'ctrl-vA-p', label: 'ความเร็วคงตัวรถ A (vA)', key: 'vA', type: 'slider', min: 5, max: 60, step: 1, unit: ' m/s', onChange: (val) => this.handleParameterChange('vA', val) },
            { id: 'ctrl-aB-p', label: 'ความเร่งรถ B (aB)', key: 'aB', type: 'slider', min: 1, max: 20, step: 0.5, unit: ' m/s²', onChange: (val) => this.handleParameterChange('aB', val) }
          ],
          quests: [
            { id: 'p1', text: 'กด "เริ่ม" เพื่อให้รถ B ออกตัวเร่งเครื่องตามรถ A', condition: (state) => !state.isPaused && state.time > 0.5 },
            { id: 'p2', text: 'ปล่อยให้รถ B แซงรถ A (จุดตัด sA = sB)', condition: (state) => state.xB >= state.xA && state.time > 1 },
            { id: 'p3', text: 'ปรับความเร่งรถ B (aB) ให้มากกว่า 10 m/s² เพื่อแซงได้อย่างรวดเร็ว', condition: (state) => state.aB > 10 && state.xB >= state.xA }
          ]
        }
      ]
    });

    this.carWidth = 60;
    this.carHeight = 32;
    this.ballRadius = 18;
    this.scaleFactor = 4.5; // 4.5px per meter
  }

  applyDDPreset(type) {
    if (type === 'right') {
      this.state.v = 20;
    } else if (type === 'left') {
      this.state.v = -20;
    } else if (type === 'stop') {
      this.state.v = 0;
    }
    this.state.a = 0;
    const input = document.getElementById('ctrl-v-dd');
    const valDisplay = document.getElementById('ctrl-v-dd-val');
    if (input) input.value = this.state.v;
    if (valDisplay) valDisplay.textContent = `${this.state.v} m/s`;
  }

  applyTTPreset(type) {
    if (type === 'lab_50') {
      this.state.freq = 50;
      this.state.u = 0.3;
      this.state.v = 0.3;
      this.state.a = 0.8;
      this.state.duration = 1.0;
    } else if (type === 'const_v') {
      this.state.freq = 50;
      this.state.u = 0.6;
      this.state.v = 0.6;
      this.state.a = 0;
      this.state.duration = 1.0;
    } else if (type === 'decel') {
      this.state.freq = 50;
      this.state.u = 1.2;
      this.state.v = 1.2;
      this.state.a = -0.8;
      this.state.duration = 1.0;
    }
    this.reset();
  }

  handleParameterChange(key, value) {
    const numVal = parseFloat(value);
    this.state[key] = numVal;

    if (key === 'u' || key === 'v') {
      this.state.u = numVal;
      this.state.v = numVal;
    }

    if (this.activeTabId === 'ticker_tape') {
      if (key === 'duration' || key === 'u' || key === 'a' || key === 'freq') {
        this.reset();
      }
    } else if (this.state.time === 0) {
      if (this.activeTabId === 'horizontal' || this.activeTabId === 'distance_displacement') {
        this.state.x = 0;
        this.state.distance = 0;
        this.state.displacement = 0;
        this.state.pathHistory = [];
      } else if (this.activeTabId === 'vertical') {
        this.state.v = parseFloat(this.state.u || 0);
        this.state.y = 0;
      } else if (this.activeTabId === 'pursuit') {
        this.state.xA = 0;
        this.state.xB = 0;
        this.state.vB = 0;
      }
    }
  }

  async init() {
    await super.init();
    this.setupCanvasInteraction();
  }

  setupCanvasInteraction() {
    if (!this.canvas || this.hasBoundInteraction) return;
    this.hasBoundInteraction = true;

    const getCanvasPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const onPointerDown = (e) => {
      if (this.activeTabId !== 'ticker_tape') return;
      const pos = getCanvasPos(e);

      // 1. Zoom Buttons Click Handlers (in finished mode)
      if (this.state.isFinished) {
        const btnY = 16;
        const zInX = this.width - 130;
        if (pos.y >= btnY - 5 && pos.y <= btnY + 30 && pos.x >= zInX - 10 && pos.x <= zInX + 115) {
          const relX = pos.x - zInX;
          if (relX >= 35 && relX <= 55) { // [+] Button
            this.state.tapeZoom = Math.min(3.0, (this.state.tapeZoom || 1.5) + 0.3);
            return;
          } else if (relX >= 60 && relX <= 80) { // [-] Button
            this.state.tapeZoom = Math.max(0.8, (this.state.tapeZoom || 1.5) - 0.3);
            return;
          } else if (relX >= 85) { // [↺] Reset Button
            this.state.tapeZoom = 1.5;
            this.state.tapePanX = 0;
            return;
          }
        }
      }

      // 2. Drag Wooden Ruler (Freely anywhere in 2D!)
      const rx = this.state.rulerX !== undefined ? this.state.rulerX : 80;
      const ry = this.state.rulerY !== undefined ? this.state.rulerY : this.height * 0.72;
      const rw = 340;
      const rh = 44;

      if (pos.x >= rx - 10 && pos.x <= rx + rw + 10 && pos.y >= ry - 10 && pos.y <= ry + rh + 10) {
        this.state.isDraggingRuler = true;
        this.state.dragStartX = pos.x - rx;
        this.state.dragStartY = pos.y - ry;
        return;
      }

      // 3. Pan Paper Tape when finished (or click dots!)
      if (this.state.isFinished) {
        const tapeY = this.height * 0.42;
        if (pos.y >= tapeY - 20 && pos.y <= tapeY + 70) {
          this.state.isDraggingTape = true;
          this.state.tapeDragStartX = pos.x - (this.state.tapePanX || 0);
        }
      }

      // 4. Click Dots to Select
      if (this.state.dots && this.state.dots.length > 0) {
        const dots = this.state.dots;

        if (this.state.isFinished) {
          const zoom = this.state.tapeZoom || 1.0;
          const panX = this.state.tapePanX || 0;
          const tapeY = this.height * 0.42;
          const tapeH = 44 * zoom;
          const firstDot = dots[0];
          const scaleFactorPx = 2500 * zoom;
          const tapeStartX = 60 + panX;

          dots.forEach(dot => {
            const dotPx = tapeStartX + (dot.x - firstDot.x) * scaleFactorPx;
            const dotPy = tapeY + (tapeH / 2);
            const dist = Math.hypot(pos.x - dotPx, pos.y - dotPy);
            if (dist <= 24) {
              this.selectDotInteractive(dot.index);
            }
          });
        } else {
          const ttScaleFactor = 22;
          const offset = this.state.cameraX || 0;
          const trackY = this.height * 0.65;
          const tapeY = trackY - 24;

          dots.forEach(dot => {
            const dotPx = (dot.x * ttScaleFactor) - offset;
            const dotPy = tapeY + 11;
            const dist = Math.hypot(pos.x - dotPx, pos.y - dotPy);
            if (dist <= 20) {
              this.selectDotInteractive(dot.index);
            }
          });
        }

        // Check click on Magnifier Strip
        const boxW = Math.min(360, this.width - 32);
        const boxX = (this.width - boxW) / 2;
        const boxY = 14;
        const stripX = boxX + 12;
        const stripY = boxY + 26;
        const stripW = boxW - 24;

        const recentDots = dots.slice(-10);
        if (recentDots.length >= 2) {
          const minX = recentDots[0].x;
          const maxX = recentDots[recentDots.length - 1].x;
          const rangeX = Math.max(0.1, maxX - minX);

          recentDots.forEach(dot => {
            const norm = (dot.x - minX) / rangeX;
            const dotPx = stripX + 20 + norm * (stripW - 40);
            const dotPy = stripY + 22;
            const dist = Math.hypot(pos.x - dotPx, pos.y - dotPy);
            if (dist <= 20) {
              this.selectDotInteractive(dot.index);
            }
          });
        }
      }
    };

    const onPointerMove = (e) => {
      if (this.activeTabId === 'ticker_tape') {
        const pos = getCanvasPos(e);
        if (this.state.isDraggingRuler) {
          this.state.rulerX = Math.max(0, Math.min(this.width - 340, pos.x - (this.state.dragStartX || 0)));
          this.state.rulerY = Math.max(0, Math.min(this.height - 44, pos.y - (this.state.dragStartY || 0)));
        } else if (this.state.isDraggingTape) {
          this.state.tapePanX = pos.x - (this.state.tapeDragStartX || 0);
        }
      }
    };

    const onPointerUp = () => {
      if (this.state) {
        this.state.isDraggingRuler = false;
        this.state.isDraggingTape = false;
      }
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    this.canvas.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    this.canvas.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    this.canvas.addEventListener('wheel', (e) => {
      if (this.activeTabId === 'ticker_tape' && this.state.isFinished) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        this.state.tapeZoom = Math.max(0.8, Math.min(3.0, (this.state.tapeZoom || 1.5) + delta));
      }
    }, { passive: false });
  }

  selectDotInteractive(dotIndex) {
    if (this.state.calcMode === 'instant') {
      this.state.selectedDot = dotIndex;
      const input = document.getElementById('ctrl-dot-target');
      const valDisplay = document.getElementById('ctrl-dot-target-val');
      if (input) input.value = dotIndex;
      if (valDisplay) valDisplay.textContent = `${dotIndex}`;
    } else {
      if (dotIndex < this.state.endDot) {
        this.state.startDot = dotIndex;
      } else {
        this.state.endDot = dotIndex;
      }
      const sInput = document.getElementById('ctrl-dot-start');
      const eInput = document.getElementById('ctrl-dot-end');
      if (sInput) sInput.value = this.state.startDot;
      if (eInput) eInput.value = this.state.endDot;
    }
    this.lastFormulaCache = '';
  }

  reset() {
    const currentU = this.state.u;
    const currentA = this.state.a;
    const currentG = this.state.g;
    const currentVA = this.state.vA;
    const currentAB = this.state.aB;
    const currentFreq = this.state.freq;
    const currentDuration = this.state.duration;

    super.reset();

    if (typeof currentU === 'number' && !isNaN(currentU)) this.state.u = currentU;
    if (typeof currentA === 'number' && !isNaN(currentA)) this.state.a = currentA;
    if (typeof currentG === 'number' && !isNaN(currentG)) this.state.g = currentG;
    if (typeof currentVA === 'number' && !isNaN(currentVA)) this.state.vA = currentVA;
    if (typeof currentAB === 'number' && !isNaN(currentAB)) this.state.aB = currentAB;
    if (typeof currentFreq === 'number' && !isNaN(currentFreq)) this.state.freq = currentFreq;
    if (typeof currentDuration === 'number' && !isNaN(currentDuration)) this.state.duration = currentDuration;

    this.state.time = 0;
    this.state.history = [];
    this.state.pathHistory = [];
    this.state.dots = [];
    this.state.lastDotTime = 0;
    this.state.x = 0;
    this.state.y = 0;
    this.state.distance = 0;
    this.state.displacement = 0;
    this.state.speedAvg = 0;
    this.state.velocityAvg = 0;
    this.state.v = parseFloat(this.state.u || this.state.v || 0);
    this.state.xA = 0;
    this.state.xB = 0;
    this.state.vB = 0;
    this.state.isFinished = false;

    this.controls.forEach(ctrl => {
      const input = document.getElementById(ctrl.id);
      const valDisplay = document.getElementById(`${ctrl.id}-val`);
      if (input) input.value = this.state[ctrl.key];
      if (valDisplay) valDisplay.textContent = `${this.state[ctrl.key]}${ctrl.unit || ''}`;
    });

    const graphContainer = document.getElementById('sim-graphs-container');
    if (graphContainer) graphContainer.innerHTML = '';
  }

  update(dt) {
    const seconds = 1 / 60;

    if (this.activeTabId === 'distance_displacement') {
      this.state.time += seconds;
      this.updateDistanceDisplacement(seconds);
    } else if (this.activeTabId === 'ticker_tape') {
      this.updateTickerTape(seconds);
    } else if (this.activeTabId === 'horizontal') {
      this.state.time += seconds;
      this.updateHorizontal(seconds);
    } else if (this.activeTabId === 'vertical') {
      this.state.time += seconds;
      this.updateVertical(seconds);
    } else if (this.activeTabId === 'pursuit') {
      this.state.time += seconds;
      this.updatePursuit(seconds);
    }

    const lastPt = this.state.history[this.state.history.length - 1];

    if (!lastPt || this.state.time - lastPt.time >= 0.05) {
      this.state.history.push({
        x: this.state.x || this.state.xA || 0,
        xB: this.state.xB || 0,
        y: this.state.y || 0,
        v: this.state.v || this.state.vB || 0,
        vA: this.state.vA || 0,
        time: this.state.time
      });
      if (this.state.history.length > 500) this.state.history.shift();
    }
  }

  updateDistanceDisplacement(dt) {
    const seconds = 1 / 60;
    this.state.a = 0;
    const prevX = this.state.x || 0;

    this.state.x += (this.state.v * seconds);

    // Scalar Distance: integral of |dx|
    const dx = Math.abs(this.state.x - prevX);
    this.state.distance = (this.state.distance || 0) + dx;

    // Vector Displacement: x - 0
    this.state.displacement = this.state.x;

    // Averages
    if (this.state.time > 0) {
      this.state.speedAvg = this.state.distance / this.state.time;
      this.state.velocityAvg = this.state.displacement / this.state.time;
    }

    if (!this.state.pathHistory) this.state.pathHistory = [];
    this.state.pathHistory.push(this.state.x);
    if (this.state.pathHistory.length > 600) this.state.pathHistory.shift();

    this.state.cameraX = (this.state.x * this.scaleFactor) - (this.width / 2);
  }

  updateTickerTape(dt) {
    if (this.state.isFinished) return;

    // Slow-motion visual time factor: 1 real-world sec = 10 dots (0.2s of physics time per sec)
    const visualSpeedFactor = 0.20;
    const seconds = (1 / 60) * visualSpeedFactor;
    const a = parseFloat(this.state.a) || 0;
    const u = parseFloat(this.state.u) || parseFloat(this.state.v) || 0.3;
    const freq = parseFloat(this.state.freq) || 50;
    const period = 1 / freq;
    const maxTime = parseFloat(this.state.duration) || 1.0;

    this.state.time += seconds;

    // Dot generation by exact integer period ticks (t_n = n * period)
    const targetCount = Math.floor(this.state.time / period) + 1;
    if (!this.state.dots) this.state.dots = [];

    while (this.state.dots.length < targetCount) {
      const n = this.state.dots.length;
      const t_n = n * period; // Exact physics time for dot n!
      // Exact kinematic equation: x_n = u*t_n + 0.5*a*t_n^2
      const x_n = Math.max(0, (u * t_n) + (0.5 * a * Math.pow(t_n, 2)));

      this.state.dots.push({
        index: n + 1,
        t: t_n,
        x: x_n
      });
    }

    // Trolley position & velocity
    const curT = this.state.time;
    this.state.x = Math.max(0, (u * curT) + (0.5 * a * Math.pow(curT, 2)));
    this.state.v = Math.max(0, u + a * curT);

    // Camera position with 2500px/m scale factor (25px/cm matching ruler!)
    const ttScaleFactor = 2500;
    this.state.cameraX = (this.state.x * ttScaleFactor) - (this.width * 0.35);

    // Finish experiment when reaching selected duration
    if (this.state.time >= maxTime) {
      this.state.time = maxTime;
      this.state.isPaused = true;
      this.state.isFinished = true;
      this.updatePlayPauseButton();
    }
  }

  updateHorizontal(dt) {
    const seconds = 1 / 60;
    const a = parseFloat(this.state.a) || 0;

    // Numerical step integration (allows dynamic mid-motion parameter change)
    this.state.x += (this.state.v * seconds) + (0.5 * a * Math.pow(seconds, 2));
    this.state.v += a * seconds;

    this.state.cameraX = (this.state.x * this.scaleFactor) - (this.width / 2);
  }

  updateVertical(dt) {
    const seconds = 1 / 60;
    const g = parseFloat(this.state.g) || 9.8;

    // Numerical step integration (allows dynamic mid-motion parameter change)
    this.state.y += (this.state.v * seconds) + (0.5 * g * Math.pow(seconds, 2));
    this.state.v += g * seconds;

    const visualY = (this.state.yBase || 100) + (this.state.y * this.scaleFactor);
    const groundLimit = (this.state.groundY || 5000);

    if (visualY >= groundLimit - 20 && this.state.v > 0) {
      this.state.isPaused = true;
      const maxY = (groundLimit - 20 - (this.state.yBase || 100)) / this.scaleFactor;
      this.state.y = maxY;
    }

    this.state.cameraY = visualY - (this.height / 2);
  }

  updatePursuit(dt) {
    const seconds = 1 / 60;
    const vA = parseFloat(this.state.vA) || 0;
    const aB = parseFloat(this.state.aB) || 0;

    // Car A: constant velocity
    this.state.xA += vA * seconds;

    // Car B: accelerating
    this.state.xB += (this.state.vB * seconds) + (0.5 * aB * Math.pow(seconds, 2));
    this.state.vB += aB * seconds;
    this.state.v = this.state.vB;

    const midX = (this.state.xA + this.state.xB) / 2;
    this.state.cameraX = (midX * this.scaleFactor) - (this.width / 2);
  }

  render() {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.activeTabId === 'distance_displacement') {
      this.renderDistanceDisplacement();
    } else if (this.activeTabId === 'ticker_tape') {
      this.renderTickerTape();
    } else if (this.activeTabId === 'horizontal') {
      this.renderHorizontal();
    } else if (this.activeTabId === 'vertical') {
      this.renderVertical();
    } else if (this.activeTabId === 'pursuit') {
      this.renderPursuit();
    }

    this.renderEducationalOverlay();
    this.renderVectorLegend();
    this.renderGraphsOverlay();
  }

  renderHorizontal() {
    const { ctx } = this;
    const trackY = this.height * 0.65;
    const isDark = this.canvas && this.canvas.parentElement && this.canvas.parentElement.classList.contains('dark');
    const offset = this.state.cameraX || 0;

    ctx.save();
    ctx.translate(-offset, 0);

    // Track Line
    ctx.beginPath();
    ctx.moveTo(offset - 100, trackY);
    ctx.lineTo(offset + this.width + 100, trackY);
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Distance Rulers
    ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
    ctx.font = '10px Kanit';
    const startM = Math.floor(offset / (50 * this.scaleFactor)) * 50;
    for (let i = startM - 100; i < (offset + this.width + 100) / this.scaleFactor; i += 20) {
      const px = i * this.scaleFactor;
      ctx.fillRect(px, trackY, 2, 10);
      ctx.fillText(`${i}m`, px + 4, trackY + 20);
    }

    // Car
    const carPx = (this.state.x || 0) * this.scaleFactor;
    ctx.save();
    ctx.translate(carPx, trackY - 30);

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(0, 0, 60, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(14, 24, 6, 0, Math.PI * 2);
    ctx.arc(46, 24, 6, 0, Math.PI * 2);
    ctx.fill();

    // Vectors
    this.drawArrow(ctx, 30, 4, (this.state.v || 0) * 3, 0, '#3b82f6', 'v');
    if (Math.abs(this.state.a || 0) > 0.1) {
      this.drawArrow(ctx, 30, 16, (this.state.a || 0) * 8, 0, '#ef4444', 'a');
    }

    ctx.restore();
    ctx.restore();
  }

  renderVertical() {
    const { ctx } = this;
    const isDark = this.canvas && this.canvas.parentElement && this.canvas.parentElement.classList.contains('dark');
    const startX = this.width * 0.45;
    const centerY = this.height * 0.45;
    const scale = this.scaleFactor || 4.5;
    const ballY = (this.state.y || 0);

    ctx.save();
    // Camera translates vertically so ball remains centered on screen!
    ctx.translate(0, centerY - (ballY * scale));

    // Vertical Height Grid Rulers (-200m to +500m)
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.font = '10.5px Kanit';
    ctx.lineWidth = 1;

    for (let h = -200; h <= 500; h += 10) {
      const py = h * scale;
      const isMajor = (h % 50 === 0);
      const isMid = (h % 10 === 0);

      ctx.strokeStyle = isDark ? (isMajor ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)') : (isMajor ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.05)');
      ctx.beginPath();
      ctx.moveTo(startX - (isMajor ? 80 : 30), py);
      ctx.lineTo(startX + (isMajor ? 80 : 30), py);
      ctx.stroke();

      if (isMid) {
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.fillText(`${-h}m`, startX - 115, py + 4);
      }
    }

    // Origin Starting Platform / Ground Line (y = 0)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX - 120, 0);
    ctx.lineTo(startX + 120, 0);
    ctx.stroke();
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 11px Kanit';
    ctx.fillText('จุดปล่อย/โยน (y = 0m)', startX + 130, 4);

    // Ball / Object Falling Vertical
    ctx.save();
    ctx.translate(startX, ballY * scale);

    // Ball Body
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Velocity Vector (Blue Arrow) & Gravity Vector (Red Arrow)
    const vVal = this.state.v || 0;
    const gVal = this.state.g || 9.8;
    this.drawArrow(ctx, 0, 0, 0, vVal * 2.5, '#3b82f6', `v = ${vVal.toFixed(1)} m/s`);
    this.drawArrow(ctx, 22, 0, 0, gVal * 2.5, '#ef4444', `g = ${gVal.toFixed(1)} m/s²`);

    ctx.restore();
    ctx.restore();

    // Camera Tracking Status Badge (Top Left)
    ctx.save();
    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.roundRect(14, 14, 220, 32, 8);
    ctx.fill();
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    ctx.stroke();
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 11px Kanit';
    ctx.fillText(`🎥 Camera Tracking: y = ${(-ballY).toFixed(1)} m`, 24, 34);
    ctx.restore();
  }

  renderPursuit() {
    const { ctx } = this;
    const trackY = this.height * 0.65;
    const isDark = this.canvas && this.canvas.parentElement && this.canvas.parentElement.classList.contains('dark');
    const offset = this.state.cameraX || 0;

    ctx.save();
    ctx.translate(-offset, 0);

    // Track Lines for 2 cars
    ctx.beginPath();
    ctx.moveTo(offset - 100, trackY - 20);
    ctx.lineTo(offset + this.width + 100, trackY - 20);
    ctx.moveTo(offset - 100, trackY + 20);
    ctx.lineTo(offset + this.width + 100, trackY + 20);
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Distance Rulers
    ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
    ctx.font = '10px Kanit';
    const startM = Math.floor(offset / (50 * this.scaleFactor)) * 50;
    for (let i = startM - 100; i < (offset + this.width + 100) / this.scaleFactor; i += 20) {
      const px = i * this.scaleFactor;
      ctx.fillRect(px, trackY - 35, 1, 70);
      ctx.fillText(`${i}m`, px + 4, trackY - 25);
    }

    // Car A (Constant Velocity - Blue)
    const carAPx = (this.state.xA || 0) * this.scaleFactor;
    ctx.save();
    ctx.translate(carAPx, trackY - 35);
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath(); ctx.roundRect(0, 0, 55, 20, 5); ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(12, 20, 5, 0, Math.PI * 2); ctx.arc(43, 20, 5, 0, Math.PI * 2); ctx.fill();
    this.drawArrow(ctx, 27, 4, (this.state.vA || 0) * 3, 0, '#3b82f6', 'vA');
    ctx.restore();

    // Car B (Accelerating - Emerald Green)
    const carBPx = (this.state.xB || 0) * this.scaleFactor;
    ctx.save();
    ctx.translate(carBPx, trackY + 5);
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.roundRect(0, 0, 55, 20, 5); ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(12, 20, 5, 0, Math.PI * 2); ctx.arc(43, 20, 5, 0, Math.PI * 2); ctx.fill();
    this.drawArrow(ctx, 27, 4, (this.state.vB || 0) * 3, 0, '#3b82f6', 'vB');
    if (Math.abs(this.state.aB || 0) > 0.1) {
      this.drawArrow(ctx, 27, 14, (this.state.aB || 0) * 8, 0, '#ef4444', 'aB');
    }
    ctx.restore();

    ctx.restore();
  }

  renderDistanceDisplacement() {
    const { ctx } = this;
    const trackY = this.height * 0.65;
    const isDark = this.canvas.parentElement.classList.contains('dark');
    const offset = this.state.cameraX || 0;

    ctx.save();
    ctx.translate(-offset, 0);

    // Track
    ctx.beginPath();
    ctx.moveTo(offset - 100, trackY);
    ctx.lineTo(offset + this.width + 100, trackY);
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Origin Marker Flag (x = 0)
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, trackY - 40, 4, 40);
    ctx.beginPath();
    ctx.moveTo(4, trackY - 40);
    ctx.lineTo(24, trackY - 30);
    ctx.lineTo(4, trackY - 20);
    ctx.fill();
    ctx.font = 'bold 11px Kanit';
    ctx.fillText('จุดเริ่มต้น (x=0)', 6, trackY - 44);

    // Trajectory Path (Distance Tracing: Orange Dashed Line)
    if (this.state.pathHistory && this.state.pathHistory.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.7)';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      this.state.pathHistory.forEach((xPos, i) => {
        const px = xPos * this.scaleFactor + (this.carWidth / 2);
        const py = trackY - (this.carHeight / 2) - 5;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    }

    // Displacement Vector Arrow (Straight Green Arrow from x=0 to current x)
    const currentCarPx = (this.state.x || 0) * this.scaleFactor + (this.carWidth / 2);
    const startPx = this.carWidth / 2;
    const dispY = trackY + 35;

    if (Math.abs(currentCarPx - startPx) > 5) {
      this.drawArrow(ctx, startPx, dispY, currentCarPx - startPx, 0, '#10b981', `การกระจัด s = ${(this.state.displacement || 0).toFixed(1)}m`);
    }

    // Rulers
    ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
    ctx.font = '10px Kanit';
    const startM = Math.floor(offset / (100 * this.scaleFactor)) * 100;
    for (let i = startM - 200; i < (offset + this.width + 200) / this.scaleFactor; i += 50) {
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

    // Body (Constant velocity color)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(0, 0, this.carWidth, this.carHeight, 8);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(15, this.carHeight, 7, 0, Math.PI * 2);
    ctx.arc(45, this.carHeight, 7, 0, Math.PI * 2);
    ctx.fill();

    // Pure Velocity Vector (No Acceleration in Distance/Displacement concept!)
    const cx = this.carWidth / 2;
    const cy = this.carHeight / 2;
    this.drawArrow(ctx, cx, cy, this.state.v * 3, 0, '#3b82f6', 'v');

    ctx.restore();
    ctx.restore();
  }

  renderTickerTape() {
    const { ctx } = this;
    const isDark = this.canvas && this.canvas.parentElement && this.canvas.parentElement.classList.contains('dark');

    // Finished Mode: Render Prominent Centered Pan & Zoomable Paper Tape Strip!
    if (this.state.isFinished && this.state.dots && this.state.dots.length > 0) {
      const zoom = this.state.tapeZoom || 1.5;
      const panX = this.state.tapePanX || 0;
      const tapeY = this.height * 0.42;
      const tapeH = 44 * zoom;
      const dots = this.state.dots;

      ctx.save();

      // Card Container Frame
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)';
      ctx.beginPath();
      ctx.roundRect(14, 10, this.width - 28, this.height * 0.60, 16);
      ctx.fill();
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Header Title Banner (Placed to the right of KaTeX box at x=235 so it is never covered)
      ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      ctx.font = 'bold 12.5px Kanit';
      ctx.fillText('📄 แถบกระดาษบันทึกผล (ลากเลื่อน / ซูม / จิ้มเลือกจุดได้)', 235, 32);

      // Paper Tape Clipping Region
      ctx.save();
      ctx.beginPath();
      ctx.rect(20, 48, this.width - 40, this.height * 0.50);
      ctx.clip();

      const firstDot = dots[0];
      const lastDot = dots[dots.length - 1];
      const totalDistM = (lastDot && firstDot) ? Math.max(0.1, lastDot.x - firstDot.x) : 0.5;

      // 1 cm on wooden ruler = 25px. 1 meter physics distance = 2500px at 1.0x zoom (100% exact 1:1 scale match!)
      const scaleFactorPx = 2500 * zoom;

      const tapeStartX = 60 + panX;
      const tapeEndX = tapeStartX + (totalDistM * scaleFactorPx) + 80;

      // Yellow Paper Tape Strip
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(tapeStartX - 20, tapeY, tapeEndX - tapeStartX + 40, tapeH);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.strokeRect(tapeStartX - 20, tapeY, tapeEndX - tapeStartX + 40, tapeH);

      // Highlight selected dot or range
      if (this.state.calcMode === 'instant') {
        const targetIndex = parseInt(this.state.selectedDot || 3);
        const dPrev = dots.find(d => d.index === targetIndex - 1);
        const dNext = dots.find(d => d.index === targetIndex + 1);

        if (dPrev && dNext) {
          const pPx = tapeStartX + (dPrev.x - firstDot.x) * scaleFactorPx;
          const nPx = tapeStartX + (dNext.x - firstDot.x) * scaleFactorPx;
          ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
          ctx.fillRect(pPx, tapeY + 2, nPx - pPx, tapeH - 4);
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;
          ctx.strokeRect(pPx, tapeY + 2, nPx - pPx, tapeH - 4);
        }
      } else {
        const sDot = dots.find(d => d.index === parseInt(this.state.startDot || 2));
        const eDot = dots.find(d => d.index === parseInt(this.state.endDot || 5));

        if (sDot && eDot) {
          const sPx = tapeStartX + (sDot.x - firstDot.x) * scaleFactorPx;
          const ePx = tapeStartX + (eDot.x - firstDot.x) * scaleFactorPx;
          const leftPx = Math.min(sPx, ePx);
          const wPx = Math.abs(ePx - sPx);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
          ctx.fillRect(leftPx, tapeY + 2, wPx, tapeH - 4);
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 2;
          ctx.strokeRect(leftPx, tapeY + 2, wPx, tapeH - 4);
        }
      }

      // Ink Dots
      dots.forEach((dot, idx) => {
        const dotPx = tapeStartX + (dot.x - firstDot.x) * scaleFactorPx;
        const isTarget = (this.state.calcMode === 'instant' && dot.index === parseInt(this.state.selectedDot || 3));

        // Crimson Ink Dot
        ctx.fillStyle = isTarget ? '#ef4444' : '#991b1b';
        ctx.beginPath();
        ctx.arc(dotPx, tapeY + (tapeH / 2), isTarget ? 6 * zoom : 4.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isTarget ? '#fef08a' : '#0f172a';
        ctx.lineWidth = isTarget ? 2 : 1;
        ctx.stroke();

        // Dot Index Number
        ctx.fillStyle = isTarget ? '#ef4444' : '#854d0e';
        ctx.font = isTarget ? 'bold 11px Kanit' : 'bold 10px Kanit';
        ctx.fillText(`${dot.index}`, dotPx - 4, tapeY - 6);

        // Step distance in cm between dots (Alternating Y to prevent label collision!)
        if (idx > 0) {
          const prevDot = dots[idx - 1];
          const prevPx = tapeStartX + (prevDot.x - firstDot.x) * scaleFactorPx;
          const midPx = (prevPx + dotPx) / 2;
          const dxCm = ((dot.x - prevDot.x) * 100).toFixed(1);

          const labelY = (idx % 2 === 0) ? (tapeY + tapeH + 16) : (tapeY + tapeH + 28);

          ctx.fillStyle = isDark ? '#60a5fa' : '#1e3a8a';
          ctx.font = 'bold 9.5px Kanit';
          ctx.textAlign = 'center';
          ctx.fillText(`${dxCm}cm`, midPx, labelY);
          ctx.textAlign = 'left';
        }
      });

      ctx.restore(); // end clipping

      // Zoom Control Overlay Buttons
      this.renderZoomControlButtons();

      ctx.restore();

      // 🧮 Render Velocity Calculation Window on Canvas
      this.renderCalculationOverlayBox();
      return;
    }

    // Running Animation Mode
    const trackY = this.height * 0.65;
    const ttScaleFactor = 22; // Ticker-tape visual scale factor (22px/m)
    const offset = this.state.cameraX || 0;

    ctx.save();
    ctx.translate(-offset, 0);

    // Track
    ctx.beginPath();
    ctx.moveTo(offset - 100, trackY);
    ctx.lineTo(offset + this.width + 100, trackY);
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Ticker Tape Machine (Fixed at x = -80px)
    const machineX = -80;
    const machineY = trackY - 48;
    ctx.fillStyle = '#334155';
    ctx.fillRect(machineX, machineY, 52, 48);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(machineX + 8, machineY + 8, 36, 22);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px Kanit';
    ctx.fillText(`${this.state.freq || 50} Hz`, machineX + 12, machineY + 24);

    // Hammer Vibrating Animation
    const isVibrating = !this.state.isPaused && Math.floor(this.state.time * 20) % 2 === 0;
    ctx.fillStyle = isVibrating ? '#ef4444' : '#94a3b8';
    ctx.fillRect(machineX + 40, machineY - 6, 8, 14);

    // Paper Tape (Warm Yellow Strip stretching from machine to trolley)
    const trolleyPx = (this.state.x || 0) * ttScaleFactor;
    const tapeStartPx = machineX + 48;
    const tapeWidth = Math.max(10, trolleyPx - tapeStartPx);
    const tapeY = trackY - 24;
    const tapeHeight = 22;

    ctx.fillStyle = '#fef08a'; // Rich Paper Yellow
    ctx.fillRect(tapeStartPx, tapeY, tapeWidth, tapeHeight);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tapeStartPx, tapeY, tapeWidth, tapeHeight);

    // Ink Dots on Main Paper Tape!
    if (this.state.dots && this.state.dots.length > 0) {
      this.state.dots.forEach((dot, i) => {
        const dotPx = dot.x * ttScaleFactor;
        if (dotPx >= tapeStartPx && dotPx <= trolleyPx + 30) {
          const isTarget = (this.state.calcMode === 'instant' && dot.index === parseInt(this.state.selectedDot || 3));
          
          ctx.fillStyle = isTarget ? '#ef4444' : '#991b1b';
          ctx.beginPath();
          ctx.arc(dotPx, tapeY + (tapeHeight / 2), isTarget ? 4.5 : 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = isTarget ? '#fef08a' : '#0f172a';
          ctx.lineWidth = isTarget ? 1.5 : 0.8;
          ctx.stroke();

          if ((i + 1) % 2 === 1 || i === 0 || isTarget) {
            ctx.fillStyle = isTarget ? '#ef4444' : '#854d0e';
            ctx.font = isTarget ? 'bold 10px Kanit' : 'bold 9px Kanit';
            ctx.fillText(`${i + 1}`, dotPx - 3, tapeY - 4);
          }
        }
      });
    }

    // Ruler Markings on Paper Tape
    ctx.fillStyle = '#854d0e';
    ctx.font = '9px Kanit';
    const startM = Math.floor(offset / (100 * ttScaleFactor)) * 100;
    for (let i = startM - 200; i < (offset + this.width + 200) / ttScaleFactor; i += 10) {
      const px = i * ttScaleFactor;
      ctx.fillRect(px, tapeY + tapeHeight, 1, 5);
      if (i % 50 === 0) ctx.fillText(`${i}m`, px + 2, tapeY + tapeHeight + 14);
    }

    // Laboratory Trolley Car
    ctx.save();
    ctx.translate(trolleyPx, trackY - 30);

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(0, 0, 60, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-6, 8, 8, 8);

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(14, 24, 6, 0, Math.PI * 2);
    ctx.arc(46, 24, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(14, 24, 2.5, 0, Math.PI * 2);
    ctx.arc(46, 24, 2.5, 0, Math.PI * 2);
    ctx.fill();

    this.drawArrow(ctx, 30, 4, this.state.v * 3, 0, '#3b82f6', 'v');
    if (Math.abs(this.state.a || 0) > 0.1) {
      this.drawArrow(ctx, 30, 16, (this.state.a || 0) * 8, 0, '#ef4444', 'a');
    }

    ctx.restore();
    ctx.restore();

    // 🔍 Magnified Tape Inspector Box
    this.renderTapeMagnifierOverlay();

    // 🧮 Render Velocity Calculation Window on Canvas
    this.renderCalculationOverlayBox();
  }

  renderZoomControlButtons() {
    const { ctx } = this;
    const isDark = this.canvas && this.canvas.parentElement && this.canvas.parentElement.classList.contains('dark');
    const zoom = (this.state.tapeZoom || 1.5).toFixed(1);

    const btnY = 16;
    const zInX = this.width - 130;

    ctx.save();
    ctx.font = 'bold 11px Kanit';

    ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
    ctx.beginPath();
    ctx.roundRect(zInX - 10, btnY, 115, 28, 8);
    ctx.fill();
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.fillText(`🔍 ${zoom}x  [ + ]  [ - ]  [ ↺ ]`, zInX - 4, btnY + 18);

    ctx.restore();
  }

  renderCalculationOverlayBox() {
    const { ctx } = this;
    const isDark = this.canvas && this.canvas.parentElement && this.canvas.parentElement.classList.contains('dark');
    const dots = this.state.dots || [];
    if (dots.length < 2) return;

    const boxW = Math.min(460, this.width - 32);
    const boxH = 95;
    const boxX = (this.width - boxW) / 2;
    const boxY = this.height * 0.72;
    const freq = this.state.freq || 50;
    const period = 1 / freq;

    ctx.save();
    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 14);
    ctx.fill();
    ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = 'bold 12px Kanit';

    if (this.state.calcMode === 'instant') {
      const N = parseInt(this.state.selectedDot || 3);
      const dPrev = dots.find(d => d.index === N - 1);
      const dNext = dots.find(d => d.index === N + 1);

      if (dPrev && dNext) {
        const dxM = dNext.x - dPrev.x;
        const dxCm = (dxM * 100).toFixed(1);
        const dtVal = (2 * period).toFixed(3);
        const vValM = (dxM / (2 * period)).toFixed(2);
        const vValCm = (dxCm / (2 * period)).toFixed(1);

        ctx.fillStyle = '#3b82f6';
        ctx.fillText(`⚡ การคำนวณความเร็ว ณ จุดที่ ${N} (v_${N})`, boxX + 16, boxY + 24);

        ctx.font = '11px Kanit';
        ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
        ctx.fillText(`• ช่วงจุดที่พิจารณา: จุด ${N-1} ถึง จุด ${N+1} (รวม 2 ช่อง = ${dtVal}s)`, boxX + 16, boxY + 44);
        ctx.fillText(`• ระยะทางช่วงจุด (Δx): ${dxCm} cm = ${dxM.toFixed(3)} m`, boxX + 16, boxY + 62);

        ctx.font = 'bold 12px Kanit';
        ctx.fillStyle = isDark ? '#60a5fa' : '#2563eb';
        ctx.fillText(`👉 v_${N} = Δx / Δt = ${dxCm}cm / ${dtVal}s = ${vValCm} cm/s (${vValM} m/s)`, boxX + 16, boxY + 82);
      }
    } else {
      const startN = parseInt(this.state.startDot || 2);
      const endN = parseInt(this.state.endDot || 5);
      const sDot = dots.find(d => d.index === startN);
      const eDot = dots.find(d => d.index === endN);

      if (sDot && eDot && endN > startN) {
        const numGaps = endN - startN;
        const dxM = Math.abs(eDot.x - sDot.x);
        const dxCm = (dxM * 100).toFixed(1);
        const dtVal = (numGaps * period).toFixed(3);
        const vAvgM = (dxM / (numGaps * period)).toFixed(2);
        const vAvgCm = (dxCm / (numGaps * period)).toFixed(1);

        ctx.fillStyle = '#10b981';
        ctx.fillText(`📈 การคำนวณความเร็วเฉลี่ยช่วงจุด ${startN} → ${endN} (${numGaps} ช่อง)`, boxX + 16, boxY + 24);

        ctx.font = '11px Kanit';
        ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
        ctx.fillText(`• ช่วงเวลาสะสม (Δt): ${numGaps} ช่อง × (1/${freq}) = ${dtVal} s`, boxX + 16, boxY + 44);
        ctx.fillText(`• ระยะทางรวม (Δx): ${dxCm} cm = ${dxM.toFixed(3)} m`, boxX + 16, boxY + 62);

        ctx.font = 'bold 12px Kanit';
        ctx.fillStyle = isDark ? '#34d399' : '#059669';
        ctx.fillText(`👉 v_avg = Δx / Δt = ${dxCm}cm / ${dtVal}s = ${vAvgCm} cm/s (${vAvgM} m/s)`, boxX + 16, boxY + 82);
      }
    }

    ctx.restore();
  }

  renderInteractiveRuler() {
    return; // Ruler removed per user preference
  }

  renderTapeMagnifierOverlay() {
    const { ctx } = this;
    const isDark = this.canvas.parentElement.classList.contains('dark');
    const dots = this.state.dots || [];
    if (dots.length < 2) return;

    ctx.save();
    const boxW = Math.min(360, this.width - 32);
    const boxH = 85;
    const boxX = (this.width - boxW) / 2;
    const boxY = 14;

    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.fill();
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Title & Active Mode Tag
    ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
    ctx.font = 'bold 11px Kanit';
    const modeTitle = this.state.calcMode === 'instant'
      ? `🔍 แถบขยาย (หา v ณ จุดที่ ${this.state.selectedDot || 3})`
      : `🔍 แถบขยาย (หา v_avg ช่วงจุด ${this.state.startDot || 2} → ${this.state.endDot || 5})`;
    ctx.fillText(modeTitle, boxX + 12, boxY + 18);

    // Magnified Strip Background
    const stripX = boxX + 12;
    const stripY = boxY + 26;
    const stripW = boxW - 24;
    const stripH = 46;

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(stripX, stripY, stripW, stripH);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.strokeRect(stripX, stripY, stripW, stripH);

    // Render Last 8-10 Dots Spaced Proportionally in the Magnifier Strip
    const recentDots = dots.slice(-10);
    if (recentDots.length >= 2) {
      const minX = recentDots[0].x;
      const maxX = recentDots[recentDots.length - 1].x;
      const rangeX = Math.max(0.1, maxX - minX);

      // Render highlight band behind selected dots
      if (this.state.calcMode === 'instant') {
        const targetIndex = parseInt(this.state.selectedDot || 3);
        const dPrev = recentDots.find(d => d.index === targetIndex - 1);
        const dNext = recentDots.find(d => d.index === targetIndex + 1);

        if (dPrev && dNext) {
          const pPx = stripX + 20 + ((dPrev.x - minX) / rangeX) * (stripW - 40);
          const nPx = stripX + 20 + ((dNext.x - minX) / rangeX) * (stripW - 40);
          ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
          ctx.fillRect(pPx, stripY + 2, nPx - pPx, stripH - 4);
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(pPx, stripY + 2, nPx - pPx, stripH - 4);
        }
      } else {
        const sDot = recentDots.find(d => d.index === parseInt(this.state.startDot || 2));
        const eDot = recentDots.find(d => d.index === parseInt(this.state.endDot || 5));

        if (sDot && eDot) {
          const sPx = stripX + 20 + ((sDot.x - minX) / rangeX) * (stripW - 40);
          const ePx = stripX + 20 + ((eDot.x - minX) / rangeX) * (stripW - 40);
          const leftPx = Math.min(sPx, ePx);
          const wPx = Math.abs(ePx - sPx);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
          ctx.fillRect(leftPx, stripY + 2, wPx, stripH - 4);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(leftPx, stripY + 2, wPx, stripH - 4);
        }
      }

      recentDots.forEach((dot, idx) => {
        const norm = (dot.x - minX) / rangeX;
        const dotPx = stripX + 20 + norm * (stripW - 40);
        const isTarget = (this.state.calcMode === 'instant' && dot.index === parseInt(this.state.selectedDot || 3));

        // Dot Circle
        ctx.fillStyle = isTarget ? '#ef4444' : '#991b1b';
        ctx.beginPath();
        ctx.arc(dotPx, stripY + 22, isTarget ? 5.5 : 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isTarget ? '#fef08a' : '#0f172a';
        ctx.lineWidth = isTarget ? 2 : 1;
        ctx.stroke();

        // Dot Index Number
        ctx.fillStyle = isTarget ? '#991b1b' : '#854d0e';
        ctx.font = isTarget ? 'bold 10px Kanit' : 'bold 9px Kanit';
        ctx.fillText(`${dot.index}`, dotPx - 4, stripY + 13);

        // Step Distance Label between consecutive dots (cm)
        if (idx > 0) {
          const prevDot = recentDots[idx - 1];
          const prevNorm = (prevDot.x - minX) / rangeX;
          const prevPx = stripX + 20 + prevNorm * (stripW - 40);
          const midPx = (prevPx + dotPx) / 2;
          const dxCm = ((dot.x - prevDot.x) * 100).toFixed(1); // 1m = 100cm real physics!

          ctx.fillStyle = '#1e3a8a';
          ctx.font = 'bold 8.5px Kanit';
          ctx.textAlign = 'center';
          ctx.fillText(`${dxCm}cm`, midPx, stripY + 39);
          ctx.textAlign = 'left';
        }
      });
    }

    ctx.restore();
  }

  renderEducationalOverlay() {
    const content = document.getElementById('math-formula-content');
    if (!content) return;

    const t = this.state.time.toFixed(2);
    const v = (this.state.v || 0).toFixed(2);
    const s = this.activeTabId === 'horizontal' ? (this.state.x || 0) : (this.state.y || 0);
    const sVal = s.toFixed(2);
    const dots = this.state.dots || [];
    const cacheKey = `${this.activeTabId}-${t}-${v}-${sVal}-${this.state.u}-${this.state.a}-${this.state.g}-${this.state.vA}-${this.state.aB}-${this.state.distance}-${this.state.displacement}-${this.state.freq}-${this.state.calcMode}-${this.state.selectedDot}-${this.state.startDot}-${this.state.endDot}-${dots.length}`;

    if (this.lastFormulaCache === cacheKey) return;
    this.lastFormulaCache = cacheKey;

    if (this.activeTabId === 'distance_displacement') {
      const dist = (this.state.distance || 0).toFixed(1);
      const disp = (this.state.displacement || 0).toFixed(1);
      const vAvg = (this.state.speedAvg || 0).toFixed(2);
      const vecVAvg = (this.state.velocityAvg || 0).toFixed(2);

      content.innerHTML = `
        <div class="mb-1.5">
            <div id="eq-dd-dist" class="text-orange-500 font-bold text-xs sm:text-sm"></div>
            <div id="eq-dd-disp" class="text-emerald-500 font-bold text-xs sm:text-sm mt-1"></div>
        </div>
        <div class="mb-1.5 border-t border-slate-200 dark:border-slate-800 pt-1.5 space-y-1">
            <div id="eq-dd-vavg" class="text-blue-500 text-xs font-bold"></div>
            <div id="eq-dd-vecvavg" class="text-indigo-500 text-xs font-bold"></div>
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1 font-kanit">เวลา (t): <span class="text-slate-800 dark:text-slate-200 font-bold">${t} s</span></div>
      `;
      this.renderMath('eq-dd-dist', `\\text{ระยะทาง (d)} = ${dist} \\, \\text{m}`);
      this.renderMath('eq-dd-disp', `\\text{การกระจัด (s)} = ${disp} \\, \\text{m}`);
      this.renderMath('eq-dd-vavg', `v_{\\text{avg}} = \\frac{d}{t} = \\frac{${dist}}{${t}} = ${vAvg} \\, \\text{m/s}`);
      this.renderMath('eq-dd-vecvavg', `\\vec{v}_{\\text{avg}} = \\frac{\\vec{s}}{t} = \\frac{${disp}}{${t}} = ${vecVAvg} \\, \\text{m/s}`);

    } else if (this.activeTabId === 'ticker_tape') {
      const freq = this.state.freq || 50;
      const period = 1 / freq;
      const dotCount = this.state.dots ? this.state.dots.length : 0;
      const dots = this.state.dots || [];

      if (this.state.calcMode === 'instant') {
        const N = parseInt(this.state.selectedDot || 3);
        const dPrev = dots.find(d => d.index === N - 1);
        const dNext = dots.find(d => d.index === N + 1);

        if (dPrev && dNext) {
          const dxM = dNext.x - dPrev.x;
          const dxCm = (dxM * 100).toFixed(1);
          const dtVal = (2 * period).toFixed(3);
          const vValM = (dxM / (2 * period)).toFixed(2);
          const vValCm = (dxCm / (2 * period)).toFixed(1);

          content.innerHTML = `
            <div class="mb-1 bg-blue-50 dark:bg-blue-950/40 p-2 rounded-xl border border-blue-200 dark:border-blue-800 font-kanit">
              <div class="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1">
                <span>⚡</span> หาความเร็ว ณ จุดที่ ${N} (v_${N})
              </div>
              <div id="eq-tt-inst-formula" class="text-xs"></div>
              <div id="eq-tt-inst-sub" class="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1"></div>
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1 font-kanit flex justify-between">
              <span>ความถี่: <b class="text-amber-500">${freq} Hz</b></span>
              <span>1 ช่อง = <b class="text-blue-500">${period.toFixed(3)}s</b></span>
            </div>
          `;
          this.renderMath('eq-tt-inst-formula', `v_{${N}} = \\frac{\\Delta x_{${N-1} \\to ${N+1}}}{\\Delta t} = \\frac{x_{${N+1}} - x_{${N-1}}}{2/f}`);
          this.renderMath('eq-tt-inst-sub', `v_{${N}} = \\frac{${dxCm}\\,\\text{cm}}{${dtVal}\\,\\text{s}} = ${vValCm}\\,\\text{cm/s} = ${vValM}\\,\\text{m/s}`);
        } else {
          content.innerHTML = `
            <div class="text-xs text-amber-600 dark:text-amber-400 font-kanit p-1.5">
              ⚠️ กรุณาเลือกจุดที่มีจุดก่อนหน้าและจุดถัดไป (จุด 2 ถึง ${Math.max(2, dotCount - 1)})
            </div>
          `;
        }
      } else {
        const startN = parseInt(this.state.startDot || 2);
        const endN = parseInt(this.state.endDot || 5);
        const sDot = dots.find(d => d.index === startN);
        const eDot = dots.find(d => d.index === endN);

        if (sDot && eDot && endN > startN) {
          const numGaps = endN - startN;
          const dxM = Math.abs(eDot.x - sDot.x);
          const dxCm = (dxM * 100).toFixed(1);
          const dtVal = (numGaps * period).toFixed(3);
          const vAvgM = (dxM / (numGaps * period)).toFixed(2);
          const vAvgCm = (dxCm / (numGaps * period)).toFixed(1);

          content.innerHTML = `
            <div class="mb-1 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800 font-kanit">
              <div class="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1">
                <span>📈</span> ความเร็วเฉลี่ยช่วงจุด ${startN} → ${endN} (${numGaps} ช่อง)
              </div>
              <div id="eq-tt-avg-formula" class="text-xs"></div>
              <div id="eq-tt-avg-sub" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1"></div>
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1 font-kanit flex justify-between">
              <span>ความถี่: <b class="text-amber-500">${freq} Hz</b></span>
              <span>${numGaps} ช่อง = <b class="text-emerald-500">${dtVal}s</b></span>
            </div>
          `;
          this.renderMath('eq-tt-avg-formula', `v_{\\text{avg}} = \\frac{\\Delta x_{${startN} \\to ${endN}}}{\\Delta t} = \\frac{x_{${endN}} - x_{${startN}}}{${numGaps}/f}`);
          this.renderMath('eq-tt-avg-sub', `v_{\\text{avg}} = \\frac{${dxCm}\\,\\text{cm}}{${dtVal}\\,\\text{s}} = ${vAvgCm}\\,\\text{cm/s} = ${vAvgM}\\,\\text{m/s}`);
        } else {
          content.innerHTML = `
            <div class="text-xs text-amber-600 dark:text-amber-400 font-kanit p-1.5">
              ⚠️ กรุณาเลือกช่วงจุดเริ่มต้นและจุดจบให้ถูกต้อง (จุดจบ > จุดเริ่ม)
            </div>
          `;
        }
      }

    } else if (this.activeTabId === 'horizontal') {
      const { u, a } = this.state;
      content.innerHTML = `
        <div class="mb-2">
            <div id="eq-v-symbolic"></div>
            <div id="eq-v-substituted" class="text-blue-500 dark:text-blue-400 mt-1 font-bold text-xs sm:text-sm"></div>
        </div>
        <div class="mb-2">
            <div id="eq-s-symbolic"></div>
            <div id="eq-s-substituted" class="text-green-500 dark:text-green-400 mt-1 font-bold text-xs sm:text-sm"></div>
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-200 dark:border-slate-800 pt-1.5 font-kanit">เวลา (t): <span class="text-slate-800 dark:text-slate-200 font-bold">${t} s</span></div>
      `;
      this.renderMath('eq-v-symbolic', `v = u + at`);
      this.renderMath('eq-v-substituted', `v = ${u} + (${a} \\times ${t}) = ${v} \\, \\text{m/s}`);

      this.renderMath('eq-s-symbolic', `s = ut + \\frac{1}{2}at^2`);
      this.renderMath('eq-s-substituted', `s = (${u} \\times ${t}) + \\frac{1}{2}(${a})(${t}^2) = ${sVal} \\, \\text{m}`);

    } else if (this.activeTabId === 'vertical') {
      const { u, g } = this.state;
      const uVal = Math.abs(u);
      const hMax = u < 0 ? (Math.pow(uVal, 2) / (2 * g)).toFixed(1) : null;

      content.innerHTML = `
        <div class="mb-2">
            <div id="eq-v-v-symbolic"></div>
            <div id="eq-v-v-substituted" class="text-orange-500 dark:text-orange-400 mt-1 font-bold text-xs sm:text-sm"></div>
        </div>
        <div class="mb-2">
            <div id="eq-h-v-symbolic"></div>
            <div id="eq-h-v-substituted" class="text-green-500 dark:text-green-400 mt-1 font-bold text-xs sm:text-sm"></div>
        </div>
        ${hMax ? `<div class="text-xs font-bold text-amber-500 mt-1 font-kanit">จุดสูงสุด (h_max): ${hMax} m</div>` : ''}
        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-200 dark:border-slate-800 pt-1.5 font-kanit">เวลา (t): <span class="text-slate-800 dark:text-slate-200 font-bold">${t} s</span></div>
      `;
      this.renderMath('eq-v-v-symbolic', `v = u + gt`);
      this.renderMath('eq-v-v-substituted', `v = ${u} + (${g} \\times ${t}) = ${v} \\, \\text{m/s}`);

      this.renderMath('eq-h-v-symbolic', `s = ut + \\frac{1}{2}gt^2`);
      this.renderMath('eq-h-v-substituted', `s = (${u} \\times ${t}) + \\frac{1}{2}(${g})(${t}^2) = ${sVal} \\, \\text{m}`);

    } else if (this.activeTabId === 'pursuit') {
      const { vA, aB } = this.state;
      const sA = (this.state.xA || 0).toFixed(1);
      const sB = (this.state.xB || 0).toFixed(1);
      const tCatch = ((2 * vA) / aB).toFixed(1);

      content.innerHTML = `
        <div class="mb-1.5">
            <div id="eq-p-sa"></div>
            <div id="eq-p-sb" class="mt-1"></div>
        </div>
        <div class="mb-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-kanit">
            เวลาแซงกัน (t_แซง = 2v_A / a_B): <span class="font-mono text-sm">${tCatch} s</span>
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-200 dark:border-slate-800 pt-1.5 font-kanit">เวลาสะสม (t): <span class="text-slate-800 dark:text-slate-200 font-bold">${t} s</span></div>
      `;
      this.renderMath('eq-p-sa', `s_A = v_A t = ${vA} \\times ${t} = ${sA} \\, \\text{m}`);
      this.renderMath('eq-p-sb', `s_B = \\frac{1}{2}a_B t^2 = \\frac{1}{2}(${aB})(${t}^2) = ${sB} \\, \\text{m}`);
    }
  }

  renderVectorLegend() {
    const { ctx } = this;
    const isDark = this.canvas && this.canvas.parentElement && this.canvas.parentElement.classList.contains('dark');

    ctx.save();
    ctx.font = 'bold 10px Kanit';

    const lx = 14;
    const ly = this.height - 14;

    // Vector v (Blue)
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(lx, ly - 8, 12, 3);
    ctx.fillStyle = isDark ? '#cbd5e1' : '#475569';
    ctx.fillText('v (ความเร็ว)', lx + 16, ly - 5);

    // Vector a (Red) / Vector s (Green)
    if (this.activeTabId !== 'distance_displacement') {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(lx + 85, ly - 8, 12, 3);
      ctx.fillStyle = isDark ? '#cbd5e1' : '#475569';
      ctx.fillText('a (ความเร่ง)', lx + 101, ly - 5);
    } else {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(lx + 85, ly - 8, 12, 3);
      ctx.fillStyle = isDark ? '#cbd5e1' : '#475569';
      ctx.fillText('s (การกระจัด)', lx + 101, ly - 5);
    }

    ctx.restore();
  }

  renderGraphsOverlay() {
    const container = document.getElementById('sim-graphs-container');
    if (!container) return;

    if (container.children.length === 0) {
      container.innerHTML = `
            <div id="sim-graph-card" class="w-[calc(100vw-2rem)] max-w-xs sm:max-w-sm md:max-w-md p-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl pointer-events-auto transition-all duration-300">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold font-kanit text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                        กราฟวิเคราะห์ (Real-time)
                    </span>
                    <div class="flex items-center gap-1.5 font-kanit">
                        <button id="sim-expand-graphs-btn" class="text-[10px] text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors">
                            ขยาย
                        </button>
                        <button id="sim-toggle-graphs-btn" class="text-[10px] text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 transition-colors">
                            ซ่อน
                        </button>
                    </div>
                </div>
                <div id="sim-graphs-body" class="space-y-2.5">
                    <canvas id="graph-v-t" class="w-full h-36 sm:h-40 block rounded-xl"></canvas>
                    <canvas id="graph-s-t" class="w-full h-36 sm:h-40 block rounded-xl"></canvas>
                </div>
            </div>
        `;

      const card = document.getElementById('sim-graph-card');
      const expandBtn = document.getElementById('sim-expand-graphs-btn');
      const toggleBtn = document.getElementById('sim-toggle-graphs-btn');
      const body = document.getElementById('sim-graphs-body');

      if (expandBtn && card) {
        let isExpanded = false;
        expandBtn.onclick = () => {
          isExpanded = !isExpanded;
          if (isExpanded) {
            card.classList.replace('max-w-xs', 'max-w-md');
            card.classList.replace('sm:max-w-sm', 'sm:max-w-lg');
            card.classList.replace('md:max-w-md', 'md:max-w-xl');
            expandBtn.textContent = 'ย่อ';
          } else {
            card.classList.replace('max-w-md', 'max-w-xs');
            card.classList.replace('sm:max-w-lg', 'sm:max-w-sm');
            card.classList.replace('md:max-w-xl', 'md:max-w-md');
            expandBtn.textContent = 'ขยาย';
          }
        };
      }

      if (toggleBtn && body) {
        toggleBtn.onclick = () => {
          const isHidden = body.classList.toggle('hidden');
          toggleBtn.textContent = isHidden ? 'แสดง' : 'ซ่อน';
        };
      }
    }

    if (this.activeTabId === 'distance_displacement') {
      this.drawGraphOnElement('graph-v-t', 'v', '#3b82f6', 'v-t (ความเร็ว-เวลา)', 'v (m/s)', 't (s)', 'm/s', 's', true);
      this.drawGraphOnElement('graph-s-t', 'x', '#10b981', 's-t (การกระจัด-เวลา)', 's (m)', 't (s)', 'm', 's', false);
    } else if (this.activeTabId === 'ticker_tape') {
      this.drawGraphOnElement('graph-v-t', 'v', '#3b82f6', 'v-t (ความเร็วถบกระดาษ)', 'v (m/s)', 't (s)', 'm/s', 's', true);
      this.drawGraphOnElement('graph-s-t', 'x', '#10b981', 's-t (ระยะทางถบกระดาษ)', 's (m)', 't (s)', 'm', 's', false);
    } else if (this.activeTabId === 'pursuit') {
      this.drawGraphOnElement('graph-v-t', 'v', '#3b82f6', 'vB-t (ความเร็วรถ B)', 'vB (m/s)', 't (s)', 'm/s', 's', true);
      this.drawGraphOnElement('graph-s-t', 'xB', '#10b981', 'sB-t (ระยะทางรถ B)', 'sB (m)', 't (s)', 'm', 's', false);
    } else {
      this.drawGraphOnElement('graph-v-t', 'v', '#3b82f6', 'v-t (ความเร็ว-เวลา)', 'v (m/s)', 't (s)', 'm/s', 's', true);
      const posKey = this.activeTabId === 'horizontal' ? 'x' : 'y';
      const label = this.activeTabId === 'horizontal' ? 's (m)' : 'h (m)';
      this.drawGraphOnElement('graph-s-t', posKey, '#10b981', `${label} - t`, label, 't (s)', 'm', 's', false);
    }
  }

  drawGraphOnElement(canvasId, key, color, title, yLabel, xLabel, yUnit, xUnit, shadeArea = false) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || this.state.history.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 280;
    const h = rect.height || 140;

    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }

    const ctx = canvas.getContext('2d');
    const isDark = this.canvas.parentElement.classList.contains('dark');

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const ax = 48;
    const ay = h - 25;
    const graphW = w - ax - 16;
    const graphH = h - 48;

    // Title & Legend Tag
    ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
    ctx.font = 'bold 11px Kanit';
    ctx.fillText(title, 8, 14);

    const pts = this.state.history;
    const vals = pts.map(pt => pt[key]);
    const times = pts.map(pt => pt.time);
    const minT = times[0];
    const maxT = times[times.length - 1];
    const rangeT = Math.max(0.1, maxT - minT);

    let minV = Math.min(...vals);
    let maxV = Math.max(...vals);
    if (minV >= 0) minV = 0;
    if (maxV <= 0) maxV = 0;
    const valRange = maxV - minV;
    maxV += valRange * 0.1;
    minV -= valRange * 0.1;
    const rangeV = Math.max(0.1, maxV - minV);

    // Grid Lines (4 Horizontal & 4 Vertical)
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const gy = ay - (i / 4) * graphH;
      ctx.beginPath(); ctx.moveTo(ax, gy); ctx.lineTo(w - 10, gy); ctx.stroke();
    }
    for (let i = 0; i <= 4; i++) {
      const gx = ax + (i / 4) * graphW;
      ctx.beginPath(); ctx.moveTo(gx, ay - graphH); ctx.lineTo(gx, ay); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(ax, ay - graphH - 2); ctx.lineTo(ax, ay); ctx.lineTo(w - 10, ay);
    ctx.stroke();

    // Value Labels
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '9px Kanit';
    ctx.fillText(maxV.toFixed(0), ax - 38, ay - graphH + 4);
    ctx.fillText(minV.toFixed(0), ax - 38, ay);

    // Axis Labels
    ctx.fillStyle = color;
    ctx.font = 'bold 9.5px Kanit';
    ctx.fillText(yLabel, ax - 38, ay - graphH - 8);

    // Zero Line
    let zeroY = ay;
    if (minV < 0 && maxV > 0) {
      zeroY = ay - ((0 - minV) / rangeV) * graphH;
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)';
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(ax, zeroY); ctx.lineTo(w - 10, zeroY); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Area Shading under v-t curve (พื้นที่ใต้กราฟ v-t = การขจัด s)
    if (shadeArea && pts.length > 1) {
      ctx.save();
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const px = ax + ((pt.time - minT) / rangeT) * graphW;
        const py = ay - ((pt[key] - minV) / rangeV) * graphH;
        if (i === 0) ctx.moveTo(px, zeroY);
        ctx.lineTo(px, py);
        if (i === pts.length - 1) ctx.lineTo(px, zeroY);
      });
      ctx.closePath();
      ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.22)' : 'rgba(59, 130, 246, 0.15)';
      ctx.fill();
      ctx.restore();
    }

    // Plot Data
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';

    pts.forEach((pt, i) => {
      const px = ax + ((pt.time - minT) / rangeT) * graphW;
      const py = ay - ((pt[key] - minV) / rangeV) * graphH;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Latest Value Indicator
    const lastVal = vals[vals.length - 1];
    ctx.fillStyle = color;
    ctx.font = 'bold 10.5px Kanit';
    ctx.textAlign = 'right';
    ctx.fillText(`${lastVal.toFixed(1)} ${yUnit}`, w - 10, 14);
    ctx.textAlign = 'left';

    ctx.restore();
  }

  drawArrow(ctx, x, y, dx, dy, color = '#3b82f6', label = '') {
    const len = Math.hypot(dx, dy);
    if (len < 1) return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    const angle = Math.atan2(dy, dx);
    const headLen = Math.min(10, Math.max(6, len * 0.2));

    // Arrow Shaft
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();

    // Arrow Head
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(x + dx - headLen * Math.cos(angle - Math.PI / 6), y + dy - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x + dx - headLen * Math.cos(angle + Math.PI / 6), y + dy - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Vector Label
    if (label) {
      ctx.font = 'bold 11px Kanit';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, x + (dx / 2), y + (dy / 2) - 4);
    }

    ctx.restore();
  }
}


