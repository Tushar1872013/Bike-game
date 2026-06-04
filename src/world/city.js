import * as THREE from 'three';

export class City {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
  }

  build() {
    this.addGround();
    this.addRoads();
    this.addBuildings();
    this.addTrees();
    this.addTrafficLights();
  }

  addGround() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(280, 280), new THREE.MeshStandardMaterial({ color: 0x5d9f5d, roughness: 0.9 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  addRoads() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x34383b, roughness: 0.85 });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf4d35e });
    for (const x of [-48, 0, 48]) {
      const road = new THREE.Mesh(new THREE.BoxGeometry(12, 0.05, 260), mat);
      road.position.set(x, 0.03, 0);
      road.receiveShadow = true;
      this.scene.add(road);
      this.addLaneLines(x, true, lineMat);
    }
    for (const z of [-48, 0, 48]) {
      const road = new THREE.Mesh(new THREE.BoxGeometry(260, 0.055, 12), mat);
      road.position.set(0, 0.04, z);
      road.receiveShadow = true;
      this.scene.add(road);
      this.addLaneLines(z, false, lineMat);
    }
  }

  addLaneLines(offset, vertical, mat) {
    for (let i = -110; i <= 110; i += 14) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(vertical ? 0.22 : 5, 0.06, vertical ? 5 : 0.22), mat);
      line.position.set(vertical ? offset : i, 0.09, vertical ? i : offset);
      this.scene.add(line);
    }
  }

  addBuildings() {
    const colors = [0xc66b3d, 0xf2c14e, 0x5f8aa3, 0xd8d0c1, 0x7a9e7e];
    for (let x = -96; x <= 96; x += 24) {
      for (let z = -96; z <= 96; z += 24) {
        if (Math.abs(x % 48) < 8 || Math.abs(z % 48) < 8) continue;
        const h = 5 + ((x * x + z * z) % 15);
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(13, h, 13), new THREE.MeshStandardMaterial({ color: colors[Math.abs(x + z) % colors.length], roughness: 0.72 }));
        mesh.position.set(x, h / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.colliders.push({ x, z, r: 9 });
      }
    }
  }

  addTrees() {
    const trunk = new THREE.CylinderGeometry(0.35, 0.5, 2.2, 8);
    const leaves = new THREE.ConeGeometry(1.9, 4, 9);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x73513a });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x236b3a });
    const trunkMesh = new THREE.InstancedMesh(trunk, trunkMat, 84);
    const leafMesh = new THREE.InstancedMesh(leaves, leafMat, 84);
    const matrix = new THREE.Matrix4();
    let index = 0;
    for (let i = -120; i <= 120; i += 20) {
      for (const side of [-1, 1]) {
        const x = side * (18 + Math.abs((i * 7) % 18));
        const z = i;
        matrix.makeTranslation(x, 1.1, z);
        trunkMesh.setMatrixAt(index, matrix);
        matrix.makeTranslation(x, 4, z);
        leafMesh.setMatrixAt(index, matrix);
        index++;
      }
    }
    trunkMesh.castShadow = true;
    leafMesh.castShadow = true;
    this.scene.add(trunkMesh, leafMesh);
  }

  addTrafficLights() {
    const group = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x202225 });
    const red = new THREE.MeshStandardMaterial({ color: 0xff2b2b, emissive: 0x550000 });
    for (const x of [-6, 6, 42, 54, -42, -54]) {
      for (const z of [-6, 6, 42, 54, -42, -54]) {
        if (Math.abs(x) !== 6 && Math.abs(z) !== 6) continue;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4), poleMat);
        pole.position.set(x, 2, z);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), red);
        lamp.position.set(x, 4.15, z);
        group.add(pole, lamp);
      }
    }
    this.scene.add(group);
  }

  resolveCollisions(bike) {
    for (const collider of this.colliders) {
      const dx = bike.mesh.position.x - collider.x;
      const dz = bike.mesh.position.z - collider.z;
      const distance = Math.hypot(dx, dz);
      if (distance > 0 && distance < collider.r + bike.radius) bike.stopAndBounce(dx / distance, dz / distance);
    }
  }
}
