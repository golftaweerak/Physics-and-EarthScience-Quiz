
global.document = {
  getElementById: (id) => ({ innerHTML: "", style: {}, addEventListener: () => { }, querySelector: () => { } }),
  querySelector: () => ({ innerHTML: "" }),
  addEventListener: () => { },
};
global.window = {
  addEventListener: () => { },
  location: { href: "" },
  dispatchEvent: () => { },
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

import('../scripts/main.js')
  .then((m) => {
    console.log("Import success!");
    if (m.initializePage) {
      try {
        m.initializePage();
        console.log("initializePage executed without throw");
      } catch (e) {
        console.error("initializePage threw:", e);
      }
    }
  })
  .catch(err => console.error("Import failed:", err));
