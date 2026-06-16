import * as THREE from 'three';

const CHECKPOINT_COUNT = 6;

export class CheckpointSystem {
  constructor(scene) {
    this.scene = scene;
    this.checkpoints = [];
    this.activeIndex = 0;
    this.collected = 0;
    this.meshes = [];
    this.ringGeo = new THREE.TorusGeometry(3.5, 0.3, 8, 48);
    this.discGeo = new THREE.CylinderGeometry(10, 10, 0.05, 48);
    this.poleMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    this.coneMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.8 });
    // Base materials — each checkpoint will clone its own so opacity animation is independent
    this.baseActiveMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.6,
      transparent: true, opacity: 0.9, side: THREE.DoubleSide
    });
    this.baseInactiveMat = new THREE.MeshStandardMaterial({
      color: 0x555555, emissive: 0x222222, emissiveIntensity: 0.2,
      transparent: true, opacity: 0.35, side: THREE.DoubleSide
    });
  }

  build() {
    // Place checkpoints at road intersections and midpoints
    const positions = [
      { x: 0, z: 0 },       // center
      { x: 48, z: 0 },      // east intersection
      { x: -48, z: 0 },     // west intersection
      { x: 0, z: 48 },      // north intersection
      { x: 0, z: -48 },     // south intersection
      { x: 48, z: 48 },     // far corner
    ];

    for (let i = 0; i < CHECKPOINT_COUNT; i++) {
      const pos = positions[i];
      const group = new THREE.Group();
      group.position.set(pos.x, 0, pos.z);

      // Active / inactive material clones (unique per checkpoint)
      const activeMat = this.baseActiveMat.clone();
      const inactiveMat = this.baseInactiveMat.clone();

      // Ground glow disc (always visible, more subtle when inactive)
      const disc = new THREE.Mesh(this.discGeo, i === 0 ? activeMat.clone() : inactiveMat.clone());
      disc.position.y = 0.03;
      disc.rotation.x = 0;
      group.add(disc);

      // Glowing ring floating above
      const ring = new THREE.Mesh(this.ringGeo, i === 0 ? activeMat : inactiveMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 1.8;
      group.add(ring);

      // Small pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.6), this.poleMat);
      pole.position.y = 1.8;
      group.add(pole);

      // Floating marker above
      const marker = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 4), this.coneMat.clone());
      marker.position.y = 4.0;
      group.add(marker);

      // Pulsing light sphere
      const lightSphere = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), this.coneMat.clone());
      lightSphere.position.y = 3.2;
      group.add(lightSphere);

      this.scene.add(group);
      this.meshes.push({ group, activeMat, inactiveMat, disc, ring, marker, lightSphere });
      this.checkpoints.push({
        x: pos.x, z: pos.z,
        radius: 10, // was 3.5 — now covers full 12×12 road intersection
        collected: i === 0 ? false : true,
        index: i
      });
    }
    this.activeIndex = 0;
    this.collected = 0;
  }

  update(delta) {
    const active = this.meshes[this.activeIndex];
    if (!active) return;

    // Spin the ring
    active.group.rotation.y += delta * 1.5;

    // Pulse the active ring opacity
    active.ring.material.opacity = 0.6 + Math.sin(performance.now() * 0.004) * 0.3;

    // Pulse the ground disc
    active.disc.material.opacity = 0.4 + Math.sin(performance.now() * 0.004) * 0.25;

    // Float the marker and light sphere
    const hover = Math.sin(performance.now() * 0.003) * 0.4;
    active.marker.position.y = 4.0 + hover;
    active.lightSphere.position.y = 3.2 + hover * 0.7;
    active.lightSphere.scale.setScalar(1 + Math.sin(performance.now() * 0.006) * 0.15);
  }

  /**
   * Check if the bike is within range of the active checkpoint.
   * Returns reward money if collected, else 0.
   */
  checkCollection(bike) {
    const cp = this.checkpoints[this.activeIndex];
    if (!cp || cp.collected) return 0;

    const dx = bike.mesh.position.x - cp.x;
    const dz = bike.mesh.position.z - cp.z;
    const dist = Math.hypot(dx, dz);

    if (dist < cp.radius) {
      // Visual: deactivate current
      const current = this.meshes[this.activeIndex];
      current.ring.material = current.inactiveMat;
      current.disc.material = current.inactiveMat.clone();
      current.disc.material.opacity = 0.25;
      cp.collected = true;
      this.collected++;

      // Activate next checkpoint
      this.activeIndex = (this.activeIndex + 1) % this.checkpoints.length;
      const next = this.checkpoints[this.activeIndex];
      next.collected = false;
      const nextMesh = this.meshes[this.activeIndex];
      nextMesh.ring.material = nextMesh.activeMat;
      nextMesh.disc.material = nextMesh.activeMat.clone();
      nextMesh.disc.material.opacity = 0.5;

      console.log(`Checkpoint ${cp.index} collected! Next: ${this.activeIndex} at (${next.x}, ${next.z})`);
      return 100; // ₹100 per checkpoint
    }
    return 0;
  }

  get progress() {
    return this.collected;
  }

  get total() {
    return this.checkpoints.length;
  }

  get nextPosition() {
    const cp = this.checkpoints[this.activeIndex];
    return cp ? { x: cp.x, z: cp.z } : null;
  }

  distanceToNext(bike) {
    const cp = this.checkpoints[this.activeIndex];
    if (!cp || cp.collected) return null;
    const dx = bike.mesh.position.x - cp.x;
    const dz = bike.mesh.position.z - cp.z;
    return Math.hypot(dx, dz);
  }

  reset() {
    this.activeIndex = 0;
    this.collected = 0;
    for (let i = 0; i < this.checkpoints.length; i++) {
      this.checkpoints[i].collected = i === 0 ? false : true;
      const m = this.meshes[i];
      m.ring.material = i === 0 ? m.activeMat : m.inactiveMat;
      m.disc.material = (i === 0 ? m.activeMat : m.inactiveMat).clone();
      m.disc.material.opacity = i === 0 ? 0.5 : 0.25;
    }
  }
}
