export interface PhysicsBounds {
  width: number;
  height: number;
  wallThickness: number;
}

export interface PhysicsTuning {
  gravityY: number;
  positionIterations: number;
  velocityIterations: number;
  constraintIterations: number;
  dragStiffness: number;
  dragDamping: number;
}

export const defaultPhysicsBounds: PhysicsBounds = {
  width: 960,
  height: 640,
  wallThickness: 36
};

export const defaultPhysicsTuning: PhysicsTuning = {
  gravityY: 1,
  positionIterations: 9,
  velocityIterations: 8,
  constraintIterations: 4,
  dragStiffness: 0.72,
  dragDamping: 0.18
};

export class PhysicsWorld {
  readonly bounds: PhysicsBounds;
  readonly tuning: PhysicsTuning;

  constructor(bounds: PhysicsBounds = defaultPhysicsBounds, tuning: PhysicsTuning = defaultPhysicsTuning) {
    this.bounds = bounds;
    this.tuning = tuning;
  }
}
