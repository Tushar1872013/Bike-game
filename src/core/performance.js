export class PerformanceManager {
  constructor(renderer, options = {}) {
    this.renderer = renderer;
    this.targetFps = options.targetFps ?? 60;
    this.minFps = options.minFps ?? 55;
    this.maxDelta = options.maxDelta ?? 1 / 30;
    this.devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.pixelRatio = Math.min(this.devicePixelRatio, options.startPixelRatio ?? 1.5);
    this.minPixelRatio = options.minPixelRatio ?? 0.75;
    this.frameInterval = 1000 / this.targetFps;
    this.lastFrameTime = 0;
    this.smoothedFps = this.targetFps;
    this.qualityTimer = 0;
    this.applyPixelRatio();
  }

  shouldRunFrame(timestamp) {
    if (!this.lastFrameTime) {
      this.lastFrameTime = timestamp;
      return true;
    }

    return timestamp - this.lastFrameTime >= this.frameInterval - 0.75;
  }

  beginFrame(timestamp) {
    const elapsedMs = Math.max(this.frameInterval, timestamp - this.lastFrameTime);
    this.lastFrameTime = timestamp - ((timestamp - this.lastFrameTime) % this.frameInterval);
    const delta = Math.min(elapsedMs / 1000, this.maxDelta);
    const instantFps = 1 / delta;
    this.smoothedFps += (instantFps - this.smoothedFps) * 0.08;
    return delta;
  }

  updateQuality(delta) {
    this.qualityTimer += delta;
    if (this.qualityTimer < 1.5) return;
    this.qualityTimer = 0;

    if (this.smoothedFps < this.minFps && this.pixelRatio > this.minPixelRatio) {
      this.pixelRatio = Math.max(this.minPixelRatio, this.pixelRatio - 0.15);
      this.applyPixelRatio();
      return;
    }

    if (this.smoothedFps > this.targetFps - 1 && this.pixelRatio < this.devicePixelRatio) {
      this.pixelRatio = Math.min(this.devicePixelRatio, this.pixelRatio + 0.1);
      this.applyPixelRatio();
    }
  }

  applyPixelRatio() {
    this.renderer.setPixelRatio(this.pixelRatio);
  }

  get displayFps() {
    return Math.min(this.targetFps, Math.round(this.smoothedFps));
  }
}
