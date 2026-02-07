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
    this.history = []; // { expr: string, result: any }
    this.historyIndex = -1; // -1 = current (new), 0..N = historical item

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
    this.renderDisplay();
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
                <div class="bg-[#eef2f5] border-l-4 border-l-teal-500 rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] p-3 min-h-[96px] flex flex-col justify-between relative overflow-hidden">
                   <!-- Status Indicators -->
                   <div class="flex gap-1 text-[9px] font-extrabold tracking-tight h-3 text-gray-600">
                        <span id="ind-shift" class="hidden text-[#a67c00]">S</span>
                        <span id="ind-alpha" class="hidden text-[#c53030]">A</span>
                        <span id="ind-sto" class="hidden text-blue-700">STO</span>
                        <span id="ind-mode">D</span>
                   </div>
                   
                   <!-- Expression -->
                   <div id="calc-display-rendered" class="text-lg w-full text-left font-serif text-gray-900 overflow-x-auto whitespace-nowrap scrollbar-hide py-1"></div>
                   
                   <!-- Result -->
                   <div id="calc-result-area" class="text-right text-2xl font-semibold text-gray-800 h-9 overflow-hidden tracking-normal"></div>
                </div>
            </div>

            <!-- Keypad -->
            <div class="bg-[#1a202c] p-3 pt-2 grid grid-cols-5 gap-2 text-white pb-5">
                <!-- Row 1: Function Keys -->
                <button class="c-btn shift" id="btn-shift" data-action="shift">SHIFT</button>
                <button class="c-btn alpha" id="btn-alpha" data-action="alpha">ALPHA</button>
                <button class="c-btn nav" data-val="UP">▲</button>
                <button class="c-btn nav" data-val="DOWN">▼</button>
                <button class="c-btn on" data-action="on">ON</button>

                <!-- Row 2 -->
                <button class="c-btn sm" data-val="optn">OPTN</button>
                <button class="c-btn sm" data-action="calc" data-shift="SOLVE" data-alpha="=">CALC</button>
                <button class="c-btn sm" data-val="int" data-shift="derivative(">∫dx</button>
                <button class="c-btn sm" data-val="x"><i class="font-serif italic">x</i></button>
                <button class="c-btn sm" data-val="frac"><span class="flex flex-col items-center leading-none text-[10px]"><span>■</span><span class="border-t border-gray-400 w-3 my-[1px]"></span><span>□</span></span></button>

                <!-- Row 3 -->
                <button class="c-btn sm" data-val="sqrt">√■</button>
                <button class="c-btn sm" data-val="sqr" data-label="x²" data-shift="√"><i class="font-serif italic">x</i>²</button>
                <button class="c-btn sm" data-val="pow" data-label="xʸ" data-shift="x√"><i class="font-serif italic">x</i>ʸ</button>
                <button class="c-btn sm" data-val="log" data-shift="10^">log</button>
                <button class="c-btn sm" data-val="ln" data-shift="e^">ln</button>

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
                <button class="c-btn sm" data-val="(">(</button>
                <button class="c-btn sm" data-val=")">)<span class="sub-y">,</span></button>

                <!-- Row 6 -->
                <button class="c-btn sm" data-val="sd">S⇔D</button>
                <button class="c-btn sm" data-val="m+">M+</button>
                <button class="c-btn num" data-val="7">7</button>
                <button class="c-btn num" data-val="8">8</button>
                <button class="c-btn num" data-val="9">9</button>

                <!-- Row 7 -->
                <button class="c-btn blue" data-val="DEL">DEL</button>
                <button class="c-btn blue" data-val="AC">AC</button>
                <button class="c-btn num" data-val="4">4</button>
                <button class="c-btn num" data-val="5">5</button>
                <button class="c-btn num" data-val="6">6</button>

                <!-- Row 8 -->
                <button class="c-btn op" data-val="*">×</button>
                <button class="c-btn op" data-val="/">÷</button>
                <button class="c-btn num" data-val="1">1</button>
                <button class="c-btn num" data-val="2">2</button>
                <button class="c-btn num" data-val="3">3</button>

                <!-- Row 9 -->
                <button class="c-btn op" data-val="+">+</button>
                <button class="c-btn op" data-val="-">-</button>
                <button class="c-btn num" data-val="0">0</button>
                <button class="c-btn num" data-val=".">.</button>
                <button class="c-btn num" data-val="exp" data-shift="π" data-alpha="e">x10ˣ</button>

                <!-- Row 10 -->
                <button class="c-btn num" data-val="ans">Ans</button>
                <button class="c-btn eq col-span-4" id="btn-equals" data-val="=">=</button>
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
    this.displayRendered = modal.querySelector('#calc-display-rendered');
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
      this.renderDisplay();
    });

    if (this.headerMode) {
      this.headerMode.addEventListener('mousedown', (e) => e.stopPropagation());
      this.headerMode.addEventListener('touchstart', (e) => e.stopPropagation());
      this.headerMode.addEventListener('click', () => this.toggleMode());
    }

    // Buttons
    this.container.querySelectorAll('.c-btn').forEach(btn => {
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
        if (action === 'calc') {
          if (this.isShift) { this.solve(); }
          else if (this.isAlpha) { this.handleInput('='); }
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

  handleInput(val) {
    if (this.rawExpression === 'Error') this.rawExpression = '';

    // History Navigation
    if (val === 'UP') {
      if (this.history.length === 0) return;
      if (this.historyIndex === -1) {
        // Start navigating from end
        this.historyIndex = this.history.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }
      // Load history
      const item = this.history[this.historyIndex];
      this.rawExpression = item.expr;
      this.currentResult = item.result; // Temporarily show result too?
      // Actually standard calc: show expr involved. Result area might show previous result or cleared.
      // Usually user wants to edit previous expression.
      this.renderDisplay();
      // Optionally show previous result in result area immediately?
      // this.renderResult(); 
      return;
    }
    if (val === 'DOWN') {
      if (this.historyIndex === -1) return; // Already at new
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        const item = this.history[this.historyIndex];
        this.rawExpression = item.expr;
        this.currentResult = item.result;
        this.renderDisplay();
      } else {
        // Return to new empty/current input?
        this.historyIndex = -1;
        this.rawExpression = ''; // Or keep what was typed?
        // Usually down from last history item clears or goes to blank new line
        this.clear();
      }
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

      if (varName) {
        this.rawExpression += varName;
        this.resetModifiers();
        this.renderDisplay();
        return;
      }
    }

    // If we have a result and user types an operator, keep Ans.
    if (this.currentResult !== null && ['+', '-', '*', '/', '^'].includes(val)) {
      this.rawExpression = this.rawExpression + val;
      this.currentResult = null;
    } else if (this.currentResult !== null && !['=', 'DEL', 'sd', 'eng', 'sto'].includes(val)) {
      this.rawExpression = '';
      this.currentResult = null;
    }

    switch (val) {
      case 'AC': this.clear(); break;
      case 'DEL': this.deleteLast(); break;
      case '=': this.calculate(); break;
      case 'sd': this.toggleFormat(); break;
      case 'sqrt': this.rawExpression += 'sqrt('; break; // Old case, might be unused
      case 'sqr':
        if (this.isShift) this.rawExpression += 'sqrt(';
        else this.rawExpression += '^2';
        break;
      case 'pow':
        if (this.isShift) this.rawExpression += 'nthRoot('; // nthRoot(val, root)
        else this.rawExpression += '^';
        break;
      case 'log': this.rawExpression += 'log10('; break; // Base 10
      case 'ln': this.rawExpression += 'log('; break; // Natural Log (math.js log is ln)
      case 'sin': this.rawExpression += this.isShift ? 'asin(' : 'sin('; break;

      case 'cos': this.rawExpression += this.isShift ? 'acos(' : 'cos('; break;
      case 'tan': this.rawExpression += this.isShift ? 'atan(' : 'tan('; break;

      case 'int':
        if (this.isShift) this.rawExpression += 'derivative(';
        else this.rawExpression += 'integral(';
        break;

      case 'frac':
        // Better frac behavior: wrap recent number or wait for input
        // If expression ends in number, wrap it? Too complex for string append.
        // Just append '/'
        this.rawExpression += '/';
        break;

      case 'exp':
        if (this.isShift) this.rawExpression += 'pi';
        else if (this.isAlpha) this.rawExpression += 'e';
        else this.rawExpression += '*10^';
        break;

      case ')':
        if (this.isShift) this.rawExpression += ',';
        else this.rawExpression += ')';
        break;

      case 'x': this.rawExpression += 'x'; break;
      case 'ans': this.rawExpression += 'Ans'; break;

      // Ignore modifier keys if pressed without valid combo
      case 'neg': if (!this.isAlpha) this.rawExpression += '-'; break;
      case 'deg': if (!this.isAlpha) this.rawExpression += 'deg'; break;

      default:
        if (!['shift', 'alpha', 'sto', 'eng', 'calc', 'optn', 'hyp'].includes(val)) {
          this.rawExpression += val;
        }
    }

    if (!this.isStore) this.resetModifiers(); // Don't reset if we just entered STO mode
    this.renderDisplay();
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
    this.currentResult = null;
    this.historyIndex = -1; // Reset history pointer
    this.resultArea.innerHTML = '';
    this.renderDisplay();
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

  prepareExpression(expr) {
    // Manual degree conversion to avoid unit scope issues
    const PI = 3.141592653589793;
    const E = 2.718281828459045;
    // sin(x) -> sin((x) * PI / 180)
    if (this.isDegreeMode) {
      expr = expr.replace(/sin\(([^)]+?)(?:\s*deg)?\)/g, `sin(($1) * ${PI} / 180)`)
        .replace(/cos\(([^)]+?)(?:\s*deg)?\)/g, `cos(($1) * ${PI} / 180)`)
        .replace(/tan\(([^)]+?)(?:\s*deg)?\)/g, `tan(($1) * ${PI} / 180)`);

      // Inverse Trig: rad -> deg
      // asin(x) -> (asin(x) * 180 / PI)
      expr = expr.replace(/asin\(([^)]+?)(?:\s*deg)?\)/g, `(asin($1) * 180 / ${PI})`)
        .replace(/acos\(([^)]+?)(?:\s*deg)?\)/g, `(acos($1) * 180 / ${PI})`)
        .replace(/atan\(([^)]+?)(?:\s*deg)?\)/g, `(atan($1) * 180 / ${PI})`);
    }

    expr = expr.replace(/derivative\(([^,]+),/g, 'derivative("$1",');
    expr = expr.replace(/integral\(([^,]+),/g, 'integral("$1",');
    // Use numeric replacement for constants to avoid scope issues
    expr = expr.replace(/e/g, '2.718281828459045');
    // Remove Ans replacement if possible or replace raw value as before
    expr = expr.replace(/Ans/g, this.currentResult || 0);
    return expr;
  }

  solve() {
    this.renderDisplay();
    this.resultArea.innerHTML = '<span class="text-sm text-gray-500">Solving...</span>';
    setTimeout(() => {
      try {
        let expr = this.prepareExpression(this.rawExpression);

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
      let expr = this.prepareExpression(this.rawExpression);


      // Variable scope
      const scope = { ...this.variables, pi: Math.PI, e: Math.E };

      // Add custom functions to scope
      scope.derivative = (fnIdx, xVal) => {
        // Lim(h->0) ... Wait, fnIdx needs to be a function?
        // Math.js evaluate can't pass a function definition easily unless we define f(x).
        // Simplified: We rely on math.derivative for symbolic if possible.
        // Try: math.derivative('x^2', 'x').evaluate({x: 3})
        return math.derivative(fnIdx, 'x').evaluate({ x: xVal });
      };

      scope.integral = (fnIdx, a, b) => {
        // Numerical integration (Simpson)
        // fnIdx is string like 'x^2'
        const f = (v) => math.evaluate(fnIdx, { x: v, ...this.variables });
        const n = 100;
        const h = (b - a) / n;
        let s = f(a) + f(b);
        for (let i = 1; i < n; i += 2) s += 4 * f(a + i * h);
        for (let i = 2; i < n - 1; i += 2) s += 2 * f(a + i * h);
        return (h / 3) * s;
      };

      // Variables logic: if we have user variables, we MIGHT need scope.
      // But if passing scope fails math functions, we must manually replace vars?
      // Or spread math functions into scope?
      // Try passing NO scope first to verify trig.
      // If we need variables later, we fix scope.
      // const scope = { ...this.variables, pi: Math.PI, e: Math.E };

      let res = math.evaluate(expr, scope);

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
      if (this.rawExpression.trim() !== '') {
        const entry = { expr: this.rawExpression, result: this.currentResult };
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
      this.resultArea.textContent = 'Error: ' + e.message; // Show specific error for debugging
    }
  }

  renderDisplay() {
    this.displayRendered.innerHTML = '';
    const expr = this.rawExpression;
    if (!expr) return;

    let latex = '';
    try {
      // Try to parse partial expression for Natural Display
      // math.parse handles fractions (1/2), powers (2^3), etc. naturally
      const node = math.parse(expr);
      latex = node.toTex({ parenthesis: 'keep', implicit: 'hide' });
    } catch (e) {
      // Fallback for partial/incomplete expressions
      latex = expr
        .replace(/\*/g, '\\times ')
        .replace(/\//g, '\\div ')
        .replace(/sqrt\(/g, '\\sqrt{')
        .replace(/\^/g, '^')
        .replace(/pi/g, '\\pi')
        .replace(/integral\(/g, '\\int ')
        .replace(/derivative\(/g, '\\frac{d}{dx} ')
        .replace(/Ans/g, '\\text{Ans}')
        .replace(/sin\(/g, '\\sin(')
        .replace(/cos\(/g, '\\cos(')

      // Secondary replacements (using resulting string)
      latex = latex
        .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
        .replace(/nthRoot\(([^,]+),([^)]+)\)/g, '\\sqrt[$2]{$1}')
        .replace(/nthRoot\(([^)]+)\)/g, '\\sqrt{$1}')
        .replace(/log10\(([^)]+)\)/g, '\\log_{10}($1)')
        .replace(/ln\(([^)]+)\)/g, '\\ln($1)') // Fixed regex to match content
        .replace(/ln\(/g, '\\ln(')             // Fallback
        .replace(/deg/g, '^\\circ')
        .replace(/asin\(/g, '\\sin^{-1}(')
        .replace(/acos\(/g, '\\cos^{-1}(')
        .replace(/atan\(/g, '\\tan^{-1}(');
    }


    if (!latex) return;
    try { katex.render(latex, this.displayRendered, { throwingOnError: false, displayMode: false }); }
    catch (e) { this.displayRendered.textContent = this.rawExpression; }
  }


  renderResult() {
    if (this.currentResult === null) { this.resultArea.innerHTML = ''; return; }

    this.resultArea.innerHTML = '';
    let displayVal;

    if (this.engMode === 1) {
      displayVal = math.format(this.currentResult, { notation: 'engineering', precision: 10 });
    } else if (this.resultFormat === 'fraction') {
      try {
        const f = math.fraction(this.currentResult);
        displayVal = f.d === 1 ? f.n : `\\frac{${f.n}}{${f.d}}`;
      } catch { displayVal = this.currentResult; }
    } else {
      displayVal = math.format(this.currentResult, { precision: 10 });
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
