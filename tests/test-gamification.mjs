
import { Gamification } from '../scripts/gamification.js';

// Mock DOM elements required by Gamification class
// Since we are in Node.js, we need to mock window, localStorage, and document
const mockStorage = {};
global.window = {
  localStorage: {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, val) => mockStorage[key] = val,
    removeItem: (key) => delete mockStorage[key]
  },
  addEventListener: () => { },
  removeEventListener: () => { }
};
global.document = {
  getElementById: () => null,
  querySelectorAll: () => []
};

// Test Runner
async function runTests() {
  console.log("🧪 Starting Gamification Unit Tests...");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const game = new Gamification();

    // Test 1: Initial State
    assert(game.xp === 0, "Initial XP should be 0");
    assert(game.level === 1, "Initial Level should be 1");

    // Test 2: XP Gain and Level Up
    // Level 1 to 2 requires 1000 XP (based on calculation: 1000 * 1^1.5)
    // Let's add 500 XP
    game.addXP(500);
    assert(game.xp === 500, "XP should be 500 after adding 500");
    assert(game.level === 1, "Level should still be 1");

    // Add 600 more (Total 1100), should level up
    game.addXP(600);
    assert(game.xp === 1100, "XP should be 1100");
    assert(game.level >= 2, "Level should be at least 2");

    // Test 3: Title Calculation
    const title = game.getTitle(1);
    assert(title === "นักเรียนฝึกหัด", "Level 1 title check");

  } catch (e) {
    console.error("🔥 Exception during tests:", e);
    failed++;
  }

  console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
}

runTests();
