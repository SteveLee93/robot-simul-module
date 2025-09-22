import { RobotVisualizer } from './RobotVisualizer.js';

/**
 * Main Application Class
 * Manages the robot simulation interface and connects all components
 */
class RobotSimulationApp {
    constructor() {
        this.visualizer = null;
        this.websocket = null;
        this.isConnected = false;
        this.currentState = {
            position: { x: 0, y: 0, z: 0 }, // Will be calculated by forward kinematics
            joints: [0, 0, 0, 0, 0, 0],
            gripper: { position: 0, isOpen: true }
        };

        // Calculate initial position from home joint angles
        this.updatePositionFromJoints();

        this.init();
    }

    init() {
        this.setupVisualizer();
        this.setupWebSocket();
        this.setupEventListeners();
        this.updateUI();
        this.logEvent('Application initialized', 'info');
    }

    setupVisualizer() {
        this.visualizer = new RobotVisualizer('threejs-container');
        this.logEvent('3D visualizer initialized', 'info');
    }

    setupWebSocket() {
        // WebSocket connection to backend robot simulator
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        try {
            this.websocket = new WebSocket(wsUrl);

            this.websocket.onopen = () => {
                this.logEvent('WebSocket connected', 'info');
            };

            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleServerMessage(data);
            };

            this.websocket.onclose = () => {
                this.logEvent('WebSocket disconnected', 'warning');
                setTimeout(() => this.setupWebSocket(), 3000); // Retry after 3 seconds
            };

            this.websocket.onerror = (error) => {
                this.logEvent(`WebSocket error: ${error}`, 'error');
            };

        } catch (error) {
            this.logEvent('WebSocket not available - running in offline mode', 'warning');
        }
    }

    setupEventListeners() {
        // Connection controls
        document.getElementById('connectBtn').addEventListener('click', () => {
            this.toggleConnection();
        });

        document.getElementById('homeBtn').addEventListener('click', () => {
            this.homeRobot();
        });

        document.getElementById('emergencyStop').addEventListener('click', () => {
            this.emergencyStop();
        });

        // Position controls
        document.getElementById('moveToPosition').addEventListener('click', () => {
            this.moveToPosition();
        });

        this.setupPositionSliders();

        // Joint controls
        this.setupJointSliders();
        document.getElementById('moveJoints').addEventListener('click', () => {
            this.moveJoints();
        });

        // Gripper controls
        this.setupGripperControls();

        // View controls
        document.getElementById('resetView').addEventListener('click', () => {
            this.visualizer.resetView();
        });

        document.getElementById('toggleGrid').addEventListener('click', () => {
            this.visualizer.toggleGrid();
        });

        document.getElementById('toggleAxes').addEventListener('click', () => {
            this.visualizer.toggleAxes();
        });

        // Log controls
        document.getElementById('clearLog').addEventListener('click', () => {
            this.clearLog();
        });
    }

    setupPositionSliders() {
        const axes = ['x', 'y', 'z'];

        axes.forEach(axis => {
            const slider = document.getElementById(`${axis}Slider`);
            const valueDisplay = document.getElementById(`${axis}Value`);

            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                valueDisplay.textContent = value;

                // Update current position state
                this.currentState.position[axis] = value;

                // Calculate and update joints using inverse kinematics (simplified)
                this.updateJointsFromPosition();

                // Update visualization in real-time (no animation for immediate feedback)
                this.visualizer.updateRobotPose(this.currentState.joints, this.currentState.gripper.position, false);

                // Add target marker for visual feedback
                this.visualizer.addTargetMarker(this.currentState.position);
            });
        });
    }

    updateJointsFromPosition() {
        // Match backend inverse kinematics calculation
        const pos = this.currentState.position;

        // Robot geometry parameters (matching backend)
        const d1 = 75;   // Base to joint 2
        const d2 = 100;  // Joint 2 offset
        const a3 = 200;  // Upper arm length
        const d4 = 190;  // Joint 3 to joint 4
        const d6 = 70;   // Joint 5 to end-effector

        const { x, y, z } = pos;

        // Joint 1: Base rotation
        const theta1 = Math.atan2(y, x);

        // Calculate wrist center position
        const wrist_x = x - d6 * Math.cos(theta1);
        const wrist_y = y - d6 * Math.sin(theta1);
        const wrist_z = z;

        // Distance calculations
        const r = Math.sqrt(wrist_x * wrist_x + wrist_y * wrist_y);
        const s = wrist_z - d1 - d2;
        const D = Math.sqrt(r * r + s * s);

        // Joint 3: Elbow angle
        const cos_theta3 = (a3 * a3 + d4 * d4 - D * D) / (2 * a3 * d4);

        let theta2, theta3, theta4, theta5, theta6;

        if (Math.abs(cos_theta3) > 1) {
            // Position unreachable
            theta2 = theta3 = theta4 = theta5 = theta6 = 0;
        } else {
            theta3 = Math.acos(cos_theta3);

            // Joint 2: Shoulder angle
            const alpha = Math.atan2(s, r);
            const beta = Math.acos((a3 * a3 + D * D - d4 * d4) / (2 * a3 * D));
            theta2 = alpha + beta;

            // Wrist joints
            theta4 = 0;
            theta5 = -(theta2 + theta3 - Math.PI/2);
            theta6 = 0;
        }

        this.currentState.joints = [
            theta1 * 180 / Math.PI,
            theta2 * 180 / Math.PI,
            theta3 * 180 / Math.PI,
            theta4 * 180 / Math.PI,
            theta5 * 180 / Math.PI,
            theta6 * 180 / Math.PI
        ];

        // Update joint sliders to reflect the calculated joint angles
        this.updateJointSliders();
    }

    setupJointSliders() {
        for (let i = 1; i <= 6; i++) {
            const slider = document.getElementById(`j${i}Slider`);
            const valueDisplay = document.getElementById(`j${i}Value`);

            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                valueDisplay.textContent = value;

                // Update current state to reflect slider changes
                this.currentState.joints[i - 1] = value;

                // Calculate position from joints using forward kinematics (simplified)
                this.updatePositionFromJoints();

                // Update visualization in real-time (no animation for immediate feedback)
                this.visualizer.updateRobotPose(this.currentState.joints, this.currentState.gripper.position, false);
            });
        }
    }

    updatePositionFromJoints() {
        // Forward kinematics using DH parameters (simplified version of backend)
        const joints = this.currentState.joints;
        const rad = joints.map(angle => angle * Math.PI / 180);

        // DH Parameters (matching backend)
        const dhParams = [
            [0,     0,     75,    0],     // Joint 1
            [0,     Math.PI/2, 100,   -Math.PI/2], // Joint 2
            [200,   0,     0,     0],     // Joint 3
            [0,     Math.PI/2, 190,   0],     // Joint 4
            [0,     -Math.PI/2, 0,    0],     // Joint 5
            [0,     0,     70,    0]      // Joint 6
        ];

        // Simplified forward kinematics calculation
        // For performance, we'll use a simplified version
        const theta1 = rad[0];
        const theta2 = rad[1] - Math.PI/2; // Account for offset
        const theta3 = rad[2];
        const theta5 = rad[4];

        // Base transformation
        const d1 = 75;
        const d2 = 100;
        const a3 = 200;
        const d4 = 190;
        const d6 = 70;

        // Calculate position step by step
        // Joint 2 position
        const x2 = 0;
        const y2 = 0;
        const z2 = d1 + d2;

        // Joint 3 position (shoulder to elbow)
        const x3 = a3 * Math.cos(theta2);
        const y3 = 0;
        const z3 = z2 + a3 * Math.sin(theta2);

        // Joint 4 position (elbow to wrist)
        const x4 = x3 + d4 * Math.cos(theta2 + theta3);
        const y4 = 0;
        const z4 = z3 + d4 * Math.sin(theta2 + theta3);

        // End-effector position
        const x_local = x4 + d6 * Math.cos(theta2 + theta3 + theta5);
        const y_local = y4;
        const z_local = z4 + d6 * Math.sin(theta2 + theta3 + theta5);

        // Apply base rotation
        const x_final = x_local * Math.cos(theta1) - y_local * Math.sin(theta1);
        const y_final = x_local * Math.sin(theta1) + y_local * Math.cos(theta1);
        const z_final = z_local;

        this.currentState.position = {
            x: x_final,
            y: y_final,
            z: z_final
        };

        // Update position sliders to reflect the calculated position
        this.updatePositionSliders();
    }

    setupGripperControls() {
        const gripperSlider = document.getElementById('gripperSlider');
        const gripperValue = document.getElementById('gripperValue');

        gripperSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            gripperValue.textContent = value;

            // Update visualization
            this.visualizer.updateRobotPose(this.currentState.joints, value);
            this.sendCommand('setGripper', { position: value, force: 50 });
        });

        document.getElementById('openGripper').addEventListener('click', () => {
            this.setGripper(0);
        });

        document.getElementById('closeGripper').addEventListener('click', () => {
            this.setGripper(100);
        });
    }

    toggleConnection() {
        if (this.isConnected) {
            this.disconnect();
        } else {
            this.connect();
        }
    }

    async connect() {
        try {
            this.logEvent('Connecting to robot...', 'info');

            // Simulate connection or send real command
            const success = await this.sendCommand('connect', {});

            if (success !== false) {
                this.isConnected = true;
                this.updateConnectionStatus();
                this.logEvent('Robot connected successfully', 'info');

                // Request initial state
                this.sendCommand('getState', {});
            }
        } catch (error) {
            this.logEvent(`Connection failed: ${error.message}`, 'error');
        }
    }

    async disconnect() {
        try {
            await this.sendCommand('disconnect', {});
            this.isConnected = false;
            this.updateConnectionStatus();
            this.logEvent('Robot disconnected', 'info');
        } catch (error) {
            this.logEvent(`Disconnect failed: ${error.message}`, 'error');
        }
    }

    async homeRobot() {
        if (!this.isConnected) {
            this.logEvent('Robot not connected', 'warning');
            return;
        }

        try {
            this.logEvent('Homing robot...', 'info');
            await this.sendCommand('home', {});
            this.logEvent('Robot homed successfully', 'info');
        } catch (error) {
            this.logEvent(`Homing failed: ${error.message}`, 'error');
        }
    }

    async moveToPosition() {
        if (!this.isConnected) {
            this.logEvent('Robot not connected', 'warning');
            return;
        }

        const x = parseFloat(document.getElementById('targetX').value);
        const y = parseFloat(document.getElementById('targetY').value);
        const z = parseFloat(document.getElementById('targetZ').value);

        try {
            this.logEvent(`Moving to position: X=${x}, Y=${y}, Z=${z}`, 'info');
            this.visualizer.addTargetMarker({ x, y, z });

            await this.sendCommand('moveTo', {
                position: { x, y, z },
                options: { speed: 50 }
            });

            this.logEvent('Move completed successfully', 'info');
        } catch (error) {
            this.logEvent(`Move failed: ${error.message}`, 'error');
        }
    }

    async moveJoints() {
        if (!this.isConnected) {
            this.logEvent('Robot not connected', 'warning');
            return;
        }

        const joints = [];
        for (let i = 1; i <= 6; i++) {
            joints.push(parseFloat(document.getElementById(`j${i}Slider`).value));
        }

        try {
            this.logEvent(`Moving joints: ${joints.map(j => j.toFixed(1)).join(', ')}°`, 'info');

            await this.sendCommand('moveJoints', {
                joints: joints,
                options: { speed: 50 }
            });

            this.logEvent('Joint move completed successfully', 'info');
        } catch (error) {
            this.logEvent(`Joint move failed: ${error.message}`, 'error');
        }
    }

    async setGripper(position) {
        if (!this.isConnected) {
            this.logEvent('Robot not connected', 'warning');
            return;
        }

        try {
            document.getElementById('gripperSlider').value = position;
            document.getElementById('gripperValue').textContent = position;

            this.logEvent(`Setting gripper to ${position}%`, 'info');
            await this.sendCommand('setGripper', { position, force: 50 });

            this.visualizer.updateRobotPose(this.currentState.joints, position);
            this.logEvent('Gripper move completed', 'info');
        } catch (error) {
            this.logEvent(`Gripper move failed: ${error.message}`, 'error');
        }
    }

    emergencyStop() {
        this.logEvent('EMERGENCY STOP ACTIVATED', 'error');
        this.sendCommand('emergencyStop', {});
    }

    sendCommand(command, data) {
        return new Promise((resolve, reject) => {
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                const message = {
                    id: Date.now(),
                    command,
                    data,
                    timestamp: new Date().toISOString()
                };

                this.websocket.send(JSON.stringify(message));

                // For demo purposes, simulate success after a delay
                setTimeout(() => {
                    if (command === 'connect') {
                        resolve(true);
                    } else {
                        resolve({ success: true });
                    }
                }, 100 + Math.random() * 500);

            } else {
                // Offline mode - simulate responses
                this.simulateCommand(command, data)
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    async simulateCommand(command, data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));

        switch (command) {
            case 'connect':
                return true;

            case 'moveTo':
                this.currentState.position = { ...data.position };
                // Use actual inverse kinematics calculation
                this.updateJointsFromPosition();
                this.updateVisualization();
                this.updateUI();
                return { success: true };

            case 'moveJoints':
                this.currentState.joints = [...data.joints];
                this.updateVisualization();
                this.updateUI();
                return { success: true };

            case 'setGripper':
                this.currentState.gripper.position = data.position;
                this.currentState.gripper.isOpen = data.position < 50;
                this.updateVisualization();
                return { success: true };

            case 'home':
                this.currentState.joints = [0, 0, 0, 0, 0, 0];
                this.updatePositionFromJoints(); // Calculate position from home joints
                this.updateVisualization();
                this.updateUI();
                return { success: true };

            case 'emergencyStop':
                return { success: true };

            default:
                return { success: true };
        }
    }

    handleServerMessage(message) {
        switch (message.type) {
            case 'stateUpdate':
                this.currentState = { ...message.data };
                this.updateVisualization();
                this.updateUI();
                break;

            case 'positionUpdate':
                this.currentState.position = { ...message.data };
                this.updateVisualization();
                break;

            case 'error':
                this.logEvent(`Robot error: ${message.data.message}`, 'error');
                break;

            default:
                console.log('Unknown message type:', message);
        }
    }

    updateVisualization() {
        if (this.visualizer) {
            this.visualizer.updateRobotPose(
                this.currentState.joints,
                this.currentState.gripper.position
            );
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        const connectBtn = document.getElementById('connectBtn');

        if (this.isConnected) {
            statusElement.textContent = 'Connected';
            statusElement.className = 'connected';
            connectBtn.textContent = 'Disconnect';
            connectBtn.className = 'btn danger';
        } else {
            statusElement.textContent = 'Disconnected';
            statusElement.className = '';
            connectBtn.textContent = 'Connect';
            connectBtn.className = 'btn primary';
        }
    }

    updateUI() {
        // Update status display
        const pos = this.currentState.position;
        document.getElementById('currentPosition').textContent =
            `X: ${pos.x.toFixed(1)}, Y: ${pos.y.toFixed(1)}, Z: ${pos.z.toFixed(1)}`;

        const joints = this.currentState.joints.map(j => j.toFixed(1) + '°').join(', ');
        document.getElementById('currentJoints').textContent = joints;

        const gripper = this.currentState.gripper;
        document.getElementById('currentGripper').textContent =
            `${gripper.isOpen ? 'Open' : 'Closed'} (${gripper.position}%)`;

        document.getElementById('isMoving').textContent = 'No'; // Would be updated from server

        // Update sliders to match current state
        this.updateJointSliders();
        this.updatePositionSliders();
    }

    updateJointSliders() {
        for (let i = 1; i <= 6; i++) {
            const slider = document.getElementById(`j${i}Slider`);
            const valueDisplay = document.getElementById(`j${i}Value`);
            const currentValue = this.currentState.joints[i - 1];

            if (slider && valueDisplay) {
                slider.value = currentValue;
                valueDisplay.textContent = currentValue.toFixed(0);
            }
        }
    }

    updatePositionSliders() {
        const axes = ['x', 'y', 'z'];

        axes.forEach(axis => {
            const slider = document.getElementById(`${axis}Slider`);
            const valueDisplay = document.getElementById(`${axis}Value`);
            const currentValue = this.currentState.position[axis];

            if (slider && valueDisplay) {
                slider.value = currentValue;
                valueDisplay.textContent = currentValue.toFixed(0);
            }
        });
    }

    logEvent(message, type = 'info') {
        const logElement = document.getElementById('eventLog');
        const timestamp = new Date().toLocaleTimeString();

        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;

        logElement.appendChild(logEntry);
        logElement.scrollTop = logElement.scrollHeight;

        // Keep only last 100 log entries
        while (logElement.children.length > 100) {
            logElement.removeChild(logElement.firstChild);
        }
    }

    clearLog() {
        document.getElementById('eventLog').innerHTML = '';
        this.logEvent('Log cleared', 'info');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.robotApp = new RobotSimulationApp();
});