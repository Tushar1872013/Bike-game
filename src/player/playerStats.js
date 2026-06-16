/**
 * PlayerStats
 * Health, stamina, XP, level system for the player character.
 */
export class PlayerStats {
  constructor(saveManager) {
    this.save = saveManager;
    // Load player stats from save or use defaults
    const data = this.save.data;
    if (!data.player) {
      data.player = {
        health: 100,
        maxHealth: 100,
        stamina: 100,
        maxStamina: 100,
        nitro: 100,
        maxNitro: 100,
        xp: 0,
        level: 1,
        strength: 5,
        agility: 5,
        ridingSkill: 5,
      };
      this.save.save();
    }
    this.stats = data.player;
  }

  get health() { return this.stats.health; }
  set health(v) { this.stats.health = Math.max(0, Math.min(v, this.stats.maxHealth)); this.save.save(); }

  get stamina() { return this.stats.stamina; }
  set stamina(v) { this.stats.stamina = Math.max(0, Math.min(v, this.stats.maxStamina)); this.save.save(); }

  get nitro() { return this.stats.nitro; }
  set nitro(v) { this.stats.nitro = Math.max(0, Math.min(v, this.stats.maxNitro)); this.save.save(); }

  get xp() { return this.stats.xp; }
  set xp(v) { this.stats.xp = v; this.checkLevelUp(); this.save.save(); }

  get level() { return this.stats.level; }

  get strength() { return this.stats.strength; }
  get agility() { return this.stats.agility; }
  get ridingSkill() { return this.stats.ridingSkill; }

  /** Add XP and check for level up. */
  addXP(amount) {
    this.xp += amount;
  }

  /** XP needed for next level. */
  get xpToNext() {
    return Math.floor(100 * Math.pow(1.5, this.level - 1));
  }

  /** Check and perform level up. */
  checkLevelUp() {
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.stats.level++;
      // Increase base stats on level up
      this.stats.maxHealth += 10;
      this.stats.health = this.stats.maxHealth;
      this.stats.maxStamina += 5;
      this.stats.stamina = this.stats.maxStamina;
      this.stats.maxNitro += 5;
      this.stats.nitro = this.stats.maxNitro;
      this.stats.strength += 1;
      this.stats.agility += 1;
      this.stats.ridingSkill += 1;
    }
  }

  /** Regenerate stamina over time (called each frame). */
  regenerate(delta) {
    if (this.stamina < this.stats.maxStamina) {
      this.stats.stamina = Math.min(this.stats.maxStamina, this.stamina + delta * 8);
    }
  }

  /** Consume stamina. */
  useStamina(amount) {
    if (this.stamina >= amount) {
      this.stamina -= amount;
      return true;
    }
    return false;
  }

  /** Consume nitro. */
  useNitro(delta) {
    if (this.nitro > 0) {
      this.nitro -= delta * 30; // drains 30 per second while using nitro
      return true;
    }
    return false;
  }

  /** Refill nitro over time. */
  refillNitro(delta) {
    if (this.nitro < this.stats.maxNitro) {
      this.nitro += delta * 15; // refills 15 per second
    }
  }

  /** Take damage (e.g., from collisions). */
  takeDamage(amount) {
    this.health -= amount;
  }

  /** Heal over time. */
  heal(delta) {
    if (this.health < this.stats.maxHealth) {
      this.health += delta * 2; // heals 2 per second
    }
  }

  /** Reset stats for a new run. */
  reset() {
    this.stats.health = this.stats.maxHealth;
    this.stats.stamina = this.stats.maxStamina;
    this.stats.nitro = this.stats.maxNitro;
  }

  /** Upgrade a specific stat (called from garage). */
  upgradeStat(stat, amount) {
    if (stat === 'health') this.stats.maxHealth += amount;
    if (stat === 'stamina') this.stats.maxStamina += amount;
    if (stat === 'nitro') this.stats.maxNitro += amount;
    if (stat === 'strength') this.stats.strength += amount;
    if (stat === 'agility') this.stats.agility += amount;
    if (stat === 'ridingSkill') this.stats.ridingSkill += amount;
    this.save.save();
  }
}
