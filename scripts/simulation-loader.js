/**
 * Simulation Loader
 * Handles dynamic import of simulation modules in a Vite-friendly way.
 */
export const SimulationLoader = {
  // Use Vite's glob import to ensure these files are tracked and bundled as chunks
  modules: import.meta.glob('./simulations/physics/**/*.js'),

  /**
   * Loads a simulation module by its path.
   * @param {string} simId - The ID of the simulation (e.g., 'm4-ch2')
   * @returns {Promise<any>} The module's SimulationModule class.
   */
  async load(simId) {
    let internalPath = '';

    // Mapping IDs to relative paths from this file
    if (simId === 'm4-ch2') internalPath = './simulations/physics/m4/ch2_combined_motion.js';
    if (simId === 'm4-ch2-v') internalPath = './simulations/physics/m4/ch2_combined_motion.js';
    if (simId === 'm4-ch7') internalPath = './simulations/physics/m4/ch7_projectile.js';

    if (!internalPath) {
      throw new Error(`Simulation ID "${simId}" not mapped to a file.`);
    }

    const loader = this.modules[internalPath];
    if (!loader) {
      throw new Error(`Simulation file not found at ${internalPath}`);
    }

    const mod = await loader();
    if (!mod.SimulationModule) {
      throw new Error(`Module at ${internalPath} does not export "SimulationModule"`);
    }

    return mod.SimulationModule;
  }
};
