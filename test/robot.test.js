import { test, describe } from 'node:test';
import assert from 'node:assert';
import { RobotSimulator } from '../src/core/RobotSimulator.js';
import { MockRobotDriver, RobotDriverFactory } from '../src/drivers/MockRobotDriver.js';
import { Vector3, Workspace, JointLimits, CoordinateValidator } from '../src/utils/CoordinateSystem.js';

describe('Robot Simulator Core', () => {
  test('should initialize with default configuration', () => {
    const robot = new RobotSimulator();

    assert.strictEqual(robot.config.jointCount, 6);
    assert.strictEqual(robot.state.joints.length, 6);
    assert.deepStrictEqual(robot.state.position, { x: 0, y: 0, z: 200 });
    assert.strictEqual(robot.state.isHomed, false);
  });

  test('should validate workspace limits', () => {
    const robot = new RobotSimulator();

    // Valid position
    assert.strictEqual(robot.validatePosition({ x: 0, y: 0, z: 200 }), true);

    // Invalid position (outside workspace)
    assert.strictEqual(robot.validatePosition({ x: 1000, y: 0, z: 200 }), false);
    assert.strictEqual(robot.validatePosition({ x: 0, y: 0, z: -100 }), false);
  });

  test('should validate joint limits', () => {
    const robot = new RobotSimulator();

    // Valid joints
    assert.strictEqual(robot.validateJoints([0, 0, 0, 0, 0, 0]), true);
    assert.strictEqual(robot.validateJoints([90, 45, -45, 90, -90, 180]), true);

    // Invalid joints
    assert.strictEqual(robot.validateJoints([200, 0, 0, 0, 0, 0]), false);
    assert.strictEqual(robot.validateJoints([0, 100, 0, 0, 0, 0]), false);
  });

  test('should calculate forward kinematics', () => {
    const robot = new RobotSimulator();
    const joints = [0, 0, 0, 0, 0, 0];

    const pose = robot.calculateForwardKinematics(joints);

    assert.ok(typeof pose.x === 'number');
    assert.ok(typeof pose.y === 'number');
    assert.ok(typeof pose.z === 'number');
    assert.ok(typeof pose.rx === 'number');
    assert.ok(typeof pose.ry === 'number');
    assert.ok(typeof pose.rz === 'number');
  });

  test('should move to valid position', async () => {
    const robot = new RobotSimulator();
    const targetPosition = { x: 100, y: 100, z: 300 };

    const result = await robot.moveTo(targetPosition);

    assert.strictEqual(result.position.x, targetPosition.x);
    assert.strictEqual(result.position.y, targetPosition.y);
    assert.strictEqual(result.position.z, targetPosition.z);
  });

  test('should reject invalid position', async () => {
    const robot = new RobotSimulator();
    const invalidPosition = { x: 1000, y: 1000, z: 1000 };

    try {
      await robot.moveTo(invalidPosition);
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.ok(error.message.includes('out of workspace'));
    }
  });

  test('should control gripper', async () => {
    const robot = new RobotSimulator();

    // Open gripper
    const openResult = await robot.setGripper(0);
    assert.strictEqual(openResult.position, 0);
    assert.strictEqual(openResult.isOpen, true);

    // Close gripper
    const closeResult = await robot.setGripper(100);
    assert.strictEqual(closeResult.position, 100);
    assert.strictEqual(closeResult.isOpen, false);
  });
});

describe('Mock Robot Driver', () => {
  test('should create driver instance', () => {
    const driver = new MockRobotDriver();

    assert.ok(driver instanceof MockRobotDriver);
    assert.strictEqual(driver.isConnected, false);
  });

  test('should simulate connection', async () => {
    const driver = new MockRobotDriver();

    const connected = await driver.connect();
    assert.strictEqual(connected, true);
    assert.strictEqual(driver.isConnectedToRobot(), true);
  });

  test('should move robot through driver interface', async () => {
    const driver = new MockRobotDriver();
    await driver.connect();

    const result = await driver.moveToPosition(200, 0, 300);
    assert.ok(result);

    const position = driver.getCurrentPosition();
    assert.strictEqual(position.x, 200);
    assert.strictEqual(position.y, 0);
    assert.strictEqual(position.z, 300);
  });

  test('should control gripper through driver', async () => {
    const driver = new MockRobotDriver();
    await driver.connect();

    await driver.setGripperPosition(50);
    const gripperState = driver.getGripperState();

    assert.strictEqual(gripperState.position, 50);
    assert.strictEqual(gripperState.isOpen, false);
  });
});

describe('Robot Driver Factory', () => {
  test('should create mock driver by default', () => {
    const driver = RobotDriverFactory.createDriver();
    assert.ok(driver instanceof MockRobotDriver);
  });

  test('should create mock driver for unknown types', () => {
    const driver = RobotDriverFactory.createDriver('unknown');
    assert.ok(driver instanceof MockRobotDriver);
  });

  test('should accept configuration', () => {
    const config = { jointCount: 4 };
    const driver = RobotDriverFactory.createDriver('mock', config);

    assert.ok(driver instanceof MockRobotDriver);
  });
});

describe('Coordinate System Utilities', () => {
  test('should create and manipulate vectors', () => {
    const v1 = new Vector3(1, 2, 3);
    const v2 = new Vector3(4, 5, 6);

    const sum = v1.add(v2);
    assert.deepStrictEqual(sum, new Vector3(5, 7, 9));

    const distance = v1.distance(v2);
    assert.ok(distance > 0);
  });

  test('should validate workspace boundaries', () => {
    const workspace = new Workspace({
      x: { min: -100, max: 100 },
      y: { min: -100, max: 100 },
      z: { min: 0, max: 200 }
    });

    assert.strictEqual(workspace.isPositionValid({ x: 0, y: 0, z: 100 }), true);
    assert.strictEqual(workspace.isPositionValid({ x: 150, y: 0, z: 100 }), false);
  });

  test('should clamp positions to workspace', () => {
    const workspace = new Workspace({
      x: { min: -100, max: 100 },
      y: { min: -100, max: 100 },
      z: { min: 0, max: 200 }
    });

    const clamped = workspace.clampPosition({ x: 150, y: 150, z: 250 });

    assert.strictEqual(clamped.x, 100);
    assert.strictEqual(clamped.y, 100);
    assert.strictEqual(clamped.z, 200);
  });

  test('should validate joint limits', () => {
    const limits = new JointLimits([
      { min: -90, max: 90 },
      { min: -45, max: 45 },
      { min: -180, max: 180 }
    ]);

    const validResult = limits.validateJoints([0, 0, 0]);
    assert.strictEqual(validResult.valid, true);

    const invalidResult = limits.validateJoints([100, 0, 0]);
    assert.strictEqual(invalidResult.valid, false);
    assert.strictEqual(invalidResult.violations.length, 1);
  });

  test('should perform comprehensive validation', () => {
    const validator = new CoordinateValidator({
      workspace: {
        x: { min: -500, max: 500 },
        y: { min: -500, max: 500 },
        z: { min: 0, max: 800 }
      },
      jointLimits: [
        { min: -180, max: 180 },
        { min: -90, max: 90 },
        { min: -150, max: 150 }
      ]
    });

    const posResult = validator.validatePosition({ x: 200, y: 200, z: 300 });
    assert.strictEqual(posResult.valid, true);

    const jointResult = validator.validateJoints([45, 30, 60]);
    assert.strictEqual(jointResult.valid, true);
  });
});

describe('Event System', () => {
  test('should emit and receive events', (t, done) => {
    const robot = new RobotSimulator();

    robot.on('positionChanged', (data) => {
      assert.ok(data);
      assert.ok(data.position);
      done();
    });

    // Trigger an event
    robot.moveTo({ x: 100, y: 0, z: 200 });
  });

  test('should handle multiple event listeners', () => {
    const robot = new RobotSimulator();
    let count = 0;

    robot.on('test', () => count++);
    robot.on('test', () => count++);

    robot.emit('test', {});

    assert.strictEqual(count, 2);
  });
});