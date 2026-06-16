import * as THREE from 'three';
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
import { Menu } from '../ui/menu.js';
import { Garage } from '../ui/garage.js';
import { AssetLoader } from '../utils/loader.js';
import { AudioEngine } from '../audio/audio.js';
import { CheckpointSystem } from '../missions/checkpoints.js';
import { SaveManager } from '../save/save.js';
import { PlayerStats } from '../player/playerStats.js';
import { RiderCharacter } from '../player/rider.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = createScene();
    this.renderer = createRenderer(canvas);
    this.performance = new PerformanceManager(this.renderer);
    this.physics = new PhysicsWorld();
    this.hud = new HUD();
    this.menu = new Menu();
    this.garage = new Garage();
    this.audio = new AudioEngine();
    this.save = new SaveManager();
    this.playerStats = new PlayerStats(this.save);
    this.checkpoints = new CheckpointSystem(this.scene);
    this.loader = new AssetLoader((percent) => this.menu.setLoading(`Loading assets ${percent}%`));
    this.camera = new FollowCamera(this.renderer.domElement);
    this.controls = new Controls();
    this.city = new City(this.scene);
    this.traffic = new Traffic(this.scene);
    this.bike = null;
    this.rider = null;
    this.elapsed = 0;
    this.paused = false;
    this.started = false;
    this.runDistance = 0;
    this.lastBikePos = new THREE.Vector3();

    this.menu.onStart(() => this.startGame());
    this.hud.onGarage(() => this.garage.open());
    this.hud.onSoundToggle(() => this.toggleSound());
  }

  async start() {
    await this.load();
    window.addEventListener('resize', () => this.resize());
    this.hud.onPause(() => this.togglePause());
    this.hud.onCameraMode(() => this.camera.nextMode());
    this.resize();
    this.menu.showStartScreen(this.save);
  }

  startGame() {
    if (this.started) return;
    this.started = true;
    this.menu.hideStartScreen();
    this.audio.init();
    this.audio.resume();
    this.audio.startEngine();
    this.audio.setEnabled(this.save.soundEnabled);
    this.checkpoints.reset();
    this.playerStats.reset();
    this.runDistance = 0;
    this.lastBikePos.copy(this.bike.mesh.position);
    this.renderer.setAnimationLoop((timestamp) => this.update(timestamp));
  }

  async load() {
    this.hud.setLoading('Loading assets 0%');
    const assets = await this.loader.ready();
    this.city.build(assets);
    this.traffic.build(assets);
    this.checkpoints.build();
    const multipliers = this.garage.getMultipliers();
    this.bike = new Bike(this.scene, this.physics, assets, multipliers);
    this.rider = new RiderCharacter(this.scene);
    this.rider.attachToBike(this.bike.mesh);
    // Diagnostic: log scene and asset info to help debugging invisible scene issues
    // (Will appear in the browser console)
    try {
      // eslint-disable-next-line no-console
      console.log('Game.load: assets', assets);
      // eslint-disable-next-line no-console
      console.log('Game.load: scene children', this.scene.children.length);
      // eslint-disable-next-line no-console
      console.log('Game.load: bike position', this.bike && this.bike.mesh ? this.bike.mesh.position : null);
    } catch (e) {
      // ignore logging errors
    }

    // Ensure camera has a sensible fallback position so the world is visible
    if (this.camera && this.camera.instance) {
      this.camera.instance.position.set(0, 12, 18);
      this.camera.instance.lookAt(0, 2, 0);
    }

    this.hud.setLoading('Ready!');
    // Brief delay to allow the user to see "Ready!" before transition
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.hud.hideLoading();
  }

  update(timestamp) {
    if (!this.performance.shouldRunFrame(timestamp)) return;
    const delta = this.performance.beginFrame(timestamp);

    if (this.paused) {
      this.hud.render(this.bike, this.elapsed, this.performance.displayFps, this.camera.modeName, this.checkpoints, this.save, this.playerStats);
      this.renderer.render(this.scene, this.camera.instance);
      return;
    }

    this.elapsed += delta;
    const input = this.controls.read();

    // Horn
    if (input.horn && this.bike.hornCooldown <= 0) {
      this.bike.hornCooldown = 0.4;
      this.audio.playHorn();
    }

    // Nitro drain/refill
    if (input.nitro) {
      this.playerStats.useNitro(delta);
    } else {
      this.playerStats.refillNitro(delta);
    }

    // Stamina regen & heal
    this.playerStats.regenerate(delta);
    this.playerStats.heal(delta);

    this.bike.update(delta, input);
    this.traffic.update(delta);
    this.physics.step(delta);
    this.city.resolveCollisions(this.bike);
    this.traffic.resolveCollisions(this.bike);
    this.checkpoints.update(delta);

    // Update rider animation
    if (this.rider) {
      this.rider.update(input.steer, this.bike.speed, delta);
    }

    // Checkpoints
    const reward = this.checkpoints.checkCollection(this.bike);
    if (reward > 0) {
      this.save.money += reward;
      this.playerStats.addXP(25); // 25 XP per checkpoint
      this.audio.playCheckpoint();
      this.hud.showCheckpointMessage(`+₹${reward}`);
    }

    // Distance tracking & XP
    const dist = this.bike.mesh.position.distanceTo(this.lastBikePos);
    this.runDistance += dist;
    this.lastBikePos.copy(this.bike.mesh.position);
    if (dist > 0.1) {
      this.playerStats.addXP(dist * 0.5); // XP for driving
    }

    // Collision damage
    if (this.bike.speed < 1 && dist > 0.5) {
      this.playerStats.takeDamage(5);
      this.audio.playCollision();
    }

    this.camera.update(delta, this.bike);
    this.city.update(this.camera.instance);
    this.performance.updateQuality(delta);
    this.audio.updateEngine(this.bike.speed);
    this.hud.render(this.bike, this.elapsed, this.performance.displayFps, this.camera.modeName, this.checkpoints, this.save, this.playerStats);
    this.renderer.render(this.scene, this.camera.instance);
  }

  togglePause() {
    this.paused = !this.paused;
    this.hud.setPaused(this.paused);
  }

  toggleSound() {
    const enabled = !this.save.soundEnabled;
    this.save.soundEnabled = enabled;
    this.audio.setEnabled(enabled);
    this.hud.setSoundEnabled(enabled);
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.camera.resize(width / height);
  }
}
