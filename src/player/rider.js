import * as THREE from 'three';

/**
 * RiderCharacter
 * Simple procedural 3D rider character attached to the bike.
 * Phase 1: placeholder geometry with basic animations.
 */
export class RiderCharacter {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.buildMesh();
  }

  buildMesh() {
    // Helmet (sphere)
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.1 })
    );
    helmet.position.set(0, 1.18, 0.35);
    helmet.castShadow = true;
    this.group.add(helmet);

    // Visor (small dark plane on front of helmet)
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.08, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.1, metalness: 0.8 })
    );
    visor.position.set(0, 1.18, 0.52);
    this.group.add(visor);

    // Torso (leather jacket)
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.45, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x3e1e1e, roughness: 0.6 })
    );
    torso.position.set(0, 0.88, 0.05);
    torso.castShadow = true;
    this.group.add(torso);

    // Arms (leaning forward to handlebars)
    const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.42);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x2a1515, roughness: 0.6 });
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.set(side * 0.28, 1.0, 0.35);
      arm.rotation.z = side * 0.3;
      arm.rotation.x = -0.4;
      arm.castShadow = true;
      this.group.add(arm);
    }

    // Legs (straddling the bike)
    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.55);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1a3a5a, roughness: 0.7 });
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(side * 0.22, 0.55, -0.05);
      leg.rotation.z = side * 0.15;
      leg.castShadow = true;
      this.group.add(leg);
    }

    // Boots
    const bootGeo = new THREE.BoxGeometry(0.14, 0.12, 0.22);
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5 });
    for (const side of [-1, 1]) {
      const boot = new THREE.Mesh(bootGeo, bootMat);
      boot.position.set(side * 0.24, 0.28, 0.05);
      boot.castShadow = true;
      this.group.add(boot);
    }

    // Gloves
    const gloveGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5 });
    for (const side of [-1, 1]) {
      const glove = new THREE.Mesh(gloveGeo, gloveMat);
      glove.position.set(side * 0.42, 0.85, 0.55);
      glove.castShadow = true;
      this.group.add(glove);
    }
  }

  attachToBike(bikeMesh) {
    bikeMesh.add(this.group);
    // Position the rider on the bike seat, rotated 180° to face forward
    this.group.position.set(0, 0, -0.15);
    this.group.rotation.y = Math.PI;
  }

  /** Lean the rider based on steering and speed. */
  update(steer, speed, delta) {
    // Lean into turns
    const targetLeanZ = -steer * 0.35;
    const targetLeanX = speed > 2 ? -0.15 : 0; // lean forward when accelerating
    this.group.rotation.z += (targetLeanZ - this.group.rotation.z) * Math.min(delta * 8, 1);
    this.group.rotation.x += (targetLeanX - this.group.rotation.x) * Math.min(delta * 4, 1);
  }
}
