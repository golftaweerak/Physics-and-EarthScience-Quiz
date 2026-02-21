/**
 * Scientific Calculator - Advanced Generic Style
 * Features: Natural Display, SOLVE, Calculus (Diff/Int), STO/RCL, ENG
 */

export class ScientificCalculator {
  constructor() {
    this.container = null;
    this.display = null;
    this.history = [];
    this.isOpen = false;
    this.historyIndex = -1; // -1 = current (new), 0..N = historical item
    this.isDegreeMode = true; // Default to DEG

    // Modes
    this.isShift = false;
    this.isAlpha = false;
    this.isStore = false; // STO mode

    // Variables storage
    this.variables = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, x: 0, y: 0, M: 0 };

    // Dragging
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.modalX = 0;
    this.modalY = 0;

    this.rawExpression = '';
    this.currentResult = null;
    this.resultFormat = 'auto'; // 'auto', 'decimal', 'fraction'
    this.engMode = 0; // 0=Normal, 1=Eng, -1=EngInverse... (For simple toggle usually just Eng on/off or cycling)

    this.init();
  }

  init() {
    this.createUI();
    this.bindEvents();
    // this.renderDisplay() is removed
  }

  createUI() {
    // Cleanup existing
    const existing = document.getElementById('scientific-calculator-modal');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    const modal = document.createElement('div');
    modal.id = 'scientific-calculator-modal';
    // Style: Premium Modern Dark
    modal.className = 'fixed hidden z-[1000] bg-[#1a202c] rounded-2xl shadow-2xl border border-gray-700 w-80 sm:w-96 overflow-hidden font-sans transition-all duration-300 transform scale-95 opacity-0 select-none';
    modal.style.bottom = '20px';
    modal.style.right = '20px';

    modal.innerHTML = `
            <!-- Header -->
            <div class="bg-gradient-to-r from-gray-800 to-gray-900 p-3 flex items-center justify-between cursor-move border-b border-gray-700 shadow-md" id="calc-header">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]"></div>
                    <span class="text-xs text-gray-300 font-bold tracking-[0.15em] uppercase">Scientific</span>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-[10px] px-2 py-0.5 bg-gray-900 border border-gray-700 text-teal-400 rounded cursor-pointer font-bold hover:bg-gray-800 transition-colors shadow-inner" id="calc-mode-indicator">DEG</div>
                    <button id="calc-close" class="text-gray-500 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            <!-- Display -->
            <div class="p-4 pb-2 bg-[#1a202c]">
                <div class="bg-[#9cb098] border-[3px] border-[#3a4449] rounded shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)] p-2 min-h-[96px] flex flex-col justify-between relative overflow-hidden" style="box-shadow: inset 0 0 20px rgba(0,0,0,0.25); background-image: repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.04) 1px, rgba(0,0,0,0.04) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.04) 1px, rgba(0,0,0,0.04) 2px);">
                   <!-- Status Indicators -->
                   <div class="flex gap-2 text-[10px] font-bold tracking-tight h-3 text-[rgba(17,24,39,0.85)]" style="text-shadow: 1px 1px 0 rgba(0,0,0,0.1);">
                        <span id="ind-shift" class="hidden">S</span>
                        <span id="ind-alpha" class="hidden">A</span>
                        <span id="ind-sto" class="hidden">STO</span>
                        <span id="ind-mode">D</span>
                   </div>
                   
                   <!-- Expression (MathLive) -->
                   <math-field id="calc-math-field" class="block w-full h-full pt-3" style="background: transparent; border: none; font-size: 1.6rem; color: #111827; box-shadow: none; outline: none; --contains-highlight-background: transparent; --selection-background-color: rgba(0,0,0,0.1); text-shadow: 1px 1px 0 rgba(0,0,0,0.15);"></math-field>
                   
                   <!-- Result -->
                   <div id="calc-result-area" class="text-right text-[28px] font-bold text-[#111827] h-10 overflow-hidden tracking-normal" style="font-family: 'Times New Roman', serif; text-shadow: 1px 1px 0 rgba(0,0,0,0.15);"></div>
                </div>
            </div>

            <!-- Keypad -->
            <div class="bg-[#1a202c] p-3 pt-2 grid grid-cols-5 gap-2 text-white pb-5">
                <!-- Row 1: Function Keys -->
                <button class="c-btn shift" id="btn-shift" data-action="shift">SHIFT</button>
                <button class="c-btn alpha" id="btn-alpha" data-action="alpha">ALPHA</button>
                <div class="col-span-2 grid grid-cols-3 grid-rows-2 gap-[2px] bg-[#28313e] rounded-full p-[2px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-[#111827]" id="calc-d-pad">
                    <div class="col-start-2 row-start-1">
                        <button class="w-full h-full bg-gray-600 hover:bg-gray-500 rounded-t-[14px] flex items-center justify-center text-[8px] text-white shadow-sm border border-[#1a202c] active:bg-gray-400 nav transition-colors" data-val="UP">▲</button>
                    </div>
                    <div class="col-start-1 row-start-2">
                        <button class="w-full h-full bg-gray-600 hover:bg-gray-500 rounded-l-[14px] flex items-center justify-center text-[8px] text-white shadow-sm border border-[#1a202c] active:bg-gray-400 nav transition-colors" data-val="LEFT">◄</button>
                    </div>
                    <div class="col-start-2 row-start-2">
                        <button class="w-full h-full bg-gray-600 hover:bg-gray-500 rounded-b-[14px] flex items-center justify-center text-[8px] text-white shadow-sm border border-[#1a202c] active:bg-gray-400 nav transition-colors" data-val="DOWN">▼</button>
                    </div>
                    <div class="col-start-3 row-start-2">
                        <button class="w-full h-full bg-gray-600 hover:bg-gray-500 rounded-r-[14px] flex items-center justify-center text-[8px] text-white shadow-sm border border-[#1a202c] active:bg-gray-400 nav transition-colors" data-val="RIGHT">►</button>
                    </div>
                </div>
                <button class="c-btn on" data-action="on">ON</button>

                <!-- Row 2 -->
                <button class="c-btn sm" data-action="calc" data-shift="SOLVE" data-alpha="=">CALC</button>
                <button class="c-btn sm" data-val="frac"><span class="flex flex-col items-center leading-none text-[10px]"><span>■</span><span class="border-t border-gray-400 w-3 my-[1px]"></span><span>□</span></span></button>
                <button class="c-btn sm" data-val="sqrt">√■</button>
                <button class="c-btn sm" data-val="sqr" data-label="x²" data-shift="√"><i class="font-serif italic">x</i>²</button>
                <button class="c-btn sm" data-val="pow" data-label="xʸ" data-shift="x√"><i class="font-serif italic">x</i>^■</button>

                <!-- Row 3 -->
                <button class="c-btn sm" data-val="x"><i class="font-serif italic">x</i></button>
                <button class="c-btn sm" data-val="log" data-shift="10^">log</button>
                <button class="c-btn sm" data-val="ln" data-shift="e^">ln</button>
                <button class="c-btn sm" data-val="(">(</button>
                <button class="c-btn sm" data-val=")" data-alpha="x">)<span class="sub-r">x</span><span class="sub-y">,</span></button>

                <!-- Row 4 -->
                <button class="c-btn sm" data-val="neg" data-alpha="A">(-)</button>
                <button class="c-btn sm" data-val="deg" data-alpha="B">°'"</button>
                <button class="c-btn sm" data-val="hyp" data-alpha="C">hyp</button>
                <button class="c-btn sm" data-val="sin" data-shift="sin⁻¹" data-alpha="D">sin</button>
                <button class="c-btn sm" data-val="cos" data-shift="cos⁻¹" data-alpha="E">cos</button>
                
                <!-- Row 5 -->
                <button class="c-btn sm" data-val="tan" data-shift="tan⁻¹" data-alpha="F">tan</button>
                <button class="c-btn sm" data-action="sto">STO</button>
                <button class="c-btn sm" data-action="eng" data-shift="←">ENG</button>
                <button class="c-btn sm" data-val="sd" data-alpha="y">S⇔D<span class="sub-r">y</span></button>
                <button class="c-btn sm" data-val="m+" data-alpha="m+">M+<span class="sub-r">M</span></button>

                <!-- Row 6 -->
                <button class="c-btn num" data-val="7">7</button>
                <button class="c-btn num" data-val="8">8</button>
                <button class="c-btn num" data-val="9">9</button>
                <button class="c-btn blue" data-val="DEL">DEL</button>
                <button class="c-btn blue" data-val="AC">AC</button>

                <!-- Row 7 -->
                <button class="c-btn num" data-val="4">4</button>
                <button class="c-btn num" data-val="5">5</button>
                <button class="c-btn num" data-val="6">6</button>
                <button class="c-btn op" data-val="*">×</button>
                <button class="c-btn op" data-val="/">÷</button>

                <!-- Row 8 -->
                <button class="c-btn num" data-val="1">1</button>
                <button class="c-btn num" data-val="2">2</button>
                <button class="c-btn num" data-val="3">3</button>
                <button class="c-btn op" data-val="+">+</button>
                <button class="c-btn op" data-val="-">-</button>

                <!-- Row 9 -->
                <button class="c-btn num" data-val="0">0</button>
                <button class="c-btn num" data-val=".">.</button>
                <button class="c-btn num" data-val="exp" data-shift="π" data-alpha="e">x10ˣ</button>
                <button class="c-btn num" data-val="ans">Ans</button>
                <button class="c-btn eq" id="btn-equals" data-val="=">=</button>
            </div>

        `;

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        #scientific-calculator-modal {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .c-btn {
            position: relative;
            border-radius: 6px; /* Slightly rounder */
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            height: 36px;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.05s ease-out;
            box-shadow: 0 3px 0 rgba(0,0,0,0.3), 0 2px 2px rgba(0,0,0,0.2);
            background: linear-gradient(to bottom, #3f4a5a, #2d3748);
            color: #e2e8f0;
            border: 1px solid rgba(255,255,255,0.05);
            padding-top: 2px;
        }
        .c-btn:active { 
            transform: translateY(2px); 
            box-shadow: 0 1px 0 rgba(0,0,0,0.3); 
        }
        
        /* Specific Button Types */
        .c-btn.shift { 
            background: linear-gradient(to bottom, #f6e05e, #d69e2e); /* Gold/Yellow */
            color: #443204; 
            font-weight: 800; 
            font-size: 11px; 
            box-shadow: 0 3px 0 #b7791f;
            border: none;
        }
        .c-btn.alpha { 
            background: linear-gradient(to bottom, #fc8181, #e53e3e); /* Red */
            color: #580d0d; 
            font-weight: 800; 
            font-size: 11px; 
            box-shadow: 0 3px 0 #c53030;
            border: none;
        }
        .c-btn.nav { 
            background: linear-gradient(to bottom, #718096, #4a5568); 
            box-shadow: 0 3px 0 #2d3748;
        }
        .c-btn.on { 
            background: #2d3748; 
            font-size: 11px;
            border: 1px solid #4a5568; 
            box-shadow: 0 2px 0 #1a202c;
        }
        
        .c-btn.sm { 
            background: linear-gradient(to bottom, #2d3748, #1a202c); 
            font-size: 12px; 
            color: #cbd5e0;
            box-shadow: 0 3px 0 #111;
        } 
        .c-btn.num { 
            background: linear-gradient(to bottom, #ffffff, #edf2f7); 
            color: #1a202c; 
            font-weight: 700; 
            font-size: 16px; 
            box-shadow: 0 3px 0 #cbd5e0; 
        }
        .c-btn.op { 
            background: linear-gradient(to bottom, #718096, #4a5568); 
            font-size: 16px; 
            font-weight: 700; 
            box-shadow: 0 3px 0 #2d3748;
        }
        .c-btn.blue { 
            background: linear-gradient(to bottom, #4299e1, #3182ce); 
            font-weight: 700; 
            color: white;
            font-size: 12px; 
            box-shadow: 0 3px 0 #2b6cb0; 
        }
        .c-btn.eq { 
            background: linear-gradient(to bottom, #4299e1, #2b6cb0); 
            font-size: 18px; 
            font-weight: 700; 
            box-shadow: 0 3px 0 #2c5282; 
        }
        
        /* Sub-labels */
        .c-btn .sub-y { 
            position: absolute; 
            top: -14px; 
            left: 50%; 
            transform: translateX(-50%);
            color: #d69e2e; /* Match shift */
            font-size: 9px; 
            font-weight: 600;
            pointer-events: none; 
            white-space: nowrap; 
            text-shadow: 0 1px 1px rgba(0,0,0,1);
        }
        .c-btn .sub-r { 
            position: absolute; 
            top: -14px; 
            right: 2px; 
            color: #fc8181; /* Match alpha */
            font-size: 9px; 
            font-weight: 700; 
            pointer-events: none; 
            text-shadow: 0 1px 1px rgba(0,0,0,1);
        }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        #scientific-calculator-modal.visible { display: block; transform: scale(1); opacity: 1; }
        
        .c-btn.active-shift { color: #f6e05e !important; text-shadow: 0 0 2px rgba(246, 224, 94, 0.4); }
        .c-btn.active-alpha { color: #fc8181 !important; text-shadow: 0 0 2px rgba(252, 129, 129, 0.4); }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modal);

    this.container = modal;
    this.mf = modal.querySelector('#calc-math-field');

    // Configure MathLive
    if (this.mf) {
      const configureMathField = () => {
        this.mf.mathVirtualKeyboardPolicy = 'manual';
        this.mf.smartFence = false;
        this.mf.smartSuperscript = false;
        // Also disable native virtual keyboard on mobile by making it readonly when tapped?
        // mathVirtualKeyboardPolicy = 'manual' should prevent the math virtual keyboard, 
        // to prevent native keyboard we could listen to focus.
      };

      if (window.customElements) {
        customElements.whenDefined('math-field').then(configureMathField);
      } else {
        configureMathField();
      }

      // Let MathLive handle its own rendering, but we can hook into changes
      this.mf.addEventListener('input', () => {
        if (this.currentResult !== null) {
          this.currentResult = null;
          this.resultArea.innerHTML = '';
        }
      });
    }

    this.resultArea = modal.querySelector('#calc-result-area');
    this.indShift = modal.querySelector('#ind-shift');
    this.indAlpha = modal.querySelector('#ind-alpha');
    this.indSto = modal.querySelector('#ind-sto');
    this.indMode = modal.querySelector('#ind-mode');
    this.headerMode = modal.querySelector('#calc-mode-indicator');
  }

  bindEvents() {
    // Global Toggle
    const toggleBtn = document.getElementById('calculator-toggle-btn');
    if (toggleBtn) {
      this.boundToggle = () => this.toggle();
      toggleBtn.addEventListener('click', this.boundToggle);
    }

    const closeBtn = this.container.querySelector('#calc-close');
    closeBtn.addEventListener('click', () => this.close());
    closeBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    closeBtn.addEventListener('touchstart', (e) => e.stopPropagation());

    this.container.querySelector('.on').addEventListener('click', () => {
      this.clear();
      this.rawExpression = '';
    });

    if (this.headerMode) {
      this.headerMode.addEventListener('mousedown', (e) => e.stopPropagation());
      this.headerMode.addEventListener('touchstart', (e) => e.stopPropagation());
      this.headerMode.addEventListener('click', () => this.toggleMode());
    }

    // Buttons
    this.container.querySelectorAll('.c-btn, .nav').forEach(btn => {
      // Prevent focus loss from math field
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });

      btn.addEventListener('click', (e) => {
        // Haptic Feedback
        if (navigator.vibrate) navigator.vibrate(5);

        const el = e.currentTarget;
        const action = el.dataset.action;
        const val = el.dataset.val;

        if (action === 'shift') { this.toggleShift(); return; }
        if (action === 'alpha') { this.toggleAlpha(); return; }
        if (action === 'sto') { this.toggleStore(); return; }
        if (action === 'eng') { this.toggleEng(); return; }
        if (action === 'optn') {
          this.showNotification("OPTN Menu (Coming Soon)");
          return;
        }
        if (action === 'calc') {
          if (this.isShift) { this.solve(); }
          else if (this.isAlpha) {
            this.insert('=');
            this.resetModifiers();
          } else {
            this.calculate();
          }
          return;
        }

        if (val) this.handleInput(val);
      });
    });

    // Dragging (Header)
    const header = this.container.querySelector('#calc-header');
    this.boundDragStart = (e) => this.startDragging(e);
    this.boundDrag = (e) => this.drag(e);
    this.boundDragEnd = () => this.stopDragging();

    header.addEventListener('mousedown', (e) => this.startDragging(e));
    window.addEventListener('mousemove', this.boundDrag);
    window.addEventListener('mouseup', this.boundDragEnd);
    header.addEventListener('touchstart', (e) => this.startDragging(e.touches[0]));
    window.addEventListener('touchmove', (e) => this.drag(e.touches[0]));
    window.addEventListener('touchend', this.boundDragEnd);

    // Keyboard
    this.boundKeydown = (e) => {
      if (!this.isOpen) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'Enter') this.handleInput('=');
      if (e.key === 'Backspace') this.handleInput('DEL');
      if (e.key === 'ArrowUp') this.handleInput('UP');
      if (e.key === 'ArrowDown') this.handleInput('DOWN');
      if (/[0-9.+\-*/()^]/.test(e.key)) this.handleInput(e.key);
      if (e.key === 'x' || e.key === 'X') this.handleInput('x');
    };
    document.addEventListener('keydown', this.boundKeydown);
  }

  toggleShift() {
    this.isShift = !this.isShift;
    this.isAlpha = false;
    this.isStore = false;
    this.updateIndicators();
    this.updateButtonLabels();
  }

  toggleAlpha() {
    this.isAlpha = !this.isAlpha;
    this.isShift = false;
    this.isStore = false;
    this.updateIndicators();
    this.updateButtonLabels();
  }

  toggleStore() {
    this.isStore = !this.isStore;
    this.isShift = false;
    this.isAlpha = false;
    this.updateIndicators();
    this.updateButtonLabels();
  }

  resetModifiers() {
    this.isShift = false;
    this.isAlpha = false;
    this.isStore = false;
    this.updateIndicators();
    this.updateButtonLabels();
  }

  updateIndicators() {
    this.indShift.style.display = this.isShift ? 'inline-block' : 'none';
    this.indAlpha.style.display = this.isAlpha ? 'inline-block' : 'none';
    this.indSto.style.display = this.isStore ? 'inline-block' : 'none';
  }

  updateButtonLabels() {
    const buttons = this.container.querySelectorAll('.c-btn[data-shift], .c-btn[data-alpha]');
    buttons.forEach(btn => {
      // Store original label if not stored
      if (!btn.dataset.original) {
        // Special handling for HTML content buttons (x, frac, etc)
        if (btn.children.length > 0 && !btn.dataset.label) {
          // If manual control is needed, we rely on data-label.
          // If pure text, innerText is fine.
          // For simplicity, if contains HTML, we only swap if data-label is explicit or we just swap textContent?
          // Best strategy: Only swap if data-shift/data-alpha is present.
          // If currently showing Shift, and we toggle off, restore Original.
          btn.dataset.original = btn.innerHTML; // Saving HTML
        } else {
          btn.dataset.original = btn.innerHTML;
        }
      }

      if (this.isShift && btn.dataset.shift) {
        btn.textContent = btn.dataset.shift;
        btn.classList.add('active-shift');
        btn.classList.remove('active-alpha');
      } else if (this.isAlpha && btn.dataset.alpha) {
        btn.textContent = btn.dataset.alpha;
        btn.classList.add('active-alpha');
        btn.classList.remove('active-shift');
      } else {
        // Restore
        btn.innerHTML = btn.dataset.original;
        btn.classList.remove('active-shift');
        btn.classList.remove('active-alpha');
      }
    });
  }

  toggleEng() {
    // Toggle Engineering Notation on result
    // Actually normally ENG is a transformation of the current result to move decimal 3 places
    if (this.currentResult === null) return;
    // Simple implementation: cycle through standard -> eng
    this.engMode = (this.engMode === 0) ? 1 : 0;
    this.renderResult();
  }

  // Helper to safely insert text into MathField
  insert(text) {
    if (!this.mf) {
      this.mf = this.container.querySelector('#calc-math-field');
    }
    if (!this.mf) return;

    if (typeof this.mf.executeCommand === 'function') {
      this.mf.executeCommand(['insert', text]);
      return;
    }

    // Fallback: If executeCommand is missing, check if it's the old API
    if (typeof this.mf.insert === 'function') {
      this.mf.insert(text);
      return;
    }

    // Fallback: If MathLive is not ready, append to innerText so user sees something
    // and MathLive can parse it when it eventually initializes.
    // We try to map complex LaTeX to simple text for readability in fallback mode.
    let fallbackText = text;
    if (text.includes('\\frac')) fallbackText = '/'; // Keep / for fractions to indicate division clearly or use '÷'? / is better for fractions
    else if (text.includes('\\sqrt')) fallbackText = '√(';
    else if (text.includes('\\times')) fallbackText = '×';
    else if (text.includes('\\div')) fallbackText = '÷';
    else if (text.includes('\\sin')) fallbackText = 'sin(';
    else if (text.includes('\\cos')) fallbackText = 'cos(';
    else if (text.includes('\\tan')) fallbackText = 'tan(';
    else if (text.includes('\\log')) fallbackText = 'log(';
    else if (text.includes('\\ln')) fallbackText = 'ln(';
    else if (text.includes('\\pi')) fallbackText = 'pi';
    else if (text.includes('^')) fallbackText = '^';

    // Remove other latex command chars if any
    if (fallbackText.startsWith('\\')) fallbackText = fallbackText.replace(/\\/g, '');

    this.mf.innerText += fallbackText;

    // Fallback: Wait for upgrade
    if (window.customElements) {
      console.debug("MathField not ready. Waiting for upgrade...");
      customElements.whenDefined('math-field').then(() => {
        // Re-check element reference or method availability
        if (typeof this.mf.executeCommand === 'function') {
          // If we appended text manually, MathLive might have already parsed it during upgrade.
          // So we don't re-insert here to avoid duplication.
          // Just ensure we have the correct reference.
        } else {
          // Try to re-query in case of DOM issues
          const newMf = this.container.querySelector('#calc-math-field');
          if (newMf && typeof newMf.executeCommand === 'function') {
            this.mf = newMf;
          }
        }
      });
    }
  }

  handleInput(val) {
    if (this.rawExpression === 'Error') this.rawExpression = '';

    // History and Cursor Navigation
    if (val === 'UP' || val === 'DOWN') {
      // If we are showing a result or have blank input, behave as History navigator
      if (this.currentResult !== null || (this.mf && !this.mf.value)) {
        if (this.history.length === 0) return;

        if (val === 'UP') {
          if (this.historyIndex === -1) {
            this.historyIndex = this.history.length - 1;
          } else if (this.historyIndex > 0) {
            this.historyIndex--;
          }
        } else { // DOWN
          if (this.historyIndex === -1) return;
          if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
          } else {
            this.historyIndex = -1;
            this.clear();
            return;
          }
        }

        // Load history item
        const item = this.history[this.historyIndex];
        if (this.mf) {
          if (typeof this.mf.setValue === 'function') this.mf.setValue(item.expr);
          else { this.mf.value = item.expr; this.mf.innerText = item.expr; }
        }
        this.currentResult = item.result;
        return;
      }

      // Otherwise move cursor up/down in expression
      if (this.mf && typeof this.mf.executeCommand === 'function') {
        this.mf.executeCommand(val === 'UP' ? 'moveUp' : 'moveDown');
      }
      return;
    }

    if (val === 'LEFT') {
      if (this.mf && typeof this.mf.executeCommand === 'function') this.mf.executeCommand('moveToPreviousChar');
      return;
    }

    if (val === 'RIGHT') {
      if (this.mf && typeof this.mf.executeCommand === 'function') this.mf.executeCommand('moveToNextChar');
      return;
    }

    // Reset history index if typing
    if (val !== 'UP' && val !== 'DOWN' && val !== '=' && val !== 'sto' && val !== 'eng') {
      this.historyIndex = -1;
    }

    // STO Handling
    if (this.isStore) {
      // Expecting A-F, x, y, M
      const validVars = ['neg', 'deg', 'hyp', 'sin', 'cos', 'tan', 'x', 'y', 'm+'];
      // Map button val to Var Name
      // neg->A, deg->B, hyp->C, sin->D, cos->E, tan->F, x->x, y->y, m+->M
      let targetVar = null;
      if (val === 'neg') targetVar = 'A';
      else if (val === 'deg') targetVar = 'B';
      else if (val === 'hyp') targetVar = 'C';
      else if (val === 'sin') targetVar = 'D';
      else if (val === 'cos') targetVar = 'E';
      else if (val === 'tan') targetVar = 'F';
      else if (val === 'x') targetVar = 'x';
      else if (val === 'y') targetVar = 'y';
      else if (val === 'm+') targetVar = 'M';

      if (targetVar && this.currentResult !== null) {
        this.variables[targetVar] = this.currentResult;
        this.showNotification(`Stored -> ${targetVar}`);
      }
      this.resetModifiers();
      return;
    }

    // RCL (Recall) using Alpha
    if (this.isAlpha) {
      let varName = null;
      if (val === 'neg') varName = 'A';
      else if (val === 'deg') varName = 'B';
      else if (val === 'hyp') varName = 'C';
      else if (val === 'sin') varName = 'D';
      else if (val === 'cos') varName = 'E';
      else if (val === 'tan') varName = 'F';
      // New mappings for x, y, M
      else if (val === ')') varName = 'x';
      else if (val === 'sd') varName = 'y';
      else if (val === 'm+') varName = 'M';

      if (varName) {
        this.insert(varName);
        this.resetModifiers();
        return;
      }
    }

    // Auto-clear or keep Ans based on previous result
    if (this.currentResult !== null && ['+', '-', '*', '/', '^', 'pow', 'sqr'].includes(val)) {
      if (this.mf) {
        if (this.mf.setValue) this.mf.setValue('{\\text{Ans}}');
        else { this.mf.value = '{\\text{Ans}}'; this.mf.innerText = 'Ans'; }
      }
      this.currentResult = null;
    } else if (this.currentResult !== null && !['=', 'DEL', 'sd', 'eng', 'sto', 'UP', 'DOWN'].includes(val)) {
      if (this.mf) {
        if (this.mf.setValue) this.mf.setValue('');
        else { this.mf.value = ''; this.mf.innerText = ''; }
      }
      this.currentResult = null;
    }

    switch (val) {
      case 'AC':
        this.clear();
        break;
      case 'DEL':
        if (this.mf) {
          if (typeof this.mf.executeCommand === 'function') {
            this.mf.executeCommand('deleteBackward');
          } else {
            // Fallback for not upgraded element
            if (this.mf.innerText && this.mf.innerText.length > 0) {
              this.mf.innerText = this.mf.innerText.slice(0, -1);
            } else {
              this.deleteLast();
            }
          }
        } else {
          this.deleteLast();
        }
        break;
      case '=':
        this.calculate();
        break;
      case 'sd':
        this.toggleFormat();
        break;
      case 'sqrt':
        this.insert('\\sqrt{#0}');
        break;
      case 'sqr':
        if (this.isShift) this.insert('\\sqrt{#0}');
        else this.insert('^2');
        break;
      case 'pow':
        if (this.isShift) this.insert('\\sqrt[#0]{#0}');
        else this.insert('^{#0}');
        break;
      case 'log':
        if (this.isShift) this.insert('10^{#0}');
        else this.insert('\\log_{10}\\left(#0\\right)');
        break;
      case 'ln':
        if (this.isShift) this.insert('e^{#0}');
        else this.insert('\\ln\\left(#0\\right)');
        break;
      case 'sin':
        this.insert(this.isShift ? '\\arcsin\\left(#0\\right)' : '\\sin\\left(#0\\right)');
        break;
      case 'cos':
        this.insert(this.isShift ? '\\arccos\\left(#0\\right)' : '\\cos\\left(#0\\right)');
        break;
      case 'tan':
        this.insert(this.isShift ? '\\arctan\\left(#0\\right)' : '\\tan\\left(#0\\right)');
        break;
      case 'int':
        if (this.isShift) this.insert('\\frac{d}{dx}\\left(#0\\right)'); // Basic derivative notation
        else {
          this.insert('\\int_{#0}^{#0} #0 \\, dx');
        }
        break;
      case 'frac':
        this.insert('\\frac{#0}{#0}');
        break;
      case 'exp':
        if (this.isShift) this.insert('\\pi');
        else if (this.isAlpha) this.insert('e');
        else this.insert('\\times 10^{#0}');
        break;
      case '(':
        this.insert('(');
        break;
      case ')':
        if (this.isShift) this.insert(',');
        else this.insert(')');
        break;
      case 'x':
        this.insert('x');
        break;
      case 'ans':
        this.insert('{\\text{Ans}}');
        break;
      case 'neg':
        if (!this.isAlpha) this.insert('-');
        break;
      case 'deg':
        if (!this.isAlpha) this.insert('^{\\circ}');
        break;
      case '*':
        this.insert('\\times ');
        break;
      case '/':
        this.insert('\\div ');
        break;
      case '+':
      case '-':
      case '.':
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
        this.insert(val);
        break;
      default:
        // Ignore modifier keys if unhandled
        break;
    }

    if (!this.isStore) this.resetModifiers();
  }

  showNotification(msg) {
    this.resultArea.innerHTML = `<span class="text-xs text-blue-600">${msg}</span>`;
    setTimeout(() => { if (this.currentResult !== null) this.renderResult(); }, 1000);
  }

  deleteLast() {
    this.rawExpression = this.rawExpression.toString().slice(0, -1);
    this.currentResult = null;
  }

  clear() {
    this.rawExpression = '';
    if (this.mf) {
      this.mf.value = '';
      this.mf.innerText = ''; // Clear fallback text
    }
    this.currentResult = null;
    this.historyIndex = -1; // Reset history pointer
    this.resultArea.innerHTML = '';
  }

  toggleFormat() {
    if (this.resultFormat === 'fraction') this.resultFormat = 'decimal';
    else this.resultFormat = 'fraction';
    this.renderResult();
  }

  toggleMode() {
    this.isDegreeMode = !this.isDegreeMode;
    const text = this.isDegreeMode ? 'DEG' : 'RAD';
    if (this.headerMode) this.headerMode.textContent = text;
    if (this.indMode) this.indMode.textContent = this.isDegreeMode ? 'D' : 'R';
  }

  prepareExpression(latex) {
    if (!latex) return '';

    let expr = latex;

    // Basic cleaning
    expr = expr.replace(/\\left/g, '');
    expr = expr.replace(/\\right/g, '');
    expr = expr.replace(/\\,/g, ' ');
    expr = expr.replace(/\\:/g, ' ');
    expr = expr.replace(/\\;/g, ' ');
    expr = expr.replace(/\s+/g, ''); // Remove spaces

    // Operators
    expr = expr.replace(/\\times/g, '*');
    expr = expr.replace(/×/g, '*');
    expr = expr.replace(/\\cdot/g, '*');
    expr = expr.replace(/\\div/g, '/');
    expr = expr.replace(/÷/g, '/');
    expr = expr.replace(/\\pi/g, 'pi');
    expr = expr.replace(/\\text\{Ans\}/g, this.currentResult || 0);

    // Integrals: \int_{A}^{B} E dx
    expr = expr.replace(/\\int_\{([^{}]+)\}\^\{([^{}]+)\}(.+?)dx/g, 'integral("$3", $1, $2)');

    // Derivative: \frac{d}{dx}(E) -> \frac{d}{dx}E
    expr = expr.replace(/\\frac\{d\}\{dx\}\(([^)]+)\)/g, 'derivative("$1", x)');

    // Fractions: \frac{A}{B} -> (A)/(B)
    for (let i = 0; i < 5; i++) {
      expr = expr.replace(/\\frac{([^{}]+|{[^{}]+})*}{([^{}]+|{[^{}]+})*}/g, (match, num, den) => {
        return `(${num})/(${den})`;
      });
      expr = expr.replace(/\\frac{([^{}]*)}{([^{}]*)}/g, '($1)/($2)');
      expr = expr.replace(/\\frac([0-9a-zA-Z])([0-9a-zA-Z])/g, '($1)/($2)'); // \frac56
      expr = expr.replace(/\\frac{([^{}]+)}([0-9a-zA-Z])/g, '($1)/($2)'); // \frac{12}5
      expr = expr.replace(/\\frac([0-9a-zA-Z]){([^{}]+)}/g, '($1)/($2)'); // \frac5{12}
    }

    // Roots
    expr = expr.replace(/\\sqrt\[([^\]]+)\]{([^{}]+)}/g, 'nthRoot($2, $1)');
    expr = expr.replace(/\\sqrt{([^{}]+)}/g, 'sqrt($1)');
    expr = expr.replace(/\\sqrt([0-9a-zA-Z])/g, 'sqrt($1)'); // Catch Mathlive's shorthand \sqrt5 or \sqrtx
    expr = expr.replace(/√/g, 'sqrt');

    // Logs
    expr = expr.replace(/\\log_\{10\}\\left\(([^)]+)\\right\)/g, 'log10($1)');
    expr = expr.replace(/\\log_\{10\}\(([^)]+)\)/g, 'log10($1)');
    expr = expr.replace(/\\ln\\left\(([^)]+)\\right\)/g, 'log($1)');
    expr = expr.replace(/\\ln\(([^)]+)\)/g, 'log($1)');

    // Degree conversion for Trig
    // We now handle unit conversion in the evaluate scope, so we just normalize names here.
    expr = expr.replace(/\\sin/g, 'sin');
    expr = expr.replace(/\\cos/g, 'cos');
    expr = expr.replace(/\\tan/g, 'tan');
    expr = expr.replace(/\\arcsin/g, 'asin');
    expr = expr.replace(/\\arccos/g, 'acos');
    expr = expr.replace(/\\arctan/g, 'atan');

    // Clean up leftover brackets { } from LaTeX
    expr = expr.replace(/\{/g, '(').replace(/\}/g, ')');

    // Auto-balance parentheses to prevent syntax errors
    const openCount = (expr.match(/\(/g) || []).length;
    const closeCount = (expr.match(/\)/g) || []).length;
    if (openCount > closeCount) {
      expr += ')'.repeat(openCount - closeCount);
    }

    // Manual degree symbol
    expr = expr.replace(/\^{\\circ}/g, 'deg');

    return expr;
  }

  solve() {
    this.resultArea.innerHTML = '<span class="text-sm text-gray-500">Solving...</span>';
    setTimeout(() => {
      try {
        let expr = this.prepareExpression(this.mf ? (this.mf.value || '') : this.rawExpression);

        if (!expr.includes('x')) throw new Error("No x");
        let fnStr = expr;
        if (expr.includes('=')) {
          const parts = expr.split('=');
          fnStr = `(${parts[0]}) - (${parts[1]})`;
        }

        let x = 1;
        const f = (val) => {
          const scope = { ...this.variables, x: val, pi: Math.PI, e: Math.E };
          return math.evaluate(fnStr, scope);
        };
        const df = (val) => (f(val + 1e-6) - f(val)) / 1e-6;

        for (let i = 0; i < 50; i++) {
          const y = f(x);
          const dy = df(x);
          if (Math.abs(dy) < 1e-9) break;
          const xn = x - y / dy;
          if (Math.abs(xn - x) < 1e-6) { x = xn; break; }
          x = xn;
        }
        this.currentResult = x;
        this.resultArea.innerHTML = `x = ${math.format(x, { precision: 8 })}`;
      } catch (e) {
        this.resultArea.textContent = "Cannot Solve";
      }
    }, 50);
  }

  calculate() {
    try {
      const latexExpr = this.mf ? (this.mf.value || this.mf.innerText || '') : this.rawExpression;

      // If empty, do nothing or clear
      if (!latexExpr || latexExpr.trim() === '') {
        this.currentResult = null;
        this.resultArea.innerHTML = '';
        return;
      }

      let expr = this.prepareExpression(latexExpr);

      // Variable scope
      const scope = {
        ...this.variables,
        pi: Math.PI,
        e: Math.E,
        sin: (x) => {
          // Check if x is a number? mathjs might pass BigNumber or Complex if configured, but here standard
          if (this.isDegreeMode) return Math.sin(x * Math.PI / 180);
          return Math.sin(x);
        },
        cos: (x) => {
          if (this.isDegreeMode) return Math.cos(x * Math.PI / 180);
          return Math.cos(x);
        },
        tan: (x) => {
          if (this.isDegreeMode) return Math.tan(x * Math.PI / 180);
          return Math.tan(x);
        },
        asin: (x) => {
          const val = Math.asin(x);
          if (this.isDegreeMode) return val * 180 / Math.PI;
          return val;
        },
        acos: (x) => {
          const val = Math.acos(x);
          if (this.isDegreeMode) return val * 180 / Math.PI;
          return val;
        },
        atan: (x) => {
          const val = Math.atan(x);
          if (this.isDegreeMode) return val * 180 / Math.PI;
          return val;
        }
      };

      // Add custom functions to scope
      scope.derivative = (fnIdx, xVal) => {
        return math.derivative(fnIdx, 'x').evaluate({ ...this.variables, x: xVal });
      };

      scope.integral = (fnIdx, a, b) => {
        const f = (v) => math.evaluate(fnIdx, { ...this.variables, x: v });
        const n = 100;
        const h = (b - a) / n;
        let s = f(a) + f(b);
        for (let i = 1; i < n; i += 2) s += 4 * f(a + i * h);
        for (let i = 2; i < n - 1; i += 2) s += 2 * f(a + i * h);
        return (h / 3) * s;
      };

      let res = math.evaluate(expr, scope);
      console.log("[DEBUG CALC]", { latex: latexExpr, expr, res });

      // Handle incomplete expressions returning functions
      if (typeof res === 'function') {
        throw new Error("Result is a function (incomplete expression)");
      }

      // Handle weird results (e.g. Complex numbers or units if they leak)
      if (res && res.toJSON) res = res.toNumber();
      if (res && res.re) res = res.re; // Complex

      if (isNaN(res) || res === undefined) {
        throw new Error("Result is NaN");
      }

      // Snap to zero if very small (e.g. sin(pi))
      if (Math.abs(res) < 1e-12) {
        this.currentResult = 0;
      } else {
        this.currentResult = res;
      }

      // Add to History
      if (latexExpr.trim() !== '') {
        const entry = { expr: latexExpr, result: this.currentResult };
        // Avoid duplicates at top
        if (this.history.length === 0 || this.history[this.history.length - 1].expr !== entry.expr) {
          this.history.push(entry);
          if (this.history.length > 50) this.history.shift();
        }
      }
      this.historyIndex = -1; // Reset pointer to "new"

      this.renderResult();
    } catch (e) {
      console.error('Calculation Error:', e);
      this.currentResult = null;
      this.resultArea.textContent = 'Syntax ERROR'; // Standard Casio error feedback
    }
  }



  renderResult() {
    if (this.currentResult === null) { this.resultArea.innerHTML = ''; return; }

    this.resultArea.innerHTML = '';
    let displayVal;

    // Standard 991ES behavior: Prefer fractions/surds over decimals unless Shift+Eq or SD is used.
    // For now, we auto-detect simple fractions.

    if (this.engMode === 1) {
      displayVal = math.format(this.currentResult, { notation: 'engineering', precision: 10 });
    } else if (this.resultFormat === 'decimal') {
      // Explicit decimal requested via S<=>D
      displayVal = math.format(this.currentResult, { precision: 10 });
    } else {
      // Auto/Fraction mode (Default)
      let isSimple = false;
      try {
        // Check if it converts to a nice fraction
        const f = math.fraction(this.currentResult);
        // Limit denominator to reasonable size to avoid ugly huge fractions for irrational approx
        if (f.d !== 1 && f.d < 10000) {
          displayVal = `\\frac{${f.n}}{${f.d}}`;
          isSimple = true;
        } else if (f.d === 1) {
          displayVal = f.n; // Integer
          isSimple = true;
        }
      } catch (e) { }

      if (!isSimple) {
        displayVal = math.format(this.currentResult, { precision: 10 });
      }
    }

    try { katex.render(displayVal.toString(), this.resultArea, { throwingOnError: false }); }
    catch (e) { this.resultArea.textContent = displayVal; }
  }

  toggle() { this.isOpen ? this.close() : this.open(); }
  open() {
    this.isOpen = true;
    this.container.classList.remove('hidden');
    void this.container.offsetWidth;
    this.container.classList.add('visible');
  }
  close() {
    this.isOpen = false;
    this.container.classList.remove('visible');
    setTimeout(() => this.container.classList.add('hidden'), 300);
  }

  startDragging(e) {
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    const r = this.container.getBoundingClientRect();
    this.modalX = r.left; this.modalY = r.top;
    this.container.style.left = this.modalX + 'px';
    this.container.style.top = this.modalY + 'px';
    this.container.style.bottom = 'auto'; this.container.style.right = 'auto';
  }
  drag(e) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;
    this.container.style.left = (this.modalX + dx) + 'px';
    this.container.style.top = (this.modalY + dy) + 'px';
  }
  stopDragging() { this.isDragging = false; }

  destroy() {
    if (this.boundToggle) {
      const t = document.getElementById('calculator-toggle-btn');
      if (t) t.removeEventListener('click', this.boundToggle);
    }
    if (this.container && this.container.parentNode) this.container.parentNode.removeChild(this.container);
  }
}
