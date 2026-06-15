import * as THREE from 'three';

const CHECKPOINT_COUNT = 6;

export class CheckpointSystem {
  constructor(scene) {
    this.scene = scene;
    this.checkpoints = [];
    this.activeIndex = 0;
    this.collected = 0;
    this.meshes = [];
    this.ringGeo = new THREE.TorusGeometry(2.5, 0.25, 8, 32);
    this.activeMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.6, transparent: true, opacity: 0.9 });
    this.inactiveMat = new THREE.MeshStandardMaterial({ color: 0x555555, emissive: 0x222222, emissiveIntensity: 0.2, transparent: true, opacity: 0.4 });
    this.poleMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
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
      group.position.set(pos.x, 1.5, pos.z);

      // Glowing ring
      const ring = new THREE.Mesh(this.ringGeo, i === 0 ? this.activeMat : this.inactiveMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      // Small pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3), this.poleMat);
      pole.position.y = -1.5;
      group.add(pole);

      // Floating marker above
      const marker = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 0.6, 4),
        new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.8 })
      );
      marker.position.y = 2.5;
      group.add(marker);

      this.scene.add(group);
      this.meshes.push(group);
      this.checkpoints.push({ x: pos.x, z: pos.z, radius: 3.5, collected: i === 0 ? false : true, index: i });
    }
    this.activeIndex = 0;
    this.collected = 0;
  }

  update(delta) {
    // Animate active checkpoint ring
    const activeMesh = this.meshes[this.activeIndex];
    if (activeMesh) {
      activeMesh.rotation.y += delta * 1.5;
      const ring = activeMesh.children[0];
      ring.material.opacity = 0.6 + Math.sin(performance.now() * 0.004) * 0.3;
      // Float the marker
      const marker = activeMesh.children[2];
      marker.position.y = 2.5 + Math.sin(performance.now() * 0.003) * 0.3;
    }
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
      cp.collected = true;
      const ring = this.meshes[this.activeIndex].children[0];
      ring.material = this.inactiveMat;
      this.collected++;

      // Activate next checkpoint
      this.activeIndex = (this.activeIndex + 1) % this.checkpoints.length;
      const next = this.checkpoints[this.activeIndex];
      next.collected = false;
      const nextRing = this.meshes[this.activeIndex].children[0];
      nextRing.material = this.activeMat;

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

  reset() {
    this.activeIndex = 0;
    this.collected = 0;
    for (let i = 0; i < this.checkpoints.length; i++) {
      this.checkpoints[i].collected = i === 0 ? false : true;
      const ring = this.meshes[i].children[0];
      ring.material = i === 0 ? this.activeMat : this.inactiveMat;
    }
  }
}
