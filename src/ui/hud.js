export class HUD {
  constructor() {
    this.loading = document.querySelector('#loading');
    this.loadingStatus = document.querySelector('#loading-status');
    this.money = document.querySelector('#money');
    this.time = document.querySelector('#time');
    this.fps = document.querySelector('#fps');
    this.speed = document.querySelector('#speed');
    this.pause = document.querySelector('#pause');
    this.minimap = document.querySelector('#minimap');
    this.cameraMode = document.querySelector('#camera-mode');
    this.checkpointMsg = document.querySelector('#checkpoint-msg');
    this.checkpointBar = document.querySelector('#checkpoint-bar');
    this.checkpointText = document.querySelector('#checkpoint-text');
    this.soundBtn = document.querySelector('#sound-toggle');
    this.garageBtn = document.querySelector('#garage-button');
    this.ctx = this.minimap.getContext('2d');
    this.checkpointMsgTimer = 0;
  }

  setLoading(text) {
    this.loadingStatus.textContent = text;
  }

  hideLoading() {
    this.loading.classList.remove('loading');
    this.loading.classList.add('hidden');
  }

  onPause(callback) {
    this.pause.addEventListener('click', callback);
  }

  onCameraMode(callback) {
    this.cameraMode.addEventListener('click', callback);
  }

  onGarage(callback) {
    this.garageBtn?.addEventListener('click', callback);
  }

  onSoundToggle(callback) {
    this.soundBtn?.addEventListener('click', callback);
  }

  setPaused(paused) {
    this.pause.textContent = paused ? '▶' : 'II';
  }

  setSoundEnabled(enabled) {
    if (this.soundBtn) this.soundBtn.textContent = enabled ? '🔊' : '🔇';
  }

  showCheckpointMessage(text) {
    if (this.checkpointMsg) {
      this.checkpointMsg.textContent = text;
      this.checkpointMsg.classList.remove('hidden');
      this.checkpointMsgTimer = 1.5;
    }
  }

  render(bike, elapsed, fps, cameraMode, checkpoints, save) {
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = Math.floor(elapsed % 60).toString().padStart(2, '0');
    this.money.textContent = `Money ₹${save.money}`;
    this.time.textContent = `Time ${minutes}:${seconds}`;
    this.fps.textContent = `FPS ${Math.round(fps)}`;
    this.speed.textContent = Math.abs(Math.round(bike.speed * 3.6));
    this.cameraMode.textContent = cameraMode;

    // Checkpoint bar
    if (this.checkpointBar && this.checkpointText && checkpoints) {
      const progress = checkpoints.progress;
      const total = checkpoints.total;
      this.checkpointBar.style.width = `${(progress / total) * 100}%`;
      this.checkpointText.textContent = `Checkpoints ${progress}/${total}`;
    }

    // Checkpoint message fade
    if (this.checkpointMsgTimer > 0) {
      this.checkpointMsgTimer -= 0.016;
      if (this.checkpointMsgTimer <= 0 && this.checkpointMsg) {
        this.checkpointMsg.classList.add('hidden');
      }
    }

    this.drawMinimap(bike, checkpoints);
  }

  drawMinimap(bike, checkpoints) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 150, 150);
    ctx.fillStyle = '#23333a';
    ctx.fillRect(0, 0, 150, 150);
    ctx.strokeStyle = '#77888e';
    ctx.lineWidth = 8;
    for (const n of [24, 75, 126]) {
      ctx.beginPath();
      ctx.moveTo(n, 0);
      ctx.lineTo(n, 150);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, n);
      ctx.lineTo(150, n);
      ctx.stroke();
    }

    // Draw checkpoints
    if (checkpoints && checkpoints.nextPosition) {
      const next = checkpoints.nextPosition;
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(75 + next.x * 0.45, 75 + next.z * 0.45, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw bike
    ctx.fillStyle = '#e53935';
    ctx.beginPath();
    ctx.arc(75 + bike.mesh.position.x * 0.45, 75 + bike.mesh.position.z * 0.45, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
