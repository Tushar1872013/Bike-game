/**
 * AudioEngine
 * Procedural sound engine using Web Audio API.
 * No external assets required — everything is synthesized.
 */
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.engineNode = null;
    this.engineFilter = null;
    this.engineGain = null;
    this.soundEnabled = true;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  setEnabled(enabled) {
    this.soundEnabled = enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = enabled ? 0.4 : 0;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Start the engine drone. Call once when the game starts.
   */
  startEngine() {
    if (!this.ctx || !this.soundEnabled) return;
    this.stopEngine();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.value = 55; // base engine rumble

    filter.type = 'lowpass';
    filter.frequency.value = 300;

    gain.gain.value = 0.15;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();

    this.engineNode = osc;
    this.engineFilter = filter;
    this.engineGain = gain;
  }

  /**
   * Update engine pitch/volume based on bike speed.
   * @param {number} speed - current speed in m/s
   */
  updateEngine(speed) {
    if (!this.ctx || !this.engineNode || !this.soundEnabled) return;
    const normalized = Math.min(speed / 25, 1); // 25 m/s ~ 90 km/h max
    const targetFreq = 55 + normalized * 110; // 55 Hz → 165 Hz
    const targetFilter = 300 + normalized * 1200;
    const targetGain = 0.1 + normalized * 0.15;

    this.engineNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
    this.engineFilter.frequency.setTargetAtTime(targetFilter, this.ctx.currentTime, 0.05);
    this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
  }

  stopEngine() {
    if (this.engineNode) {
      try { this.engineNode.stop(); } catch (e) {}
      this.engineNode = null;
    }
  }

  /**
   * Play a horn beep.
   */
  playHorn() {
    if (!this.ctx || !this.soundEnabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = 330;

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  /**
   * Play checkpoint collect sound.
   */
  playCheckpoint() {
    if (!this.ctx || !this.soundEnabled) return;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  }

  /**
   * Play upgrade purchase sound.
   */
  playUpgrade() {
    if (!this.ctx || !this.soundEnabled) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.25);
    });
  }

  /**
   * Play collision sound.
   */
  playCollision() {
    if (!this.ctx || !this.soundEnabled) return;
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    noise.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }
}
