/**
 * SaveManager
 * Handles localStorage persistence for money, high scores, upgrades, and settings.
 */
const SAVE_KEY = 'bike_game_save_v1';

const DEFAULTS = {
  totalMoney: 0,
  highScore: 0, // best distance driven in a single run (meters)
  totalDistance: 0,
  upgrades: {
    speed: 0,    // levels 0-5
    handling: 0, // levels 0-5
    nitro: 0,    // levels 0-5
  },
  settings: {
    soundEnabled: true,
  },
};

export class SaveManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULTS, ...parsed, upgrades: { ...DEFAULTS.upgrades, ...parsed.upgrades }, settings: { ...DEFAULTS.settings, ...parsed.settings } };
      }
    } catch (e) {
      console.warn('Save load failed', e);
    }
    return structuredClone(DEFAULTS);
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Save write failed', e);
    }
  }

  get money() { return this.data.totalMoney; }
  set money(v) { this.data.totalMoney = v; this.save(); }

  get highScore() { return this.data.highScore; }
  set highScore(v) { this.data.highScore = v; this.save(); }

  get totalDistance() { return this.data.totalDistance; }
  set totalDistance(v) { this.data.totalDistance = v; this.save(); }

  get upgrades() { return this.data.upgrades; }
  set upgrades(v) { this.data.upgrades = v; this.save(); }

  get settings() { return this.data.settings; }
  set settings(v) { this.data.settings = v; this.save(); }

  get soundEnabled() { return this.data.settings.soundEnabled; }
  set soundEnabled(v) { this.data.settings.soundEnabled = v; this.save(); }

  /** Reset all save data (for testing). */
  reset() {
    this.data = structuredClone(DEFAULTS);
    this.save();
  }

  /** Get upgrade cost for a given level. */
  upgradeCost(type, level) {
    const base = { speed: 500, handling: 400, nitro: 600 };
    return Math.floor(base[type] * (1 + level * 0.8));
  }

  /** Get multiplier applied to bike stats from upgrades. */
  getUpgradeMultiplier(type) {
    const level = this.data.upgrades[type] || 0;
    return 1 + level * 0.15; // +15% per level
  }
}
