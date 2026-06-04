import * as THREE from 'three';

export class Traffic {
  constructor(scene) {
    this.scene = scene;
    this.cars = [];
  }

  build() {
    const colors = [0x2f80ed, 0xf2994a, 0x27ae60, 0xeb5757, 0xf2c94c];
    for (let i = 0; i < 18; i++) {
      const vertical = i % 2 === 0;
      const road = [-48, 0, 48][i % 3];
      const lane = i % 4 < 2 ? -2.7 : 2.7;
      const car = this.createCar(colors[i % colors.length]);
      car.position.set(vertical ? road + lane : -95 + i * 11, 0.45, vertical ? -100 + i * 13 : road + lane);
      car.rotation.y = vertical ? 0 : Math.PI / 2;
      this.scene.add(car);
      this.cars.push({ mesh: car, vertical, speed: 8 + (i % 5), dir: i % 4 < 2 ? 1 : -1, radius: 1.8 });
    }
  }

  createCar(color) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.8, 3.5), new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
    body.position.y = 0.45;
    body.castShadow = true;
    group.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.55, 1.55), new THREE.MeshStandardMaterial({ color: 0xbfd9e8, roughness: 0.25 }));
    cabin.position.set(0, 1.05, -0.2);
    cabin.castShadow = true;
    group.add(cabin);
    return group;
  }

  update(delta) {
    for (const car of this.cars) {
      if (car.vertical) {
        car.mesh.position.z += car.speed * car.dir * delta;
        if (Math.abs(car.mesh.position.z) > 124) car.mesh.position.z *= -0.95;
      } else {
        car.mesh.position.x += car.speed * car.dir * delta;
        if (Math.abs(car.mesh.position.x) > 124) car.mesh.position.x *= -0.95;
      }
    }
  }

  resolveCollisions(bike) {
    for (const car of this.cars) {
      const dx = bike.mesh.position.x - car.mesh.position.x;
      const dz = bike.mesh.position.z - car.mesh.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance > 0 && distance < car.radius + bike.radius) bike.stopAndBounce(dx / distance, dz / distance);
    }
  }
}
