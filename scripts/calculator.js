/**
 * Scientific Calculator for Physics and Earth Science Quiz
 * Uses math.js for robust expression evaluation.
 */

export class ScientificCalculator {
  constructor() {
    this.container = null;
    this.display = null;
    this.history = [];
    this.isOpen = false;
    this.isDegreeMode = true; // Default to degrees for school physics

    // Touch/Mouse dragging state
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.modalX = 0;
    this.modalY = 0;

    this.rawExpression = '';
    this.currentResult = null;
    this.resultFormat = 'auto'; // 'auto', 'decimal', 'fraction'

    this.init();
  }

  init() {
    this.createUI();
    this.bindEvents();
    this.renderDisplay();
  }

  createUI() {
    const modal = document.createElement('div');
    modal.id = 'scientific-calculator-modal';
    modal.className = 'fixed hidden z-[1000] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 sm:w-96 overflow-hidden transition-all duration-300 transform scale-95 opacity-0';
    modal.style.bottom = '20px';
    modal.style.right = '20px';

    modal.innerHTML = `
            <!-- Header/Draggable Area -->
            <div class="bg-gray-100 dark:bg-gray-700/50 p-3 flex items-center justify-between cursor-move" id="calc-header">
                <div class="flex items-center gap-2">
                    <span class="text-xl">🧮</span>
                    <span class="font-bold text-sm dark:text-gray-200">เครื่องคิดเลขวิทยาศาสตร์</span>
                </div>
                <div class="flex items-center gap-1">
                    <button id="calc-mode-toggle" class="px-2 py-1 text-[10px] bg-blue-500 text-white rounded font-bold uppercase tracking-wider">DEG</button>
                    <button id="calc-close" class="p-1 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            <!-- Display Area (KaTeX rendered) -->
            <div class="p-4 bg-gray-50 dark:bg-gray-900/50 relative min-h-[100px] flex flex-col justify-end">
                <div id="calc-history" class="text-right text-xs text-gray-400 dark:text-gray-500 h-6 overflow-hidden mb-1 font-mono"></div>
                <div id="calc-display-rendered" 
                    class="w-full text-right text-2xl font-mono dark:text-white overflow-x-auto whitespace-nowrap scrollbar-hide min-h-[40px] flex items-center justify-end">
                    0
                </div>
                <!-- Cursor simulation -->
                <div id="calc-cursor" class="absolute right-4 bottom-5 w-[2px] h-8 bg-blue-500 animate-pulse hidden"></div>
            </div>

            <!-- Keypad -->
            <div class="p-3 grid grid-cols-5 gap-1.5 bg-white dark:bg-gray-800">
                <!-- Row 1 -->
                <button class="calc-btn sci" data-val="sin(">sin</button>
                <button class="calc-btn sci" data-val="cos(">cos</button>
                <button class="calc-btn sci" data-val="tan(">tan</button>
                <button class="calc-btn sci" data-val="FRAC" title="Fraction">■/□</button>
                <button class="calc-btn func" data-val="AC">AC</button>

                <!-- Row 2 -->
                <button class="calc-btn sci" data-val="log(">log</button>
                <button class="calc-btn sci" data-val="ln(">ln</button>
                <button class="calc-btn sci" data-val="sqrt(">√</button>
                <button class="calc-btn sci" data-val="^">xʸ</button>
                <button class="calc-btn func" data-val="DEL">⌫</button>

                <!-- Row 3 -->
                <button class="calc-btn sci" data-val="PI">π</button>
                <button class="calc-btn sci" data-val="(">(</button>
                <button class="calc-btn sci" data-val=")">)</button>
                <button class="calc-btn sci" data-val="SD" title="Switch Format">S⇔D</button>
                <button class="calc-btn op" data-val="/">÷</button>

                <!-- Row 4 -->
                <button class="calc-btn num" data-val="7">7</button>
                <button class="calc-btn num" data-val="8">8</button>
                <button class="calc-btn num" data-val="9">9</button>
                <button class="calc-btn op" data-val="*">×</button>
                <button class="calc-btn op" data-val="-">−</button>

                <!-- Row 5 -->
                <button class="calc-btn num" data-val="4">4</button>
                <button class="calc-btn num" data-val="5">5</button>
                <button class="calc-btn num" data-val="6">6</button>
                <button class="calc-btn op" data-val="+">+</button>
                <button class="calc-btn eq row-span-2" id="calc-equals" data-val="=">=</button>

                <!-- Row 6 -->
                <button class="calc-btn num" data-val="1">1</button>
                <button class="calc-btn num" data-val="2">2</button>
                <button class="calc-btn num" data-val="3">3</button>
                <button class="calc-btn num" data-val="0">0</button>
                
                <!-- Row 7 items integrated into row 6/5 grid -->
                <button class="calc-btn num" data-val=".">.</button>
            </div>
        `;

    // Add Styles
    const style = document.createElement('style');
    style.textContent = `
            .calc-btn {
                padding: 0.5rem;
                font-size: 0.875rem;
                font-weight: 700;
                border-radius: 0.5rem;
                transition: all 0.2s;
                user-select: none;
                border: 1px solid rgba(0,0,0,0.05);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .calc-btn:active { transform: scale(0.9); }
            .dark .calc-btn { border-color: rgba(255,255,255,0.05); }
            
            .calc-btn.num { 
                background-color: rgb(249 250 251); 
                color: rgb(55 65 81); 
            }
            .dark .calc-btn.num { 
                background-color: rgb(55 65 81); 
                color: rgb(229 231 235); 
            }
            .calc-btn.num:hover { background-color: rgb(243 244 246); }
            .dark .calc-btn.num:hover { background-color: rgb(75 85 99); }

            .calc-btn.op { 
                background-color: rgb(239 246 255); 
                color: rgb(37 99 235); 
            }
            .dark .calc-btn.op { 
                background-color: rgba(30, 58, 138, 0.2); 
                color: rgb(96 165 250); 
            }
            .calc-btn.op:hover { background-color: rgb(219 234 254); }

            .calc-btn.sci { 
                background-color: rgb(243 244 246); 
                color: rgb(75 85 99); 
                font-size: 0.75rem;
            }
            .dark .calc-btn.sci { 
                background-color: rgba(55, 65, 81, 0.5); 
                color: rgb(156 163 175); 
            }
            .calc-btn.sci:hover { background-color: rgb(229 231 235); }

            .calc-btn.func { 
                background-color: rgb(254 242 242); 
                color: rgb(220 38 38); 
            }
            .dark .calc-btn.func { 
                background-color: rgba(127, 29, 29, 0.2); 
                color: rgb(248 113 113); 
            }
            .calc-btn.func:hover { background-color: rgb(254 226 226); }

            .calc-btn.eq { 
                background-color: rgb(37 99 235); 
                color: white; 
                box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
            }
            .calc-btn.eq:hover { background-color: rgb(29 78 216); }
            
            #scientific-calculator-modal {
                pointer-events: none;
            }
            #scientific-calculator-modal.visible {
                display: block;
                transform: scale(1);
                opacity: 1;
                pointer-events: auto;
            }

            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `;
    document.head.appendChild(style);
    document.body.appendChild(modal);

    this.container = modal;
    this.displayRendered = modal.querySelector('#calc-display-rendered');
    this.historyDisplay = modal.querySelector('#calc-history');
    this.modeToggle = modal.querySelector('#calc-mode-toggle');
  }

  bindEvents() {
    // Toggle Logic
    const toggleBtn = document.getElementById('calculator-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }

    this.container.querySelector('#calc-close').addEventListener('click', () => this.close());

    // Button clicks
    this.container.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = e.target.closest('button').dataset.val;
        if (!val && e.target.id !== 'calc-equals') return;
        this.handleInput(val);
      });
    });

    // Mode toggle (DEG/RAD)
    this.modeToggle.addEventListener('click', () => {
      this.isDegreeMode = !this.isDegreeMode;
      this.modeToggle.textContent = this.isDegreeMode ? 'DEG' : 'RAD';
      this.modeToggle.classList.toggle('bg-blue-500', this.isDegreeMode);
      this.modeToggle.classList.toggle('bg-purple-500', !this.isDegreeMode);
    });

    // Keyboard Support
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.key >= '0' && e.key <= '9') this.handleInput(e.key);
      if (e.key === '.') this.handleInput('.');
      if (['+', '-', '*', '/'].includes(e.key)) this.handleInput(e.key);
      if (e.key === 'Enter') this.handleInput('=');
      if (e.key === 'Backspace') this.handleInput('DEL');
      if (e.key === 'Escape') this.close();
    });

    // Dragging Logic
    const header = this.container.querySelector('#calc-header');
    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      this.startDragging(e);
    });
    window.addEventListener('mousemove', (e) => this.drag(e));
    window.addEventListener('mouseup', () => this.stopDragging());

    // Touch Drags
    header.addEventListener('touchstart', (e) => {
      if (e.target.closest('button')) return;
      this.startDragging(e.touches[0]);
    });
    window.addEventListener('touchmove', (e) => this.drag(e.touches[0]));
    window.addEventListener('touchend', () => this.stopDragging());
  }

  handleInput(val) {
    if (this.rawExpression === 'Error') {
      this.rawExpression = '';
    }

    switch (val) {
      case 'AC':
        this.clear();
        this.renderDisplay();
        break;
      case 'DEL':
        this.deleteLast();
        this.renderDisplay();
        break;
      case '=':
        this.calculate();
        // displayResult is called inside calculate, no need for renderDisplay here
        break;
      case 'SD':
        this.toggleFormat();
        break;
      case 'FRAC':
        // If empty or ends with operator, start a fraction numerator
        if (!this.rawExpression || /[+*−/]$/.test(this.rawExpression)) {
          this.rawExpression += '1/2'; // Just a placeholder for now, making it real Casio-like is hard in 1-pass
        } else {
          this.rawExpression += '/';
        }
        this.renderDisplay();
        break;
      default:
        if (val) this.rawExpression += val;
        this.renderDisplay();
        break;
    }
  }

  deleteLast() {
    this.rawExpression = this.rawExpression.slice(0, -1);
  }

  clear() {
    this.rawExpression = '';
    this.historyDisplay.textContent = '';
    this.currentResult = null;
    this.resultFormat = 'auto';
  }

  toggleFormat() {
    if (this.currentResult === null) return;
    this.resultFormat = this.resultFormat === 'decimal' ? 'fraction' : 'decimal';
    this.displayResult();
  }

  renderDisplay() {
    if (!this.displayRendered) return;

    let expr = this.rawExpression || '0';
    let latex = this.convertToLatex(expr);

    try {
      katex.render(latex, this.displayRendered, {
        throwOnError: false,
        displayMode: false
      });
    } catch (e) {
      this.displayRendered.textContent = expr;
    }
  }

  convertToLatex(expr) {
    // Simple TeX conversion for common symbols
    return expr
      .replace(/\//g, '\\div ')
      .replace(/\*/g, '\\times ')
      .replace(/-/g, '-')
      .replace(/sqrt\(/g, '\\sqrt{')
      .replace(/PI/g, '\\pi ')
      .replace(/\^/g, '^')
      .replace(/sin\(/g, '\\sin(')
      .replace(/cos\(/g, '\\cos(')
      .replace(/tan\(/g, '\\tan(')
      .replace(/log\(/g, '\\log(')
      .replace(/ln\(/g, '\\ln(');
  }

  calculate() {
    try {
      let expression = this.rawExpression;
      if (!expression) return;

      let processedExpr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/PI/g, 'pi');

      if (this.isDegreeMode) {
        processedExpr = processedExpr.replace(/sin\(([^)]+)\)/g, 'sin($1 deg)');
        processedExpr = processedExpr.replace(/cos\(([^)]+)\)/g, 'cos($1 deg)');
        processedExpr = processedExpr.replace(/tan\(([^)]+)\)/g, 'tan($1 deg)');
        processedExpr = processedExpr.replace(/asin\(([^)]+)\)/g, 'asin($1) deg');
        processedExpr = processedExpr.replace(/acos\(([^)]+)\)/g, 'acos($1) deg');
        processedExpr = processedExpr.replace(/atan\(([^)]+)\)/g, 'atan($1) deg');
      }

      this.currentResult = math.evaluate(processedExpr);
      this.historyDisplay.textContent = this.rawExpression + ' =';
      this.displayResult();
    } catch (error) {
      console.error('Calculation Error:', error);
      this.rawExpression = 'Error';
      this.renderDisplay();
    }
  }

  displayResult() {
    if (this.currentResult === null) return;

    let formatted;
    if (this.resultFormat === 'fraction') {
      try {
        const frac = math.fraction(this.currentResult);
        if (frac.d === 1) {
          formatted = (frac.n * frac.s).toString();
        } else {
          formatted = `\\frac{${frac.n * frac.s}}{${frac.d}}`;
        }
      } catch (e) {
        formatted = math.format(this.currentResult, { precision: 10 });
      }
    } else {
      if (typeof this.currentResult === 'number') {
        formatted = math.format(this.currentResult, { precision: 10 });
      } else {
        formatted = this.currentResult.toString();
      }
    }

    try {
      katex.render(formatted, this.displayRendered, {
        throwOnError: false,
        displayMode: false
      });
      // Update raw expression to the decimal result for subsequent calculation
      this.rawExpression = (typeof this.currentResult === 'number')
        ? math.format(this.currentResult, { precision: 10 })
        : this.currentResult.toString();
    } catch (e) {
      this.displayRendered.textContent = formatted;
    }
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    this.container.classList.remove('hidden');
    void this.container.offsetWidth;
    this.container.classList.add('visible');
  }

  close() {
    this.isOpen = false;
    this.container.classList.remove('visible');
    setTimeout(() => {
      if (!this.isOpen) {
        this.container.classList.add('hidden');
      }
    }, 300);
  }

  startDragging(e) {
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    const rect = this.container.getBoundingClientRect();
    this.modalX = rect.left;
    this.modalY = rect.top;
    this.container.style.bottom = 'auto';
    this.container.style.right = 'auto';
    this.container.style.left = this.modalX + 'px';
    this.container.style.top = this.modalY + 'px';
  }

  drag(e) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;
    this.container.style.left = (this.modalX + dx) + 'px';
    this.container.style.top = (this.modalY + dy) + 'px';
  }

  stopDragging() {
    this.isDragging = false;
  }
}
