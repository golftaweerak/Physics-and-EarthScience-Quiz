import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScientificCalculator } from '../scripts/calculator.js';
import * as math from 'mathjs';

// Setup global math object since calculator.js expects it from CDN
globalThis.math = math;

describe('ScientificCalculator Integration Tests', () => {
  let calculator;

  beforeEach(() => {
    // Mock navigator.vibrate
    globalThis.navigator = { vibrate: vi.fn() };

    // Clean up any existing modals
    document.body.innerHTML = '';

    // Create a mock math-field to be attached before initializing
    const mfMock = document.createElement('div');
    mfMock.id = 'calc-math-field';
    mfMock.value = '';
    mfMock.setValue = vi.fn(function (v) { this.value = v; });
    mfMock.insert = vi.fn(function (v) { this.value += v; });
    mfMock.executeCommand = vi.fn(function (cmd) {
      if (cmd === 'deleteBackward') {
        this.value = this.value.slice(0, -1);
      } else if (Array.isArray(cmd) && cmd[0] === 'insert') {
        this.value += cmd[1];
      } else if (cmd === 'insert') {
         // handle if called as string, though we used array in implementation
      }
    });
    mfMock.setOptions = vi.fn();
    mfMock.addEventListener = vi.fn();

    // We append the mock to body early so ScientificCalculator captures it inside createUI -> modal
    // Actually ScientificCalculator creates its own modal innerHTML, resetting the math-field.
    // So we must intercept querySelector or override `this.mf` right after instantiation.

    // Create an instance
    calculator = new ScientificCalculator();

    // Force override the mf element since JSDOM destroys our mock during template innerHTML assignment
    calculator.mf = mfMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize correctly', () => {
    expect(calculator).toBeDefined();
    expect(calculator.isOpen).toBe(false);
    expect(calculator.isDegreeMode).toBe(true);
    expect(calculator.variables).toEqual({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, x: 0, y: 0, M: 0 });
  });

  describe('Basic Arithmetic', () => {
    it('should handle addition', () => {
      calculator.handleInput('5');
      calculator.handleInput('+');
      calculator.handleInput('3');
      calculator.handleInput('=');
      expect(calculator.currentResult).toBe(8);
    });

    it('should handle complex expressions', () => {
      ['2', '+', '3', '*', '4'].forEach(val => calculator.handleInput(val));
      calculator.handleInput('=');
      expect(calculator.currentResult).toBe(14); // 2 + (3 * 4)
    });

    it('should handle AC and DEL correctly', () => {
      ['1', '2', '3'].forEach(val => calculator.handleInput(val));
      calculator.handleInput('DEL');
      expect(calculator.mf.value).toBe('12');

      calculator.handleInput('AC');
      expect(calculator.mf.value).toBe('');
      expect(calculator.currentResult).toBeNull();
    });
  });

  describe('Trigonometry and Modes', () => {
    it('should calculate sin(90) correctly in Degree Mode', () => {
      calculator.isDegreeMode = true;
      calculator.handleInput('sin');
      calculator.mf.value = '\\sin\\left(90\\right)'; // MathLive injects \sin\left( #0 \right)
      calculator.handleInput('=');
      expect(calculator.currentResult).toBeCloseTo(1, 10);
    });

    it('should calculate sin(pi/2) correctly in Radian Mode', () => {
      calculator.isDegreeMode = false;
      calculator.handleInput('sin');
      calculator.mf.value = '\\sin\\left(\\frac{\\pi}{2}\\right)';
      calculator.handleInput('=');
      expect(calculator.currentResult).toBeCloseTo(1, 10);
    });
  });

  describe('Shift and Alpha Modifiers', () => {
    it('should toggle shift state', () => {
      expect(calculator.isShift).toBe(false);
      calculator.toggleShift();
      expect(calculator.isShift).toBe(true);
      expect(calculator.isAlpha).toBe(false);
    });

    it('should toggle alpha state', () => {
      expect(calculator.isAlpha).toBe(false);
      calculator.toggleAlpha();
      expect(calculator.isAlpha).toBe(true);
      expect(calculator.isShift).toBe(false);
    });

    it('should input variables via Alpha', () => {
      calculator.toggleAlpha();
      calculator.handleInput('neg'); // maps to 'A'
      expect(calculator.mf.value).toBe('A');
      // Modifiers should reset after variable input
      expect(calculator.isAlpha).toBe(false);
    });
  });

  describe('Variables (STO / RCL)', () => {
    it('should store a result into a variable (STO)', () => {
      // First calculate a result
      ['4', '2', '='].forEach(val => calculator.handleInput(val));
      expect(calculator.currentResult).toBe(42);

      // Turn on STO mode
      calculator.toggleStore();
      expect(calculator.isStore).toBe(true);

      // Press a button mapped to a variable (e.g., neg maps to 'A')
      calculator.handleInput('neg');

      expect(calculator.variables.A).toBe(42);
      expect(calculator.isStore).toBe(false);
    });

    it('should use stored variables in calculations', () => {
      calculator.variables.A = 10;
      calculator.variables.B = 5;

      calculator.toggleAlpha();
      calculator.handleInput('neg'); // A
      calculator.handleInput('+');
      calculator.toggleAlpha();
      calculator.handleInput('deg'); // B
      calculator.handleInput('=');

      expect(calculator.currentResult).toBe(15);
    });
  });

  describe('Equation Solving', () => {
    it('should solve linear equations using SOLVE', () => {
      vi.useFakeTimers();

      calculator.mf.value = '2x = 10';

      calculator.solve();

      // Trigger the 50ms setTimeout inside solve()
      vi.advanceTimersByTime(100);

      expect(calculator.currentResult).toBeCloseTo(5, 5);

      vi.useRealTimers();
    });

    it('should calculate integrals and derivatives', () => {
      // integral(x^2, 0, 3) = 9
      calculator.mf.value = '\\int_{0}^{3} x^2 \\, dx';
      calculator.calculate();

      if (calculator.currentResult === null) {
        throw new Error("Integral Failed: " + calculator.resultArea.textContent);
      }
      expect(calculator.currentResult).toBeCloseTo(9, 3);

      calculator.mf.value = '';

      // derivative(x^2, 3) = 6
      calculator.mf.value = '\\frac{d}{dx}\\left(x^2\\right)';
      calculator.variables.x = 3; // Evaluate at x=3 since no generic boundary syntax is supported in pure mathjs
      // Wait, prepareExpression does `derivative("x^2", x)`, which math.evaluate uses from context
      calculator.calculate();
      expect(calculator.currentResult).toBeCloseTo(6, 3);
    });
  });

  describe('History', () => {
    it('should add to history upon successful calculation', () => {
      ['5', '+', '5', '='].forEach(val => calculator.handleInput(val));
      expect(calculator.history.length).toBe(1);
      expect(calculator.history[0].expr).toBe('5+5');
      expect(calculator.history[0].result).toBe(10);
    });

    it('should navigate history with UP/DOWN arrows', () => {
      calculator.mf.value = '1+1';
      calculator.handleInput('=');
      calculator.mf.value = '2+2';
      calculator.handleInput('=');

      expect(calculator.history.length).toBe(2);

      // Go UP to history index 1 (2+2)
      calculator.handleInput('UP');
      expect(calculator.mf.value).toBe('2+2');

      // Go UP to history index 0 (1+1)
      calculator.handleInput('UP');
      expect(calculator.mf.value).toBe('1+1');

      // Go DOWN to history index 1 (2+2)
      calculator.handleInput('DOWN');
      expect(calculator.mf.value).toBe('2+2');
    });
  });
});

