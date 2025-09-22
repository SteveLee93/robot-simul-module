import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { RobotDriverFactory } from './drivers/MockRobotDriver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Robot Simulation Server
 * Provides WebSocket API for robot control and web interface
 */
class RobotSimulationServer {
  constructor(port = 3000) {
    this.port = port;
    this.app = express();
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    this.robotDriver = null;
    this.connectedClients = new Set();

    this.setupExpress();
    this.setupWebSocket();
    this.setupRobot();
  }

  setupExpress() {
    // Serve static files
    this.app.use(express.static(path.join(__dirname, '../public')));
    this.app.use(express.json());

    // API routes
    this.app.get('/api/status', (req, res) => {
      res.json({
        server: 'running',
        robot: this.robotDriver ? 'initialized' : 'not_initialized',
        connected: this.robotDriver?.isConnectedToRobot() || false,
        clients: this.connectedClients.size
      });
    });

    this.app.get('/api/robot/state', async (req, res) => {
      if (!this.robotDriver) {
        return res.status(503).json({ error: 'Robot not initialized' });
      }

      try {
        const state = {
          position: this.robotDriver.getCurrentPosition(),
          joints: this.robotDriver.getCurrentJoints(),
          gripper: this.robotDriver.getGripperState(),
          status: this.robotDriver.getRobotStatus()
        };
        res.json(state);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Default route
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log(`Client connected from ${req.socket.remoteAddress}`);
      this.connectedClients.add(ws);

      // Send initial state
      if (this.robotDriver) {
        this.sendToClient(ws, 'stateUpdate', this.getCurrentRobotState());
      }

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleClientMessage(ws, message);
        } catch (error) {
          console.error('Error handling client message:', error);
          this.sendToClient(ws, 'error', { message: error.message });
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        this.connectedClients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.connectedClients.delete(ws);
      });
    });
  }

  setupRobot() {
    // Initialize robot driver
    this.robotDriver = RobotDriverFactory.createDriver('mock', {
      jointCount: 6,
      workspace: {
        x: { min: -500, max: 500 },
        y: { min: -500, max: 500 },
        z: { min: 0, max: 800 }
      }
    });

    // Setup robot event handlers
    this.robotDriver.on('positionChanged', (state) => {
      this.broadcastToClients('stateUpdate', {
        position: state.position,
        joints: state.joints,
        gripper: state.gripper,
        timestamp: state.timestamp
      });
    });

    this.robotDriver.on('positionUpdate', (position) => {
      this.broadcastToClients('positionUpdate', position);
    });

    this.robotDriver.on('jointsUpdate', (joints) => {
      this.broadcastToClients('jointsUpdate', joints);
    });

    this.robotDriver.on('gripperChanged', (gripper) => {
      this.broadcastToClients('gripperChanged', gripper);
    });

    this.robotDriver.on('error', (error) => {
      this.broadcastToClients('error', { message: error.message });
    });

    this.robotDriver.on('connected', () => {
      this.broadcastToClients('connected', { timestamp: Date.now() });
    });

    this.robotDriver.on('disconnected', () => {
      this.broadcastToClients('disconnected', { timestamp: Date.now() });
    });

    console.log('Robot driver initialized');
  }

  async handleClientMessage(ws, message) {
    const { id, command, data } = message;
    let response = { id, success: false };

    try {
      switch (command) {
        case 'connect':
          await this.robotDriver.connect();
          response.success = true;
          response.data = { connected: true };
          break;

        case 'disconnect':
          await this.robotDriver.disconnect();
          response.success = true;
          response.data = { connected: false };
          break;

        case 'moveTo':
          const { position, options } = data;
          await this.robotDriver.moveToPosition(
            position.x, position.y, position.z,
            position.rx || 0, position.ry || 0, position.rz || 0,
            options
          );
          response.success = true;
          break;

        case 'moveJoints':
          const { joints, options: jointOptions } = data;
          await this.robotDriver.moveJoints(
            joints[0], joints[1], joints[2],
            joints[3], joints[4], joints[5],
            jointOptions
          );
          response.success = true;
          break;

        case 'setGripper':
          const { position: gripperPos, force } = data;
          await this.robotDriver.setGripperPosition(gripperPos, force);
          response.success = true;
          break;

        case 'openGripper':
          await this.robotDriver.openGripper(data.force || 30);
          response.success = true;
          break;

        case 'closeGripper':
          await this.robotDriver.closeGripper(data.force || 50);
          response.success = true;
          break;

        case 'home':
          await this.robotDriver.homeRobot();
          response.success = true;
          break;

        case 'emergencyStop':
          this.robotDriver.emergencyStop();
          response.success = true;
          break;

        case 'getState':
          response.success = true;
          response.data = this.getCurrentRobotState();
          break;

        case 'setSpeed':
          this.robotDriver.setRobotSpeed(data.speed);
          response.success = true;
          break;

        default:
          throw new Error(`Unknown command: ${command}`);
      }

    } catch (error) {
      response.error = error.message;
      console.error(`Error executing command ${command}:`, error);
    }

    this.sendToClient(ws, 'response', response);
  }

  getCurrentRobotState() {
    if (!this.robotDriver) return null;

    try {
      return {
        position: this.robotDriver.getCurrentPosition(),
        joints: this.robotDriver.getCurrentJoints(),
        gripper: this.robotDriver.getGripperState(),
        status: this.robotDriver.getRobotStatus(),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting robot state:', error);
      return null;
    }
  }

  sendToClient(ws, type, data) {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString()
      }));
    }
  }

  broadcastToClients(type, data) {
    const message = JSON.stringify({
      type,
      data,
      timestamp: new Date().toISOString()
    });

    this.connectedClients.forEach(ws => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message);
      }
    });
  }

  start() {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`Robot Simulation Server running on port ${this.port}`);
        console.log(`Web interface: http://localhost:${this.port}`);
        console.log(`WebSocket: ws://localhost:${this.port}/ws`);
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      // Clean up robot driver
      if (this.robotDriver) {
        try {
          this.robotDriver.disconnect();
          this.robotDriver.dispose();
        } catch (error) {
          console.error('Error cleaning up robot driver:', error);
        }
      }

      // Close all WebSocket connections
      this.connectedClients.forEach(ws => {
        ws.close();
      });

      // Close server
      this.server.close(() => {
        console.log('Robot Simulation Server stopped');
        resolve();
      });
    });
  }
}

// Start server if this file is run directly
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);
console.log('Checking if should start server...');

if (import.meta.url.endsWith('src/index.js') || process.argv[1].endsWith('src/index.js')) {
  console.log('Starting Robot Simulation Server...');

  try {
    const server = new RobotSimulationServer(process.env.PORT || 3000);

    server.start().then(() => {
      console.log('Server started successfully!');
    }).catch(error => {
      console.error('Failed to start server:', error);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down server...');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nShutting down server...');
      await server.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('Error initializing server:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

export { RobotSimulationServer };