/**
 * Coordinate System and Validation Utilities
 * Handles coordinate transformations and workspace validation
 */

/**
 * 3D Vector utility class
 */
export class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static from(obj) {
    return new Vector3(obj.x || 0, obj.y || 0, obj.z || 0);
  }

  add(vector) {
    return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
  }

  subtract(vector) {
    return new Vector3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
  }

  multiply(scalar) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector3(0, 0, 0);
    return this.multiply(1 / mag);
  }

  distance(vector) {
    return this.subtract(vector).magnitude();
  }

  toObject() {
    return { x: this.x, y: this.y, z: this.z };
  }
}

/**
 * Rotation utility class (Euler angles in degrees)
 */
export class Rotation {
  constructor(rx = 0, ry = 0, rz = 0) {
    this.rx = rx;
    this.ry = ry;
    this.rz = rz;
  }

  static from(obj) {
    return new Rotation(obj.rx || 0, obj.ry || 0, obj.rz || 0);
  }

  toRadians() {
    return new Rotation(
      this.rx * Math.PI / 180,
      this.ry * Math.PI / 180,
      this.rz * Math.PI / 180
    );
  }

  toDegrees() {
    return new Rotation(
      this.rx * 180 / Math.PI,
      this.ry * 180 / Math.PI,
      this.rz * 180 / Math.PI
    );
  }

  normalize() {
    return new Rotation(
      ((this.rx % 360) + 360) % 360,
      ((this.ry % 360) + 360) % 360,
      ((this.rz % 360) + 360) % 360
    );
  }

  toObject() {
    return { rx: this.rx, ry: this.ry, rz: this.rz };
  }
}

/**
 * Pose class combining position and orientation
 */
export class Pose {
  constructor(position = new Vector3(), rotation = new Rotation()) {
    this.position = Vector3.from(position);
    this.rotation = Rotation.from(rotation);
  }

  static from(obj) {
    return new Pose(
      obj.position || obj,
      obj.rotation || obj.orientation || {}
    );
  }

  distance(pose) {
    return this.position.distance(pose.position);
  }

  toObject() {
    return {
      ...this.position.toObject(),
      ...this.rotation.toObject()
    };
  }
}

/**
 * Workspace definition and validation
 */
export class Workspace {
  constructor(config = {}) {
    this.bounds = {
      x: { min: -500, max: 500 },
      y: { min: -500, max: 500 },
      z: { min: 0, max: 800 },
      ...config
    };

    // Additional constraints
    this.constraints = config.constraints || [];
    this.safetyMargin = config.safetyMargin || 10; // mm
  }

  /**
   * Check if a position is within workspace bounds
   */
  isPositionValid(position) {
    const pos = Vector3.from(position);

    return (
      pos.x >= this.bounds.x.min && pos.x <= this.bounds.x.max &&
      pos.y >= this.bounds.y.min && pos.y <= this.bounds.y.max &&
      pos.z >= this.bounds.z.min && pos.z <= this.bounds.z.max
    );
  }

  /**
   * Check if a position is within safe working area (with margin)
   */
  isPositionSafe(position) {
    const pos = Vector3.from(position);
    const margin = this.safetyMargin;

    return (
      pos.x >= this.bounds.x.min + margin && pos.x <= this.bounds.x.max - margin &&
      pos.y >= this.bounds.y.min + margin && pos.y <= this.bounds.y.max - margin &&
      pos.z >= this.bounds.z.min + margin && pos.z <= this.bounds.z.max - margin
    );
  }

  /**
   * Clamp position to workspace bounds
   */
  clampPosition(position) {
    const pos = Vector3.from(position);

    return new Vector3(
      Math.max(this.bounds.x.min, Math.min(this.bounds.x.max, pos.x)),
      Math.max(this.bounds.y.min, Math.min(this.bounds.y.max, pos.y)),
      Math.max(this.bounds.z.min, Math.min(this.bounds.z.max, pos.z))
    );
  }

  /**
   * Get distance to workspace boundary
   */
  distanceToBoundary(position) {
    const pos = Vector3.from(position);

    const distances = [
      pos.x - this.bounds.x.min,
      this.bounds.x.max - pos.x,
      pos.y - this.bounds.y.min,
      this.bounds.y.max - pos.y,
      pos.z - this.bounds.z.min,
      this.bounds.z.max - pos.z
    ];

    return Math.min(...distances);
  }

  /**
   * Check if a path between two positions is valid
   */
  isPathValid(startPos, endPos, steps = 10) {
    const start = Vector3.from(startPos);
    const end = Vector3.from(endPos);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const currentPos = start.add(end.subtract(start).multiply(t));

      if (!this.isPositionValid(currentPos)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get workspace volume
   */
  getVolume() {
    const width = this.bounds.x.max - this.bounds.x.min;
    const depth = this.bounds.y.max - this.bounds.y.min;
    const height = this.bounds.z.max - this.bounds.z.min;

    return width * depth * height;
  }

  /**
   * Get workspace center
   */
  getCenter() {
    return new Vector3(
      (this.bounds.x.min + this.bounds.x.max) / 2,
      (this.bounds.y.min + this.bounds.y.max) / 2,
      (this.bounds.z.min + this.bounds.z.max) / 2
    );
  }
}

/**
 * Joint limit validation
 */
export class JointLimits {
  constructor(limits = []) {
    this.limits = limits.map(limit => ({
      min: limit.min || -180,
      max: limit.max || 180,
      maxSpeed: limit.maxSpeed || 100, // degrees/second
      maxAcceleration: limit.maxAcceleration || 500 // degrees/second²
    }));
  }

  /**
   * Validate joint angles
   */
  validateJoints(joints) {
    const result = {
      valid: true,
      violations: []
    };

    joints.forEach((angle, index) => {
      if (index >= this.limits.length) return;

      const limit = this.limits[index];
      if (angle < limit.min || angle > limit.max) {
        result.valid = false;
        result.violations.push({
          joint: index,
          angle,
          limit,
          type: 'position'
        });
      }
    });

    return result;
  }

  /**
   * Clamp joint angles to limits
   */
  clampJoints(joints) {
    return joints.map((angle, index) => {
      if (index >= this.limits.length) return angle;

      const limit = this.limits[index];
      return Math.max(limit.min, Math.min(limit.max, angle));
    });
  }

  /**
   * Validate joint velocities
   */
  validateJointVelocities(velocities) {
    const result = {
      valid: true,
      violations: []
    };

    velocities.forEach((velocity, index) => {
      if (index >= this.limits.length) return;

      const limit = this.limits[index];
      const absVelocity = Math.abs(velocity);

      if (absVelocity > limit.maxSpeed) {
        result.valid = false;
        result.violations.push({
          joint: index,
          velocity,
          limit: limit.maxSpeed,
          type: 'velocity'
        });
      }
    });

    return result;
  }
}

/**
 * Collision detection utilities
 */
export class CollisionDetector {
  constructor() {
    this.obstacles = [];
    this.robotGeometry = null;
  }

  /**
   * Add obstacle to collision detection
   */
  addObstacle(obstacle) {
    this.obstacles.push({
      type: obstacle.type || 'box',
      position: Vector3.from(obstacle.position),
      size: Vector3.from(obstacle.size),
      rotation: Rotation.from(obstacle.rotation || {}),
      ...obstacle
    });
  }

  /**
   * Remove all obstacles
   */
  clearObstacles() {
    this.obstacles = [];
  }

  /**
   * Check collision at given position
   */
  checkCollision(position, robotSize = { x: 100, y: 100, z: 100 }) {
    const pos = Vector3.from(position);
    const size = Vector3.from(robotSize);

    for (const obstacle of this.obstacles) {
      if (this.isBoxIntersecting(pos, size, obstacle.position, obstacle.size)) {
        return {
          collision: true,
          obstacle: obstacle
        };
      }
    }

    return { collision: false };
  }

  /**
   * Simple box-box intersection test
   */
  isBoxIntersecting(pos1, size1, pos2, size2) {
    const halfSize1 = size1.multiply(0.5);
    const halfSize2 = size2.multiply(0.5);

    return (
      Math.abs(pos1.x - pos2.x) < (halfSize1.x + halfSize2.x) &&
      Math.abs(pos1.y - pos2.y) < (halfSize1.y + halfSize2.y) &&
      Math.abs(pos1.z - pos2.z) < (halfSize1.z + halfSize2.z)
    );
  }
}

/**
 * Main coordinate system validator
 */
export class CoordinateValidator {
  constructor(config = {}) {
    this.workspace = new Workspace(config.workspace);
    this.jointLimits = new JointLimits(config.jointLimits);
    this.collisionDetector = new CollisionDetector();

    // Validation settings
    this.settings = {
      enforceWorkspace: config.enforceWorkspace !== false,
      enforceJointLimits: config.enforceJointLimits !== false,
      enforceCollision: config.enforceCollision !== false,
      pathValidation: config.pathValidation !== false,
      ...config.settings
    };
  }

  /**
   * Comprehensive position validation
   */
  validatePosition(position, context = {}) {
    const result = {
      valid: true,
      warnings: [],
      errors: [],
      correctedPosition: null
    };

    const pos = Vector3.from(position);

    // Workspace validation
    if (this.settings.enforceWorkspace) {
      if (!this.workspace.isPositionValid(pos)) {
        result.valid = false;
        result.errors.push('Position outside workspace bounds');

        if (context.autoCorrect) {
          result.correctedPosition = this.workspace.clampPosition(pos);
        }
      } else if (!this.workspace.isPositionSafe(pos)) {
        result.warnings.push('Position near workspace boundary');
      }
    }

    // Collision detection
    if (this.settings.enforceCollision) {
      const collision = this.collisionDetector.checkCollision(pos, context.robotSize);
      if (collision.collision) {
        result.valid = false;
        result.errors.push(`Collision detected with obstacle: ${collision.obstacle.name || 'unknown'}`);
      }
    }

    return result;
  }

  /**
   * Joint validation
   */
  validateJoints(joints, context = {}) {
    const result = {
      valid: true,
      warnings: [],
      errors: [],
      correctedJoints: null
    };

    if (this.settings.enforceJointLimits) {
      const validation = this.jointLimits.validateJoints(joints);

      if (!validation.valid) {
        result.valid = false;
        result.errors.push('Joint limits exceeded');
        result.errors.push(...validation.violations.map(v =>
          `Joint ${v.joint + 1}: ${v.angle}° (limit: ${v.limit.min}° to ${v.limit.max}°)`
        ));

        if (context.autoCorrect) {
          result.correctedJoints = this.jointLimits.clampJoints(joints);
        }
      }
    }

    return result;
  }

  /**
   * Path validation
   */
  validatePath(startPos, endPos, context = {}) {
    const result = {
      valid: true,
      warnings: [],
      errors: []
    };

    if (this.settings.pathValidation) {
      if (!this.workspace.isPathValid(startPos, endPos, context.pathSteps || 10)) {
        result.valid = false;
        result.errors.push('Path goes outside workspace');
      }
    }

    return result;
  }

  /**
   * Get validation summary
   */
  getValidationSummary() {
    return {
      workspace: {
        bounds: this.workspace.bounds,
        volume: this.workspace.getVolume(),
        center: this.workspace.getCenter().toObject()
      },
      jointLimits: this.jointLimits.limits,
      obstacles: this.collisionDetector.obstacles.length,
      settings: this.settings
    };
  }
}