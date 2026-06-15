import { SaveManager } from '../save/save.js';

export class Garage {
  constructor() {
    this.save = new SaveManager();
    this.panel = document.querySelector('#garage-panel');
    this.overlay = document.querySelector('#garage-overlay');
    this.openBtn = document.querySelector('#garage-button');
    this.closeBtn = document.querySelector('#garage-close');
    this.moneyDisplay = document.querySelector('#garage-money');

    this.upgradeButtons = {
      speed: document.querySelector('#upgrade-speed'),
      handling: document.querySelector('#upgrade-handling'),
      nitro: document.querySelector('#upgrade-nitro'),
    };

    this.levelDisplays = {
      speed: document.querySelector('#level-speed'),
      handling: document.querySelector('#level-handling'),
      nitro: document.querySelector('#level-nitro'),
    };

    this.costDisplays = {
      speed: document.querySelector('#cost-speed'),
      handling: document.querySelector('#cost-handling'),
      nitro: document.querySelector('#cost-nitro'),
    };

    this.bindEvents();
  }

  bindEvents() {
    this.openBtn?.addEventListener('click', () => this.open());
    this.closeBtn?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());

    for (const type of ['speed', 'handling', 'nitro']) {
      this.upgradeButtons[type]?.addEventListener('click', () => this.purchaseUpgrade(type));
    }
  }

  open() {
    this.updateUI();
    this.panel?.classList.remove('hidden');
    this.overlay?.classList.remove('hidden');
  }

  close() {
    this.panel?.classList.add('hidden');
    this.overlay?.classList.add('hidden');
  }

  updateUI() {
    if (this.moneyDisplay) this.moneyDisplay.textContent = `₹${this.save.money}`;

    for (const type of ['speed', 'handling', 'nitro']) {
      const level = this.save.upgrades[type];
      const cost = this.save.upgradeCost(type, level);
      const maxed = level >= 5;

      if (this.levelDisplays[type]) this.levelDisplays[type].textContent = `${level}/5`;
      if (this.costDisplays[type]) this.costDisplays[type].textContent = maxed ? 'MAX' : `₹${cost}`;

      const btn = this.upgradeButtons[type];
      if (btn) {
        btn.disabled = maxed || this.save.money < cost;
        btn.textContent = maxed ? 'Maxed' : 'Upgrade';
      }
    }
  }

  purchaseUpgrade(type) {
    const level = this.save.upgrades[type];
    if (level >= 5) return;
    const cost = this.save.upgradeCost(type, level);
    if (this.save.money < cost) return;

    this.save.money -= cost;
    this.save.upgrades[type] = level + 1;
    this.save.save();
    this.updateUI();
  }

  getMultipliers() {
    return {
      speed: this.save.getUpgradeMultiplier('speed'),
      handling: this.save.getUpgradeMultiplier('handling'),
      nitro: this.save.getUpgradeMultiplier('nitro'),
    };
  }
}
