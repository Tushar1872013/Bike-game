import { createScene } from './scene.js';
import { createRenderer } from './renderer.js';
import { FollowCamera } from './camera.js';
import { PerformanceManager } from './performance.js';
import { Bike } from '../player/bike.js';
import { Controls } from '../player/controls.js';
import { PhysicsWorld } from '../player/physics.js';
import { City } from '../world/city.js';
import { Traffic } from '../world/traffic.js';
import { HUD } from '../ui/hud.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = createScene();
    this.renderer = createRenderer(canvas);
    this.performance = new PerformanceManager(this.renderer);
    this.physics = new PhysicsWorld();
    this.bike = new Bike(this.scene, this.physics);
    this.camera = new FollowCamera(this.renderer.domElement);
    this.controls = new Controls();
    this.city = new City(this.scene, this.physics);
    this.traffic = new Traffic(this.scene, this.physics);
    this.hud = new HUD();
    this.elapsed = 0;
    this.paused = false;
  }

  async start() {
    await this.load();
    window.addEventListener('resize', () => this.resize());
    this.hud.onPause(() => this.togglePause());
    this.hud.onCameraMode(() => this.camera.nextMode());
    this.resize();
    this.renderer.setAnimationLoop((timestamp) => this.update(timestamp));
  }

  async load() {
    this.hud.setLoading('Textures 50%');
    this.city.build();
    this.hud.setLoading('Models 80%');
    this.traffic.build();
    this.hud.setLoading('Ready!');
    await new Promise((resolve) => setTimeout(resolve, 350));
    this.hud.hideLoading();
  }

  update(timestamp) {
    if (!this.performance.shouldRunFrame(timestamp)) return;
    const delta = this.performance.beginFrame(timestamp);

    if (this.paused) {
      this.hud.render(this.bike, this.elapsed, this.performance.displayFps, this.camera.modeName);
      this.renderer.render(this.scene, this.camera.instance);
      return;
    }

    this.elapsed += delta;
    const input = this.controls.read();
    this.bike.update(delta, input);
    this.traffic.update(delta);
    this.physics.step(delta);
    this.city.resolveCollisions(this.bike);
    this.traffic.resolveCollisions(this.bike);
    this.camera.update(delta, this.bike);
    this.performance.updateQuality(delta);
    this.hud.render(this.bike, this.elapsed, this.performance.displayFps, this.camera.modeName);
    this.renderer.render(this.scene, this.camera.instance);
  }

  togglePause() {
    this.paused = !this.paused;
    this.hud.setPaused(this.paused);
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.camera.resize(width / height);
  }
}
