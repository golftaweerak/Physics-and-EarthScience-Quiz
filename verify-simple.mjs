console.log("1. Starting...");
console.log("Testing Main Module Import...");
try {
  const main = await import('./scripts/main.js');
  console.log("✅ main.js loaded successfully.");
} catch (e) {
  console.error("❌ Failed to load main.js:", e);
}
console.log("Done.");
