import { authManager } from '../auth-manager.js';

/**
 * BaseSimulation: The foundation for all interactive simulations.
 * Handles lifecycle, UI overlays, and quest management.
 * Now includes support for Modes (Tabs) and KaTeX overlays.
 */
export class BaseSimulation {
  constructor(config = {}) {
    this.id = config.id || 'base-sim';
    this.title = config.title || 'Simulation';
    this.description = config.description || '';
    this.containerId = config.containerId || 'sim-container';
    this.canvas = null;
    this.ctx = null;
    this.width = 800; // Logical CSS width
    this.height = 500; // Logical CSS height
    this.isActive = false;
    this.quests = config.quests || [];
    this.completedQuests = new Set();
    this.lastFormulaCache = '';

    // Tab/Mode Configuration
    this.tabs = config.tabs || []; // Array of { id, label, initialState, quests, controls }
    this.activeTabId = this.tabs.length > 0 ? this.tabs[0].id : null;

    // Simulation State
    const activeTabData = this.tabs.find(t => t.id === this.activeTabId) || {};
    this.initialState = activeTabData.initialState || config.initialState || {};
    this.state = JSON.parse(JSON.stringify(this.initialState));
    this.controls = activeTabData.controls || config.controls || [];
    this.quests = activeTabData.quests || config.quests || [];

    // Hooks
    this.onCompleteAllQuests = config.onCompleteAllQuests || null;
  }

  /**
   * Initializes the simulation, creates the canvas, and sets up UI.
   */
  async init() {
    console.log(`Initializing Simulation: ${this.title}`);
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container #${this.containerId} not found.`);
      return;
    }

    // Setup UI Layout
    this.setupLayout(container);
    this.setupCanvas();
    this.setupControls();
    this.setupQuestUI();
    this.setupTabs();

    this.isActive = true;
    this.startLoop();
  }

  setupLayout(container) {
    container.innerHTML = `
            <div class="flex flex-col gap-4 h-full max-h-[90vh]">
                <!-- Header with Tabs -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-2xl font-bold font-kanit text-slate-800 dark:text-slate-200">${this.title}</h2>
                        <p class="text-sm text-slate-500 dark:text-slate-400">${this.description}</p>
                    </div>
                    <div id="sim-tabs-container" class="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
                </div>

                <div class="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
                    <!-- Main Simulation Area -->
                    <div class="flex-grow relative bg-slate-50 dark:bg-slate-900/20 rounded-3xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 min-h-[380px]">
                        <canvas id="sim-canvas" class="w-full h-full block"></canvas>
                        
                        <!-- KaTeX Formula Overlay -->
                        <div id="sim-formula-overlay" class="absolute top-4 left-4 max-w-[280px] sm:max-w-xs p-3 sm:p-4 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-lg pointer-events-auto transition-all duration-300">
                            <div id="math-formula-content" class="space-y-2"></div>
                        </div>

                        <!-- Mini Graphs Container (Floating Responsive) -->
                        <div id="sim-graphs-container" class="absolute top-4 right-4 pointer-events-none z-10"></div>
                    </div>

                    <!-- Control & Quest Sidebar -->
                    <div class="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto pr-1">
                        <!-- Controls Card -->
                        <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                            <h3 class="font-kanit font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                 เครื่องมือควบคุม
                            </h3>
                            <div id="sim-controls-container" class="space-y-4"></div>
                            <div class="pt-2 flex gap-2">
                                <button id="sim-reset-btn" class="flex-grow py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold font-kanit text-sm transition-all active:scale-95">รีเซ็ต</button>
                                <button id="sim-play-pause-btn" class="flex-grow py-3 px-4 rounded-xl font-bold font-kanit text-sm transition-all active:scale-95 shadow-lg"></button>
                            </div>
                        </div>

                        <!-- Quests Card -->
                        <div class="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-sm flex flex-col gap-3">
                            <div class="flex items-center justify-between">
                                <h3 class="font-kanit font-bold text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    ภารกิจเรียนรู้
                                </h3>
                                <span id="quest-counter-badge" class="text-xs font-bold font-kanit px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                                    0/${this.quests.length}
                                </span>
                            </div>
                            <div id="sim-quests-container" class="space-y-2.5"></div>
                        </div>

                        <!-- 5 Formulas Reference Card -->
                        <div class="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-3xl border border-amber-200/60 dark:border-amber-900/30 shadow-sm">
                            <details class="group">
                                <summary class="cursor-pointer font-kanit font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center justify-between">
                                    <span class="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                        สรุป 5 สูตรการเคลื่อนที่ (ม.4)
                                    </span>
                                    <span class="text-amber-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div class="mt-3 text-xs space-y-1.5 font-mono text-slate-700 dark:text-slate-300 border-t border-amber-200/50 dark:border-amber-900/30 pt-2">
                                    <div class="p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg flex justify-between"><span>1. v = u + at</span><span class="text-[10px] text-slate-400 font-kanit">(ไม่มี s)</span></div>
                                    <div class="p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg flex justify-between"><span>2. s = ut + ½at²</span><span class="text-[10px] text-slate-400 font-kanit">(ไม่มี v)</span></div>
                                    <div class="p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg flex justify-between"><span>3. s = vt - ½at²</span><span class="text-[10px] text-slate-400 font-kanit">(ไม่มี u)</span></div>
                                    <div class="p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg flex justify-between"><span>4. s = ((u+v)/2)t</span><span class="text-[10px] text-slate-400 font-kanit">(ไม่มี a)</span></div>
                                    <div class="p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg flex justify-between"><span>5. v² = u² + 2as</span><span class="text-[10px] text-slate-400 font-kanit">(ไม่มี t)</span></div>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        `;

    this.updatePlayPauseButton();
  }

  updatePlayPauseButton() {
    const playPauseBtn = document.getElementById('sim-play-pause-btn');
    if (!playPauseBtn) return;

    if (this.state.isFinished) {
      playPauseBtn.textContent = 'เริ่มใหม่';
      playPauseBtn.className = 'flex-grow py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold font-kanit text-sm transition-all active:scale-95 shadow-lg shadow-amber-500/20';
    } else {
      playPauseBtn.textContent = this.state.isPaused ? 'เริ่ม' : 'หยุด';
      playPauseBtn.className = this.state.isPaused
        ? 'flex-grow py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold font-kanit text-sm transition-all active:scale-95 shadow-lg shadow-green-500/20'
        : 'flex-grow py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold font-kanit text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/20';
    }

    playPauseBtn.onclick = () => {
      if (this.state.isFinished) {
        this.reset();
        this.state.isPaused = false;
      } else {
        this.state.isPaused = !this.state.isPaused;
      }
      this.updatePlayPauseButton();
    };

    const resetBtn = document.getElementById('sim-reset-btn');
    if (resetBtn) resetBtn.onclick = () => this.reset();
  }

  setupTabs() {
    const container = document.getElementById('sim-tabs-container');
    if (!container || this.tabs.length === 0) {
      if (container) container.style.display = 'none';
      return;
    }

    container.innerHTML = this.tabs.map(tab => `
        <button data-tab-id="${tab.id}" class="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold font-kanit transition-all ${this.activeTabId === tab.id ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}">
            ${tab.label}
        </button>
    `).join('');

    container.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => this.switchTab(btn.dataset.tabId);
    });
  }

  switchTab(tabId) {
    if (this.activeTabId === tabId) return;
    this.activeTabId = tabId;
    const tabData = this.tabs.find(t => t.id === tabId);

    this.initialState = tabData.initialState || {};
    this.controls = tabData.controls || [];
    this.quests = tabData.quests || [];
    this.lastFormulaCache = '';
    this.reset();

    this.setupTabs();
    this.setupControls();
    this.setupQuestUI();
  }

  setupCanvas() {
    this.canvas = document.getElementById('sim-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    if (window.ResizeObserver && this.canvas.parentElement) {
      const ro = new ResizeObserver(() => this.resizeCanvas());
      ro.observe(this.canvas.parentElement);
    } else {
      window.addEventListener('resize', () => this.resizeCanvas());
    }

    this.resizeCanvas();
  }

  resizeCanvas() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = window.devicePixelRatio || 1;

    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset scale transform
    this.ctx.scale(dpr, dpr);
  }

  setupControls() {
    const container = document.getElementById('sim-controls-container');
    if (!container) return;

    container.innerHTML = '';
    this.controls.forEach(control => {
      const div = document.createElement('div');
      div.className = 'space-y-1.5';

      if (control.type === 'slider') {
        const step = control.step || 1;
        div.innerHTML = `
            <div class="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <label for="${control.id}">${control.label}</label>
                <span id="${control.id}-val" class="text-blue-600 dark:text-blue-400 font-mono">${this.state[control.key]}${control.unit || ''}</span>
            </div>
            <div class="flex items-center gap-2">
                <button class="sim-stepper-btn px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors" data-action="dec">
                    -
                </button>
                <input type="range" id="${control.id}" min="${control.min}" max="${control.max}" step="${step}" value="${this.state[control.key]}" 
                       class="flex-grow h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600">
                <button class="sim-stepper-btn px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors" data-action="inc">
                    +
                </button>
            </div>
        `;

        const input = div.querySelector('input');
        const updateVal = (val) => {
          const numVal = parseFloat(val);
          this.state[control.key] = numVal;
          input.value = numVal;
          const valDisplay = document.getElementById(`${control.id}-val`);
          if (valDisplay) valDisplay.textContent = `${numVal}${control.unit || ''}`;
          if (control.onChange) control.onChange(numVal);
          this.refreshOptionButtons();
        };

        input.oninput = (e) => updateVal(e.target.value);

        div.querySelectorAll('.sim-stepper-btn').forEach(btn => {
          btn.onclick = () => {
            let current = parseFloat(input.value);
            if (btn.dataset.action === 'dec') current -= step;
            else current += step;

            current = Math.min(Math.max(current, control.min), control.max);
            updateVal(current);
          };
        });
      } else if (control.type === 'buttons') {
        div.innerHTML = `
            <div class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">${control.label}</div>
            <div class="flex flex-wrap gap-1.5" data-control-key="${control.key}">
                ${control.options.map(opt => {
          const rawOptVal = opt.value;
          const optVal = (typeof rawOptVal === 'number' || (typeof rawOptVal === 'string' && !isNaN(Number(rawOptVal)) && rawOptVal.trim() !== '')) ? parseFloat(rawOptVal) : rawOptVal;
          const currentVal = this.state[control.key];
          const isSelected = (typeof optVal === 'number' && typeof currentVal === 'number' && !isNaN(optVal) && !isNaN(currentVal))
            ? Math.abs(optVal - currentVal) < 0.01
            : String(optVal) === String(currentVal);
          const btnClass = isSelected
            ? 'px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[11px] font-bold transition-all border border-blue-600 shadow-sm'
            : 'px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all border border-slate-200 dark:border-slate-700';
          return `<button data-val="${opt.value}" class="${btnClass}">${opt.label}</button>`;
        }).join('')}
            </div>
        `;
        div.querySelectorAll('button').forEach(btn => {
          btn.onclick = () => {
            const rawVal = btn.dataset.val;
            const val = (typeof rawVal === 'string' && !isNaN(Number(rawVal)) && rawVal.trim() !== '') ? parseFloat(rawVal) : rawVal;
            this.state[control.key] = val;

            const linkedSlider = document.getElementById(control.linkId);
            if (linkedSlider) {
              linkedSlider.value = val;
              const valDisplay = document.getElementById(`${control.linkId}-val`);
              if (valDisplay) valDisplay.textContent = `${val}${control.linkUnit || ''}`;
            }
            this.refreshOptionButtons();
            if (control.onChange) control.onChange(val);
          };
        });
      }
      container.appendChild(div);
    });
  }

  refreshOptionButtons() {
    this.controls.filter(c => c.type === 'buttons').forEach(control => {
      const parent = document.querySelector(`[data-control-key="${control.key}"]`);
      if (!parent) return;
      const currentVal = this.state[control.key];
      parent.querySelectorAll('button').forEach(btn => {
        const rawVal = btn.dataset.val;
        const val = (typeof rawVal === 'string' && !isNaN(Number(rawVal)) && rawVal.trim() !== '') ? parseFloat(rawVal) : rawVal;
        const isSelected = (typeof val === 'number' && typeof currentVal === 'number' && !isNaN(val) && !isNaN(currentVal))
          ? Math.abs(val - currentVal) < 0.01
          : String(val) === String(currentVal);
        btn.className = isSelected
          ? 'px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[11px] font-bold transition-all border border-blue-600 shadow-sm'
          : 'px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all border border-slate-200 dark:border-slate-700';
      });
    });
  }

  setupQuestUI() {
    const container = document.getElementById('sim-quests-container');
    const counterBadge = document.getElementById('quest-counter-badge');
    if (!container) return;

    this.completedQuests.clear();
    if (counterBadge) counterBadge.textContent = `0/${this.quests.length}`;

    container.innerHTML = this.quests.map((q, i) => `
            <div id="quest-${i}" class="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all flex items-start gap-3 shadow-xs">
                <div class="quest-checkbox w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 transition-all mt-0.5">
                    <svg class="w-3.5 h-3.5 text-white scale-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p class="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-snug">${q.text}</p>
            </div>
        `).join('');
  }

  updateQuestStatus(index, isCompleted) {
    if (isCompleted && !this.completedQuests.has(index)) {
      this.completedQuests.add(index);
      const el = document.getElementById(`quest-${index}`);
      if (el) {
        el.classList.add('border-green-200', 'bg-green-50/60', 'dark:border-green-900/30', 'dark:bg-green-900/10');
        const checkbox = el.querySelector('.quest-checkbox');
        if (checkbox) {
          checkbox.classList.replace('border-slate-200', 'bg-green-500');
          checkbox.classList.add('border-green-500');
          const svg = checkbox.querySelector('svg');
          if (svg) svg.classList.remove('scale-0');
        }
      }

      const counterBadge = document.getElementById('quest-counter-badge');
      if (counterBadge) {
        counterBadge.textContent = `${this.completedQuests.size}/${this.quests.length}`;
        if (this.completedQuests.size === this.quests.length) {
          counterBadge.classList.replace('bg-blue-100', 'bg-green-100');
          counterBadge.classList.replace('text-blue-600', 'text-green-600');
        }
      }

      if (this.completedQuests.size === this.quests.length) {
        if (this.onCompleteAllQuests) {
          this.onCompleteAllQuests();
        } else {
          this.showCelebrationBanner();
        }
      }
    }
  }

  showCelebrationBanner() {
    const container = document.getElementById('sim-quests-container');
    if (!container || document.getElementById('sim-quest-celebration')) return;

    const banner = document.createElement('div');
    banner.id = 'sim-quest-celebration';
    banner.className = 'p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-kanit font-bold text-xs text-center shadow-md animate-bounce mt-2';
    banner.innerHTML = `🎉 ยินดีด้วย! คุณทำครบทุกภารกิจในโหมดนี้สำเร็จแล้ว`;
    container.appendChild(banner);
  }

  /**
   * Renders a math formula in the overlay using KaTeX.
   */
  renderMath(elementId, latex) {
    const el = document.getElementById(elementId);
    if (!el || !window.katex) return;
    try {
      window.katex.render(latex, el, {
        throwOnError: false,
        displayMode: true
      });
    } catch (err) {
      console.error("KaTeX Error:", err);
    }
  }

  startLoop() {
    const loop = (time) => {
      if (!this.isActive) return;

      if (!this.state.isPaused) {
        this.update(time);
        this.checkQuests();
      }

      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update(time) { }
  render() { }

  checkQuests() {
    this.quests.forEach((q, i) => {
      if (!this.completedQuests.has(i) && q.condition(this.state)) {
        this.updateQuestStatus(i, true);
      }
    });
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(this.initialState));
    this.completedQuests.clear();
    this.lastFormulaCache = '';
    this.setupQuestUI();
    this.updatePlayPauseButton();
    this.refreshOptionButtons();
  }

  destroy() {
    this.isActive = false;
  }
}

