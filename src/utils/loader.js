export class AssetLoader {
  constructor(onProgress = () => {}) {
    this.onProgress = onProgress;
  }

  async ready() {
    this.onProgress(100);
  }
}
