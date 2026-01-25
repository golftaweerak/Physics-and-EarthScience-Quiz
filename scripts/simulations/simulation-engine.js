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
    this.isActive = false;
    this.quests = config.quests || [];
    this.completedQuests = new Set();

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
                    <div class="flex-grow relative bg-slate-50 dark:bg-slate-900/20 rounded-3xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800">
                        <canvas id="sim-canvas" class="w-full h-full block"></canvas>
                        
                        <!-- KaTeX Formula Overlay -->
                        <div id="sim-formula-overlay" class="absolute top-4 left-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-lg pointer-events-auto transform transition-all duration-300">
                            <div id="math-formula-content" class="space-y-3"></div>
                        </div>

                        <!-- Mini Graphs Container (Floating) -->
                        <div id="sim-graphs-container" class="absolute top-4 right-4 flex flex-col gap-4 pointer-events-none"></div>
                    </div>

                    <!-- Control & Quest Sidebar -->
                    <div class="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto pr-1">
                        <!-- Controls Card -->
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
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
                        <div class="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-sm flex flex-col gap-4">
                            <h3 class="font-kanit font-bold text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ภารกิจเรียนรู้
                            </h3>
                            <div id="sim-quests-container" class="space-y-3"></div>
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

    playPauseBtn.textContent = this.state.isPaused ? 'เริ่ม' : 'หยุด';
    playPauseBtn.className = this.state.isPaused
      ? 'flex-grow py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold font-kanit text-sm transition-all active:scale-95 shadow-lg shadow-green-500/20'
      : 'flex-grow py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold font-kanit text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/20';

    playPauseBtn.onclick = () => {
      this.state.isPaused = !this.state.isPaused;
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
        <button data-tab-id="${tab.id}" class="px-6 py-2 rounded-xl text-sm font-bold font-kanit transition-all ${this.activeTabId === tab.id ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}">
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
    this.reset();

    this.setupTabs();
    this.setupControls();
    this.setupQuestUI();
  }

  setupCanvas() {
    this.canvas = document.getElementById('sim-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
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
                <button class="sim-stepper-btn px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors" data-action="dec">
                    -
                </button>
                <input type="range" id="${control.id}" min="${control.min}" max="${control.max}" step="${step}" value="${this.state[control.key]}" 
                       class="flex-grow h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600">
                <button class="sim-stepper-btn px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors" data-action="inc">
                    +
                </button>
            </div>
        `;

        const input = div.querySelector('input');
        const updateVal = (val) => {
          const numVal = parseFloat(val);
          this.state[control.key] = numVal;
          input.value = numVal;
          document.getElementById(`${control.id}-val`).textContent = `${numVal}${control.unit || ''}`;
          if (control.onChange) control.onChange(numVal);
        };

        input.oninput = (e) => updateVal(e.target.value);

        div.querySelectorAll('.sim-stepper-btn').forEach(btn => {
          btn.onclick = () => {
            let current = parseFloat(input.value);
            if (btn.dataset.action === 'dec') current -= step;
            else current += step;

            // Clamp
            current = Math.min(Math.max(current, control.min), control.max);
            updateVal(current);
          };
        });
      } else if (control.type === 'buttons') {
        div.innerHTML = `
            <div class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">${control.label}</div>
            <div class="flex flex-wrap gap-2">
                ${control.options.map(opt => `
                    <button data-val="${opt.value}" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-[10px] font-bold transition-all border border-slate-200 dark:border-slate-700">
                        ${opt.label}
                    </button>
                `).join('')}
            </div>
        `;
        div.querySelectorAll('button').forEach(btn => {
          btn.onclick = () => {
            const val = parseFloat(btn.dataset.val);
            this.state[control.key] = val;
            // Update linked slider if exists
            const linkedSlider = document.getElementById(control.linkId);
            if (linkedSlider) {
              linkedSlider.value = val;
              const valDisplay = document.getElementById(`${control.linkId}-val`);
              if (valDisplay) valDisplay.textContent = `${val}${control.linkUnit || ''}`;
            }
            if (control.onChange) control.onChange(val);
          };
        });
      }
      container.appendChild(div);
    });
  }

  setupQuestUI() {
    const container = document.getElementById('sim-quests-container');
    if (!container) return;

    this.completedQuests.clear();
    container.innerHTML = this.quests.map((q, i) => `
            <div id="quest-${i}" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all flex items-start gap-4">
                <div class="quest-checkbox w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 transition-all">
                    <svg class="w-4 h-4 text-white scale-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p class="text-sm font-medium text-slate-600 dark:text-slate-400 leading-snug">${q.text}</p>
            </div>
        `).join('');
  }

  updateQuestStatus(index, isCompleted) {
    if (isCompleted && !this.completedQuests.has(index)) {
      this.completedQuests.add(index);
      const el = document.getElementById(`quest-${index}`);
      if (el) {
        el.classList.add('border-green-200', 'bg-green-50/50', 'dark:border-green-900/30', 'dark:bg-green-900/10');
        el.querySelector('.quest-checkbox').classList.replace('border-slate-200', 'bg-green-500');
        el.querySelector('.quest-checkbox').classList.add('border-green-500');
        el.querySelector('svg').classList.remove('scale-0');
      }

      if (this.completedQuests.size === this.quests.length && this.onCompleteAllQuests) {
        this.onCompleteAllQuests();
      }
    }
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
    this.setupQuestUI();
    this.updatePlayPauseButton();
  }

  destroy() {
    this.isActive = false;
  }
}
