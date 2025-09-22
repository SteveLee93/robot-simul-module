/**
 * Robot Simulator Core Class
 * Hardware-agnostic robot simulation with joint/coordinate/gripper state management
 */
export class RobotSimulator {
  constructor(config = {}) {
    this.config = {
      model: "CLINK_ROBOT_MODEL_HCR14_3GEN",
      jointCount: 6,
      jerkPercentage: 0.5,
      workspace: {
        x: { min: -1200, max: 1200 },
        y: { min: -1200, max: 1200 },
        z: { min: -500, max: 1500 }
      },
      // CLINK HCR14 3GEN Joint Limits
      jointLimits: [
        { min: -360, max: 360, maxSpeed: 155, name: "BASE" },        // Base
        { min: -360, max: 360, maxSpeed: 155, name: "SHOULDER" },    // Shoulder
        { min: -165, max: 165, maxSpeed: 230, name: "ELBOW" },       // Elbow
        { min: -360, max: 360, maxSpeed: 270, name: "WRIST1" },      // Wrist 1
        { min: -360, max: 360, maxSpeed: 270, name: "WRIST2" },      // Wrist 2
        { min: -360, max: 360, maxSpeed: 270, name: "WRIST3" }       // Wrist 3
      ],
      // Home position for HCR14 3GEN
      homeJointAngles: [0, -90, -90, -90, 90, 0],
      initJointAngles: [0, -90, -90, -90, 90, 0],
      // Safety limits
      safetyLimits: {
        force: 70,
        tcpForce: 170,
        power: 50,
        speed: 1500,
        reducedSpeed: 50,
        reducedSpeedLinear: 250,
        reducedSpeedJoint: 30,
        collisionMitigation: true
      },
      maxSpeed: 100, // degrees/second
      ...config
    };

    // Calculate initial position from home joint angles
    const initialPose = this.calculateForwardKinematics(this.config.initJointAngles);

    this.state = {
      // Joint angles in degrees
      joints: [...this.config.initJointAngles],

      // Cartesian position and orientation
      position: { x: initialPose.x, y: initialPose.y, z: initialPose.z },
      orientation: { rx: initialPose.rx, ry: initialPose.ry, rz: initialPose.rz },

      // Gripper state
      gripper: {
        isOpen: true,
        position: 0, // 0 = fully open, 100 = fully closed
        force: 0
      },

      // System state
      isMoving: false,
      isHomed: false,
      lastError: null,
      timestamp: Date.now()
    };

    this.callbacks = new Map();
    this.moveQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Calculate forward kinematics using DH parameters
   * Based on actual 3D model structure
   */
  calculateForwardKinematics(joints) {
    // Convert degrees to radians
    const rad = joints.map(angle => angle * Math.PI / 180);

    // DH Parameters based on actual 3D model structure
    // [a, alpha, d, theta_offset]
    const dhParams = [
      [0,     0,     60,    0],     // Joint 1: Base to Joint1 (Z=60)
      [0,     Math.PI/2, 40,   -Math.PI/2], // Joint 2: Joint1 to Joint2 (Z=100-60=40)
      [200,   0,     0,     0],     // Joint 3: Upper arm length (Link2 = 200)
      [0,     Math.PI/2, 150,   0],     // Joint 4: Joint2 to Joint4 (Z=200-50=150)
      [0,     -Math.PI/2, 40,    0],     // Joint 5: Joint4 to Joint5 (40 length)
      [0,     0,     70,    0]      // Joint 6: Joint5 to End-effector (30+40=70)
    ];

    // Initialize transformation matrix as identity
    let T = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];

    // Calculate cumulative transformation
    for (let i = 0; i < 6; i++) {
      const [a, alpha, d, theta_offset] = dhParams[i];
      const theta = rad[i] + theta_offset;

      // DH transformation matrix for joint i
      const Ti = [
        [Math.cos(theta), -Math.sin(theta) * Math.cos(alpha), Math.sin(theta) * Math.sin(alpha), a * Math.cos(theta)],
        [Math.sin(theta), Math.cos(theta) * Math.cos(alpha), -Math.cos(theta) * Math.sin(alpha), a * Math.sin(theta)],
        [0, Math.sin(alpha), Math.cos(alpha), d],
        [0, 0, 0, 1]
      ];

      // Multiply T = T * Ti
      T = this.multiplyMatrix4x4(T, Ti);
    }

    // Extract position from transformation matrix
    const x = T[0][3];
    const y = T[1][3];
    const z = T[2][3];

    // Extract orientation (simplified - could use full rotation matrix)
    const rx = Math.atan2(T[2][1], T[2][2]) * 180 / Math.PI;
    const ry = Math.atan2(-T[2][0], Math.sqrt(T[2][1]*T[2][1] + T[2][2]*T[2][2])) * 180 / Math.PI;
    const rz = Math.atan2(T[1][0], T[0][0]) * 180 / Math.PI;

    return {
      x: x,
      y: y,
      z: z,
      rx: rx,
      ry: ry,
      rz: rz
    };
  }

  /**
   * Helper function to multiply two 4x4 matrices
   */
  multiplyMatrix4x4(A, B) {
    const result = Array(4).fill().map(() => Array(4).fill(0));

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }

    return result;
  }

  /**
   * Validate if target position is within workspace limits
   */
  validatePosition(position) {
    const { x, y, z } = position;
    const ws = this.config.workspace;

    return (
      x >= ws.x.min && x <= ws.x.max &&
      y >= ws.y.min && y <= ws.y.max &&
      z >= ws.z.min && z <= ws.z.max
    );
  }

  /**
   * Validate joint angles against limits
   */
  validateJoints(joints) {
    for (let i = 0; i < joints.length; i++) {
      const limit = this.config.jointLimits[i];
      if (joints[i] < limit.min || joints[i] > limit.max) {
        return false;
      }
    }
    return true;
  }

  /**
   * Move to target position (Cartesian coordinates)
   */
  async moveTo(target, options = {}) {
    if (!this.validatePosition(target)) {
      throw new Error(`Target position out of workspace: ${JSON.stringify(target)}`);
    }

    return new Promise((resolve, reject) => {
      const moveCommand = {
        type: 'moveTo',
        target,
        options: {
          speed: options.speed || this.config.maxSpeed,
          acceleration: options.acceleration || 50,
          ...options
        },
        resolve,
        reject
      };

      this.moveQueue.push(moveCommand);
      this.processQueue();
    });
  }

  /**
   * Move joints to target angles
   */
  async moveJoints(targetJoints, options = {}) {
    if (!this.validateJoints(targetJoints)) {
      throw new Error(`Joint angles out of limits: ${JSON.stringify(targetJoints)}`);
    }

    return new Promise((resolve, reject) => {
      const moveCommand = {
        type: 'moveJoints',
        target: targetJoints,
        options: {
          speed: options.speed || this.config.maxSpeed,
          ...options
        },
        resolve,
        reject
      };

      this.moveQueue.push(moveCommand);
      this.processQueue();
    });
  }

  /**
   * Control gripper
   */
  async setGripper(position, force = 50) {
    if (position < 0 || position > 100) {
      throw new Error('Gripper position must be between 0 and 100');
    }

    return new Promise((resolve) => {
      // Simulate gripper movement time
      setTimeout(() => {
        this.state.gripper.position = position;
        this.state.gripper.isOpen = position < 50;
        this.state.gripper.force = force;
        this.state.timestamp = Date.now();

        this.emit('gripperChanged', this.state.gripper);
        resolve(this.state.gripper);
      }, 200); // 200ms gripper movement time
    });
  }

  /**
   * Home the robot to initial position
   */
  async home() {
    await this.moveJoints(this.config.homeJointAngles);
    this.state.isHomed = true;
    this.emit('homed', this.state);
  }

  /**
   * Process movement queue
   */
  async processQueue() {
    if (this.isProcessingQueue || this.moveQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    this.state.isMoving = true;

    try {
      while (this.moveQueue.length > 0) {
        const command = this.moveQueue.shift();
        await this.executeMove(command);
      }
    } finally {
      this.isProcessingQueue = false;
      this.state.isMoving = false;
    }
  }

  /**
   * Execute individual move command
   */
  async executeMove(command) {
    const { type, target, options, resolve, reject } = command;

    try {
      if (type === 'moveTo') {
        // Simulate inverse kinematics and movement
        const moveTime = this.calculateMoveTime(this.state.position, target, options.speed);

        await this.simulateMovement(
          this.state.position,
          target,
          moveTime
        );

        this.state.position = { ...target };
        // Update joints based on new position (simplified)
        this.state.joints = this.calculateInverseKinematics(target);

      } else if (type === 'moveJoints') {
        const moveTime = this.calculateJointMoveTime(this.state.joints, target, options.speed);

        await this.simulateJointMovement(
          this.state.joints,
          target,
          moveTime
        );

        this.state.joints = [...target];
        // Update position based on new joints
        const newPose = this.calculateForwardKinematics(target);
        this.state.position = { x: newPose.x, y: newPose.y, z: newPose.z };
        this.state.orientation = { rx: newPose.rx, ry: newPose.ry, rz: newPose.rz };
      }

      this.state.timestamp = Date.now();
      this.emit('positionChanged', this.state);
      resolve(this.state);

    } catch (error) {
      this.state.lastError = error.message;
      this.emit('error', error);
      reject(error);
    }
  }

  /**
   * Simulate smooth movement between positions
   */
  async simulateMovement(start, end, duration) {
    const steps = 20;
    const stepTime = duration / steps;

    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const currentPos = {
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress,
        z: start.z + (end.z - start.z) * progress
      };

      this.emit('positionUpdate', currentPos);
      await new Promise(resolve => setTimeout(resolve, stepTime));
    }
  }

  /**
   * Simulate joint movement
   */
  async simulateJointMovement(startJoints, endJoints, duration) {
    const steps = 20;
    const stepTime = duration / steps;

    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const currentJoints = startJoints.map((start, index) =>
        start + (endJoints[index] - start) * progress
      );

      this.emit('jointsUpdate', currentJoints);
      await new Promise(resolve => setTimeout(resolve, stepTime));
    }
  }

  /**
   * Calculate movement time based on distance and speed
   */
  calculateMoveTime(start, end, speed) {
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) +
      Math.pow(end.y - start.y, 2) +
      Math.pow(end.z - start.z, 2)
    );
    return Math.max(500, (distance / speed) * 1000); // Minimum 500ms
  }

  /**
   * Calculate joint movement time
   */
  calculateJointMoveTime(startJoints, endJoints, speed) {
    const maxAngleDiff = Math.max(...startJoints.map((start, i) =>
      Math.abs(endJoints[i] - start)
    ));
    return Math.max(500, (maxAngleDiff / speed) * 1000); // Minimum 500ms
  }

  /**
   * Calculate inverse kinematics using geometric approach
   * Solves for joint angles to reach target position
   */
  calculateInverseKinematics(position) {
    // Robot geometry parameters (matching DH parameters and 3D model)
    const d1 = 60;   // Base to joint 1 (Z=60)
    const d2 = 40;   // Joint 1 to joint 2 offset
    const a3 = 200;  // Upper arm length (Link2 = 200)
    const d4 = 150;  // Joint 2 to joint 4
    const d6 = 70;   // Joint 5 to end-effector

    const { x, y, z } = position;

    // Joint 1: Base rotation
    const theta1 = Math.atan2(y, x);

    // Calculate wrist center position (subtract end-effector offset)
    const wrist_x = x - d6 * Math.cos(theta1);
    const wrist_y = y - d6 * Math.sin(theta1);
    const wrist_z = z;

    // Distance from base to wrist center
    const r = Math.sqrt(wrist_x * wrist_x + wrist_y * wrist_y);
    const s = wrist_z - d1 - d2;

    // Distance from joint 2 to wrist center
    const D = Math.sqrt(r * r + s * s);

    // Joint 3: Elbow angle using law of cosines
    const cos_theta3 = (a3 * a3 + d4 * d4 - D * D) / (2 * a3 * d4);

    // Check if position is reachable
    if (Math.abs(cos_theta3) > 1) {
      // Position unreachable, return safe configuration
      return [
        theta1 * 180 / Math.PI,
        0,  // Shoulder straight
        0,  // Elbow straight
        0,  // Wrist 1
        0,  // Wrist 2
        0   // Wrist 3
      ];
    }

    const theta3 = Math.acos(cos_theta3);

    // Joint 2: Shoulder angle
    const alpha = Math.atan2(s, r);
    const beta = Math.acos((a3 * a3 + D * D - d4 * d4) / (2 * a3 * D));
    const theta2 = alpha + beta;

    // For simplicity, set wrist joints to maintain end-effector orientation
    const theta4 = 0;  // Wrist 1
    const theta5 = -(theta2 + theta3 - Math.PI/2); // Wrist 2 (keep end-effector pointing down)
    const theta6 = 0;  // Wrist 3

    return [
      theta1 * 180 / Math.PI,
      theta2 * 180 / Math.PI,
      theta3 * 180 / Math.PI,
      theta4 * 180 / Math.PI,
      theta5 * 180 / Math.PI,
      theta6 * 180 / Math.PI
    ];
  }

  /**
   * Event system
   */
  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  emit(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => callback(data));
    }
  }

  /**
   * Get current robot state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Emergency stop
   */
  emergencyStop() {
    this.moveQueue = [];
    this.isProcessingQueue = false;
    this.state.isMoving = false;
    this.emit('emergencyStop', this.state);
  }
}