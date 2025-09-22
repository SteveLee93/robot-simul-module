import { RobotSimulator } from '../core/RobotSimulator.js';

/**
 * Mock Robot Driver - Hardware abstraction layer
 * Provides the same interface as real hardware drivers
 */
export class MockRobotDriver {
  constructor(config = {}) {
    this.simulator = new RobotSimulator(config);
    this.isConnected = false;
    this.connectionConfig = {
      ip: config.ip || '192.168.1.100',
      port: config.port || 30001,
      timeout: config.timeout || 5000,
      ...config
    };

    // Setup event forwarding
    this.setupEventForwarding();
  }

  /**
   * Connect to robot (simulated)
   */
  async connect() {
    return new Promise((resolve, reject) => {
      // Simulate connection delay
      setTimeout(() => {
        if (Math.random() < 0.95) { // 95% success rate
          this.isConnected = true;
          this.simulator.emit('connected', {
            ip: this.connectionConfig.ip,
            port: this.connectionConfig.port,
            timestamp: Date.now()
          });
          resolve(true);
        } else {
          const error = new Error(`Failed to connect to robot at ${this.connectionConfig.ip}:${this.connectionConfig.port}`);
          this.simulator.emit('connectionError', error);
          reject(error);
        }
      }, 1000 + Math.random() * 2000); // 1-3 second connection time
    });
  }

  /**
   * Disconnect from robot
   */
  async disconnect() {
    this.isConnected = false;
    this.simulator.emit('disconnected', { timestamp: Date.now() });
    return true;
  }

  /**
   * Check connection status
   */
  isConnectedToRobot() {
    return this.isConnected;
  }

  /**
   * Move robot to target position (Cartesian)
   */
  async moveToPosition(x, y, z, rx = 0, ry = 0, rz = 0, options = {}) {
    this.validateConnection();

    const target = { x, y, z };

    // Add some realistic delays and error simulation
    if (Math.random() < 0.02) { // 2% chance of movement error
      throw new Error('Robot movement failed: Joint limit exceeded or collision detected');
    }

    return await this.simulator.moveTo(target, options);
  }

  /**
   * Move robot joints to target angles
   */
  async moveJoints(j1, j2, j3, j4, j5, j6, options = {}) {
    this.validateConnection();

    const targetJoints = [j1, j2, j3, j4, j5, j6];

    // Simulate potential joint errors
    if (Math.random() < 0.01) { // 1% chance of joint error
      throw new Error('Joint movement failed: Motor overload or encoder error');
    }

    return await this.simulator.moveJoints(targetJoints, options);
  }

  /**
   * Control gripper
   */
  async setGripperPosition(position, force = 50, options = {}) {
    this.validateConnection();

    // Simulate gripper errors
    if (Math.random() < 0.005) { // 0.5% chance of gripper error
      throw new Error('Gripper operation failed: Pneumatic pressure low');
    }

    return await this.simulator.setGripper(position, force);
  }

  /**
   * Open gripper
   */
  async openGripper(force = 30) {
    return await this.setGripperPosition(0, force);
  }

  /**
   * Close gripper
   */
  async closeGripper(force = 50) {
    return await this.setGripperPosition(100, force);
  }

  /**
   * Home robot to initial position
   */
  async homeRobot() {
    this.validateConnection();

    // Simulate homing sequence
    if (Math.random() < 0.01) { // 1% chance of homing error
      throw new Error('Homing failed: Reference position not found');
    }

    return await this.simulator.home();
  }

  /**
   * Get current robot position
   */
  getCurrentPosition() {
    this.validateConnection();
    const state = this.simulator.getState();
    return {
      x: state.position.x,
      y: state.position.y,
      z: state.position.z,
      rx: state.orientation.rx,
      ry: state.orientation.ry,
      rz: state.orientation.rz
    };
  }

  /**
   * Get current joint angles
   */
  getCurrentJoints() {
    this.validateConnection();
    const state = this.simulator.getState();
    return [...state.joints];
  }

  /**
   * Get gripper state
   */
  getGripperState() {
    this.validateConnection();
    const state = this.simulator.getState();
    return { ...state.gripper };
  }

  /**
   * Get robot status
   */
  getRobotStatus() {
    this.validateConnection();
    const state = this.simulator.getState();
    return {
      isConnected: this.isConnected,
      isMoving: state.isMoving,
      isHomed: state.isHomed,
      hasError: state.lastError !== null,
      lastError: state.lastError,
      timestamp: state.timestamp
    };
  }

  /**
   * Emergency stop
   */
  emergencyStop() {
    this.simulator.emergencyStop();
    return true;
  }

  /**
   * Set robot speed (global speed override)
   */
  setRobotSpeed(speedPercentage) {
    if (speedPercentage < 1 || speedPercentage > 100) {
      throw new Error('Speed must be between 1 and 100 percent');
    }

    this.simulator.config.maxSpeed = (this.simulator.config.maxSpeed * speedPercentage) / 100;
    return true;
  }

  /**
   * Read robot configuration
   */
  getRobotConfig() {
    return { ...this.simulator.config };
  }

  /**
   * Validate connection before operations
   */
  validateConnection() {
    if (!this.isConnected) {
      throw new Error('Robot not connected. Call connect() first.');
    }
  }

  /**
   * Setup event forwarding from simulator to driver
   */
  setupEventForwarding() {
    const events = [
      'positionChanged',
      'positionUpdate',
      'jointsUpdate',
      'gripperChanged',
      'homed',
      'emergencyStop',
      'error'
    ];

    events.forEach(event => {
      this.simulator.on(event, (data) => {
        this.emit(event, data);
      });
    });
  }

  /**
   * Event system for driver
   */
  on(event, callback) {
    if (!this.callbacks) {
      this.callbacks = new Map();
    }
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  emit(event, data) {
    if (this.callbacks && this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => callback(data));
    }
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.disconnect();
    if (this.callbacks) {
      this.callbacks.clear();
    }
  }
}

/**
 * Robot Driver Factory - Creates appropriate driver based on config
 */
export class RobotDriverFactory {
  static createDriver(type = 'mock', config = {}) {
    switch (type.toLowerCase()) {
      case 'mock':
      case 'simulation':
        return new MockRobotDriver(config);

      case 'ur':
      case 'universal':
        // Would return UniversalRobotDriver(config) for real hardware
        console.warn('Universal Robot driver not implemented, using mock driver');
        return new MockRobotDriver(config);

      case 'kuka':
        // Would return KukaRobotDriver(config) for real hardware
        console.warn('KUKA robot driver not implemented, using mock driver');
        return new MockRobotDriver(config);

      case 'abb':
        // Would return ABBRobotDriver(config) for real hardware
        console.warn('ABB robot driver not implemented, using mock driver');
        return new MockRobotDriver(config);

      default:
        throw new Error(`Unknown robot driver type: ${type}`);
    }
  }
}