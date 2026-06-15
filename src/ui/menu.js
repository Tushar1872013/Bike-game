export class Menu {
  constructor() {
    this.startScreen = document.querySelector('#start-screen');
    this.startButton = document.querySelector('#start-button');
    this.title = document.querySelector('#start-title');
    this.subtitle = document.querySelector('#start-subtitle');
    this.controls = document.querySelector('#start-controls');
    this.loading = document.querySelector('#loading');
    this.loadingStatus = document.querySelector('#loading-status');
  }

  onStart(callback) {
    this.startButton.addEventListener('click', callback);
  }

  showStartScreen(save) {
    this.startScreen.classList.remove('hidden');
    if (save && this.subtitle) {
      this.subtitle.innerHTML = `Ride through the city, dodge traffic, and keep your run smooth.<br>
        <strong style="color:#47c9ff">High Score:</strong> ${Math.round(save.highScore)}m · 
        <strong style="color:#47c9ff">Money:</strong> ₹${save.money}`;
    }
  }

  hideStartScreen() {
    this.startScreen.classList.add('hidden');
  }

  setLoading(text) {
    this.loadingStatus.textContent = text;
  }

  hideLoading() {
    this.loading.classList.add('hidden');
  }
}
