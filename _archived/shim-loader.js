
global.document = {
  getElementById: (id) => ({ innerHTML: "", style: {}, addEventListener: () => { }, querySelector: () => { } }),
  querySelector: () => ({ innerHTML: "" }),
  addEventListener: () => { },
  body: { innerHTML: "", classList: { add: () => { }, remove: () => { } } },
  documentElement: { classList: { add: () => { }, remove: () => { } } }
};
global.window = {
  addEventListener: () => { },
  location: { href: "" },
  dispatchEvent: () => { },
  matchMedia: () => ({ matches: false, addEventListener: () => { } }),
};
global.localStorage = {
  getItem: () => null,
  setItem: () => { },
  removeItem: () => { },
  length: 0,
  key: () => null
};
global.fetch = () => Promise.resolve({ ok: true, text: () => Promise.resolve("") });
global.HTMLElement = class { };
global.history = { replaceState: () => { } };

(async () => {
  console.log("Starting loader shim...");
  try {
    console.log("Importing gamification...");
    const gamificationPromise = import('../scripts/gamification.js');
    const mainPromise = import('../scripts/main.js');

    const gamification = await gamificationPromise;
    console.log("Gamification imported.");
    const main = await mainPromise;
    console.log("Main imported.");

    console.log("Initializing Gamification...");
    if (gamification.initializeGamification) {
      const g = new gamification.Gamification();
      // initializeGamification usually creates instance. verify if it does more.
      // based on step 410, export class Gamification. But app-loader uses initializeGamification?
      // Let's check imports in app-loader again?
      // Assuming gamification.js exports initializeGamification function.
      // Wait, step 410 View code snippet didn't show initializeGamification export?
      // It showed class Gamification export.
      // If app-loader calls initializeGamification, and it's NOT exported, that's the error!
    }

  } catch (err) {
    console.error("Shim caught error:", err);
  }
})();
