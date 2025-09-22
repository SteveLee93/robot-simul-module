/**
 * Basic Robot Simulation Usage Examples
 * Demonstrates how to use the robot simulation module
 */

import { RobotDriverFactory } from '../src/drivers/MockRobotDriver.js';
import { CoordinateValidator, Vector3 } from '../src/utils/CoordinateSystem.js';

async function basicRobotControl() {
  console.log('🤖 Basic Robot Control Example');
  console.log('================================');

  // Create robot driver
  const robot = RobotDriverFactory.createDriver('mock', {
    jointCount: 6,
    workspace: {
      x: { min: -500, max: 500 },
      y: { min: -500, max: 500 },
      z: { min: 0, max: 800 }
    }
  });

  try {
    // Connect to robot
    console.log('📡 Connecting to robot...');
    await robot.connect();
    console.log('✅ Robot connected successfully');

    // Home the robot
    console.log('🏠 Homing robot...');
    await robot.homeRobot();
    console.log('✅ Robot homed');

    // Move to a position
    console.log('📍 Moving to position (200, 100, 300)...');
    await robot.moveToPosition(200, 100, 300);
    console.log('✅ Position reached');

    // Get current position
    const position = robot.getCurrentPosition();
    console.log(`📊 Current position: X=${position.x}, Y=${position.y}, Z=${position.z}`);

    // Move joints individually
    console.log('🔧 Moving joints to [30, 45, -60, 0, 90, 0]...');
    await robot.moveJoints(30, 45, -60, 0, 90, 0);
    console.log('✅ Joint movement completed');

    // Control gripper
    console.log('✋ Closing gripper...');
    await robot.closeGripper(60);
    console.log('✅ Gripper closed');

    const gripperState = robot.getGripperState();
    console.log(`📊 Gripper state: ${gripperState.isOpen ? 'Open' : 'Closed'} (${gripperState.position}%)`);

    // Open gripper
    console.log('👐 Opening gripper...');
    await robot.openGripper();
    console.log('✅ Gripper opened');

    // Disconnect
    await robot.disconnect();
    console.log('🔌 Robot disconnected');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function coordinateValidationExample() {
  console.log('\n📐 Coordinate Validation Example');
  console.log('=================================');

  // Create coordinate validator
  const validator = new CoordinateValidator({
    workspace: {
      x: { min: -500, max: 500 },
      y: { min: -500, max: 500 },
      z: { min: 0, max: 800 }
    },
    jointLimits: [
      { min: -180, max: 180 }, // Joint 1
      { min: -90, max: 90 },   // Joint 2
      { min: -150, max: 150 }, // Joint 3
      { min: -180, max: 180 }, // Joint 4
      { min: -180, max: 180 }, // Joint 5
      { min: -180, max: 180 }  // Joint 6
    ]
  });

  // Test valid position
  const validPos = { x: 200, y: 100, z: 300 };
  const posResult = validator.validatePosition(validPos);
  console.log(`✅ Position validation (${validPos.x}, ${validPos.y}, ${validPos.z}): ${posResult.valid ? 'VALID' : 'INVALID'}`);

  // Test invalid position
  const invalidPos = { x: 1000, y: 100, z: 300 };
  const invalidResult = validator.validatePosition(invalidPos, { autoCorrect: true });
  console.log(`❌ Position validation (${invalidPos.x}, ${invalidPos.y}, ${invalidPos.z}): ${invalidResult.valid ? 'VALID' : 'INVALID'}`);
  if (invalidResult.correctedPosition) {
    const corrected = invalidResult.correctedPosition;
    console.log(`🔧 Auto-corrected to: (${corrected.x}, ${corrected.y}, ${corrected.z})`);
  }

  // Test joint validation
  const validJoints = [45, 30, -60, 90, 0, 45];
  const jointResult = validator.validateJoints(validJoints);
  console.log(`✅ Joint validation [${validJoints.join(', ')}]: ${jointResult.valid ? 'VALID' : 'INVALID'}`);

  // Test invalid joints
  const invalidJoints = [200, 30, -200, 90, 0, 45];
  const invalidJointResult = validator.validateJoints(invalidJoints, { autoCorrect: true });
  console.log(`❌ Joint validation [${invalidJoints.join(', ')}]: ${invalidJointResult.valid ? 'VALID' : 'INVALID'}`);
  if (invalidJointResult.correctedJoints) {
    console.log(`🔧 Auto-corrected to: [${invalidJointResult.correctedJoints.join(', ')}]`);
  }

  // Path validation
  const startPos = { x: 0, y: 0, z: 200 };
  const endPos = { x: 400, y: 400, z: 600 };
  const pathResult = validator.validatePath(startPos, endPos);
  console.log(`🛤️  Path validation: ${pathResult.valid ? 'VALID' : 'INVALID'}`);
}

async function eventHandlingExample() {
  console.log('\n📡 Event Handling Example');
  console.log('==========================');

  const robot = RobotDriverFactory.createDriver('mock');

  // Setup event listeners
  robot.on('positionChanged', (data) => {
    console.log(`📍 Position changed: X=${data.position.x.toFixed(1)}, Y=${data.position.y.toFixed(1)}, Z=${data.position.z.toFixed(1)}`);
  });

  robot.on('positionUpdate', (position) => {
    console.log(`🔄 Position update: X=${position.x.toFixed(1)}, Y=${position.y.toFixed(1)}, Z=${position.z.toFixed(1)}`);
  });

  robot.on('gripperChanged', (gripper) => {
    console.log(`✋ Gripper changed: ${gripper.isOpen ? 'Open' : 'Closed'} (${gripper.position}%)`);
  });

  robot.on('error', (error) => {
    console.log(`❌ Robot error: ${error.message}`);
  });

  try {
    await robot.connect();
    console.log('🤖 Robot connected, starting movement sequence...');

    // This will trigger position update events
    await robot.moveToPosition(300, 200, 400);

    // This will trigger gripper events
    await robot.setGripperPosition(75);

    await robot.disconnect();

  } catch (error) {
    console.error('❌ Error in event example:', error.message);
  }
}

async function workspaceAnalysisExample() {
  console.log('\n📊 Workspace Analysis Example');
  console.log('==============================');

  const validator = new CoordinateValidator();
  const summary = validator.getValidationSummary();

  console.log('🏭 Workspace Information:');
  console.log(`   X bounds: ${summary.workspace.bounds.x.min} to ${summary.workspace.bounds.x.max} mm`);
  console.log(`   Y bounds: ${summary.workspace.bounds.y.min} to ${summary.workspace.bounds.y.max} mm`);
  console.log(`   Z bounds: ${summary.workspace.bounds.z.min} to ${summary.workspace.bounds.z.max} mm`);
  console.log(`   Volume: ${(summary.workspace.volume / 1000000).toFixed(2)} cubic meters`);
  console.log(`   Center: (${summary.workspace.center.x}, ${summary.workspace.center.y}, ${summary.workspace.center.z})`);

  console.log('\n🔧 Joint Limits:');
  summary.jointLimits.forEach((limit, index) => {
    console.log(`   Joint ${index + 1}: ${limit.min}° to ${limit.max}° (max speed: ${limit.maxSpeed}°/s)`);
  });

  // Test various positions
  const testPositions = [
    { x: 0, y: 0, z: 200, name: 'Center' },
    { x: 450, y: 450, z: 700, name: 'Near boundary' },
    { x: 500, y: 500, z: 800, name: 'At boundary' },
    { x: 600, y: 0, z: 400, name: 'Outside boundary' }
  ];

  console.log('\n🎯 Position Tests:');
  testPositions.forEach(pos => {
    const result = validator.validatePosition(pos);
    const status = result.valid ? '✅ VALID' : '❌ INVALID';
    const warnings = result.warnings.length > 0 ? ` (${result.warnings.length} warnings)` : '';
    console.log(`   ${pos.name}: ${status}${warnings}`);
  });
}

// Run all examples
async function runAllExamples() {
  console.log('🚀 Robot Simulation Module Examples');
  console.log('====================================\n');

  try {
    await basicRobotControl();
    await coordinateValidationExample();
    await eventHandlingExample();
    await workspaceAnalysisExample();

    console.log('\n🎉 All examples completed successfully!');
    console.log('\n💡 To start the web interface, run:');
    console.log('   npm start');
    console.log('   Then open http://localhost:3000 in your browser');

  } catch (error) {
    console.error('\n💥 Example failed:', error);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}