import * as THREE from 'three';

export class Bike {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;
    this.speed = 0;
    this.heading = 0;
    this.maxSpeed = 150 / 3.6;
    this.radius = 1.35;
    this.mesh = this.createMesh();
    this.mesh.position.set(0, 0.65, 4);
    scene.add(this.mesh);
  }

  createMesh() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.45, 2.25), new THREE.MeshStandardMaterial({ color: 0xd32929, roughness: 0.45 }));
    body.castShadow = true;
    body.position.y = 0.55;
    group.add(body);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.22, 0.95), new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.8 }));
    seat.position.set(0, 0.88, -0.18);
    seat.castShadow = true;
    group.add(seat);

    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.18, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.7 });
    for (const z of [-0.9, 0.9]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, 0.28, z);
      wheel.castShadow = true;
      group.add(wheel);
    }

    const handle = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0x202428 }));
    handle.position.set(0, 1.02, 0.88);
    handle.castShadow = true;
    group.add(handle);
    return group;
  }

  update(delta, input) {
    const accel = input.nitro ? 30 : 18;
    const brake = this.speed > 0 ? 32 : 18;

    if (input.throttle > 0) this.speed += accel * delta;
    if (input.throttle < 0) this.speed -= brake * delta;
    if (input.brake) this.speed -= Math.sign(this.speed || 1) * 36 * delta;
    if (!input.throttle && !input.brake) this.speed *= Math.exp(-1.7 * delta);

    const max = input.nitro ? this.maxSpeed * 1.35 : this.maxSpeed;
    this.speed = THREE.MathUtils.clamp(this.speed, -12, max);
    if (Math.abs(this.speed) < 0.05) this.speed = 0;

    const turnStrength = THREE.MathUtils.clamp(Math.abs(this.speed) / 18, 0.25, 1);
    this.heading -= input.steer * turnStrength * 2.25 * delta * Math.sign(this.speed || 1);
    this.mesh.rotation.y = this.heading;

    this.mesh.position.x += Math.sin(this.heading) * this.speed * delta;
    this.mesh.position.z += Math.cos(this.heading) * this.speed * delta;
    this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, input.steer * 0.18 * turnStrength, 0.12);
  }

  stopAndBounce(normalX, normalZ) {
    this.mesh.position.x += normalX * 0.65;
    this.mesh.position.z += normalZ * 0.65;
    this.speed *= -0.15;
  }
}
