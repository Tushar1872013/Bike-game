import * as CANNON from 'cannon-es';

export class PhysicsWorld {
  constructor() {
    this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
  }

  step(delta) {
    this.world.step(1 / 60, delta, 3);
  }
}
