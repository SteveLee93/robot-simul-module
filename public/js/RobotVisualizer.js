/**
 * Robot 3D Visualizer using Three.js
 * Renders a simplified 6-DOF robot arm with real-time updates
 */
export class RobotVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.robot = null;
        this.gridHelper = null;
        this.axesHelper = null;
        this.workspace = null;

        this.robotParts = {
            base: null,
            joints: [],
            links: [],
            endEffector: null,
            gripper: null
        };

        this.init();
    }

    init() {
        this.setupScene();
        this.setupLighting();
        this.setupRobot();
        this.setupWorkspace();
        this.setupHelpers();
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            2000
        );
        this.camera.position.set(500, 400, 600);
        this.camera.lookAt(0, 0, 200);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 0, 200);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 1500;
        this.controls.minDistance = 200;
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(200, 200, 200);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 1000;
        directionalLight.shadow.camera.left = -500;
        directionalLight.shadow.camera.right = 500;
        directionalLight.shadow.camera.top = 500;
        directionalLight.shadow.camera.bottom = -500;
        this.scene.add(directionalLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4444ff, 0.3);
        fillLight.position.set(-200, 100, 100);
        this.scene.add(fillLight);
    }

    setupRobot() {
        // Create robot group
        this.robot = new THREE.Group();
        this.scene.add(this.robot);

        // Materials
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const jointMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const linkMaterial = new THREE.MeshLambertMaterial({ color: 0x00aa44 });
        const endEffectorMaterial = new THREE.MeshLambertMaterial({ color: 0xaa6600 });

        // Base
        const baseGeometry = new THREE.CylinderGeometry(60, 80, 30, 16);
        this.robotParts.base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.robotParts.base.position.y = 15;
        this.robotParts.base.castShadow = true;
        this.robot.add(this.robotParts.base);

        // Joint 1 (Base rotation)
        const joint1Geometry = new THREE.CylinderGeometry(40, 40, 60, 12);
        this.robotParts.joints[0] = new THREE.Mesh(joint1Geometry, jointMaterial);
        this.robotParts.joints[0].position.set(0, 0, 60);
        this.robotParts.joints[0].castShadow = true;

        // Link 1 (Shoulder)
        const link1Geometry = new THREE.BoxGeometry(40, 40, 100);
        this.robotParts.links[0] = new THREE.Mesh(link1Geometry, linkMaterial);
        this.robotParts.links[0].position.set(0, 0, 50);
        this.robotParts.links[0].castShadow = true;

        // Create joint 1 group
        this.robotParts.joints[0].add(this.robotParts.links[0]);
        this.robot.add(this.robotParts.joints[0]);

        // Joint 2 (Shoulder)
        const joint2Geometry = new THREE.SphereGeometry(25, 12, 8);
        this.robotParts.joints[1] = new THREE.Mesh(joint2Geometry, jointMaterial);
        this.robotParts.joints[1].position.set(0, 0, 100);
        this.robotParts.joints[1].castShadow = true;

        // Link 2 (Upper arm)
        const link2Geometry = new THREE.BoxGeometry(30, 30, 200);
        this.robotParts.links[1] = new THREE.Mesh(link2Geometry, linkMaterial);
        this.robotParts.links[1].position.set(0, 0, 100);
        this.robotParts.links[1].castShadow = true;

        // Create joint 2 group
        this.robotParts.joints[1].add(this.robotParts.links[1]);
        this.robotParts.joints[0].add(this.robotParts.joints[1]);

        // Joint 3 (Elbow)
        const joint3Geometry = new THREE.SphereGeometry(20, 12, 8);
        this.robotParts.joints[2] = new THREE.Mesh(joint3Geometry, jointMaterial);
        this.robotParts.joints[2].position.set(0, 0, 200);
        this.robotParts.joints[2].castShadow = true;

        // Link 3 (Forearm)
        const link3Geometry = new THREE.BoxGeometry(25, 25, 150);
        this.robotParts.links[2] = new THREE.Mesh(link3Geometry, linkMaterial);
        this.robotParts.links[2].position.set(0, 0, 75);
        this.robotParts.links[2].castShadow = true;

        // Create joint 3 group
        this.robotParts.joints[2].add(this.robotParts.links[2]);
        this.robotParts.joints[1].add(this.robotParts.joints[2]);

        // Joint 4 (Wrist 1)
        const joint4Geometry = new THREE.CylinderGeometry(15, 15, 40, 8);
        this.robotParts.joints[3] = new THREE.Mesh(joint4Geometry, jointMaterial);
        this.robotParts.joints[3].position.set(0, 0, 150);
        this.robotParts.joints[3].castShadow = true;

        // Joint 5 (Wrist 2)
        const joint5Geometry = new THREE.SphereGeometry(12, 8, 6);
        this.robotParts.joints[4] = new THREE.Mesh(joint5Geometry, jointMaterial);
        this.robotParts.joints[4].position.set(0, 0, 40);
        this.robotParts.joints[4].castShadow = true;

        // Joint 6 (Wrist 3)
        const joint6Geometry = new THREE.CylinderGeometry(10, 10, 20, 8);
        this.robotParts.joints[5] = new THREE.Mesh(joint6Geometry, jointMaterial);
        this.robotParts.joints[5].position.set(0, 0, 30);
        this.robotParts.joints[5].castShadow = true;

        // End effector
        const endEffectorGeometry = new THREE.BoxGeometry(40, 20, 60);
        this.robotParts.endEffector = new THREE.Mesh(endEffectorGeometry, endEffectorMaterial);
        this.robotParts.endEffector.position.set(0, 0, 40);
        this.robotParts.endEffector.castShadow = true;

        // Gripper fingers
        const gripperMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const gripperGeometry = new THREE.BoxGeometry(5, 15, 30);

        this.robotParts.gripper = new THREE.Group();

        const leftFinger = new THREE.Mesh(gripperGeometry, gripperMaterial);
        leftFinger.position.set(-15, 0, 15);
        leftFinger.name = 'leftFinger';

        const rightFinger = new THREE.Mesh(gripperGeometry, gripperMaterial);
        rightFinger.position.set(15, 0, 15);
        rightFinger.name = 'rightFinger';

        this.robotParts.gripper.add(leftFinger);
        this.robotParts.gripper.add(rightFinger);

        // Build the kinematic chain
        this.robotParts.joints[2].add(this.robotParts.joints[3]);
        this.robotParts.joints[3].add(this.robotParts.joints[4]);
        this.robotParts.joints[4].add(this.robotParts.joints[5]);
        this.robotParts.joints[5].add(this.robotParts.endEffector);
        this.robotParts.endEffector.add(this.robotParts.gripper);
    }

    setupWorkspace() {
        // Create workspace boundary
        const workspaceGeometry = new THREE.BoxGeometry(1000, 1000, 800);
        const workspaceEdges = new THREE.EdgesGeometry(workspaceGeometry);
        const workspaceMaterial = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.3
        });

        this.workspace = new THREE.LineSegments(workspaceEdges, workspaceMaterial);
        this.workspace.position.set(0, 0, 400);
        this.scene.add(this.workspace);
    }

    setupHelpers() {
        // Grid helper (XY plane at Z=0)
        this.gridHelper = new THREE.GridHelper(1000, 20, 0x444444, 0x222222);
        this.scene.add(this.gridHelper);

        // Axes helper - Red=X, Green=Y, Blue=Z
        this.axesHelper = new THREE.AxesHelper(300);
        this.scene.add(this.axesHelper);

        // Add coordinate labels
        this.addCoordinateLabels();
    }

    addCoordinateLabels() {
        // Create text sprites for coordinate labels (simplified approach)
        const createLabel = (text, position, color) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 64;

            context.fillStyle = color;
            context.font = '24px Arial';
            context.textAlign = 'center';
            context.fillText(text, 64, 32);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.position.copy(position);
            sprite.scale.set(50, 25, 1);

            return sprite;
        };

        // Add X, Y, Z labels
        this.scene.add(createLabel('X', new THREE.Vector3(320, 0, 0), '#ff4444'));
        this.scene.add(createLabel('Y', new THREE.Vector3(0, 320, 0), '#44ff44'));
        this.scene.add(createLabel('Z', new THREE.Vector3(0, 0, 320), '#4444ff'));
    }

    updateRobotPose(joints, gripperPosition = 0, animate = true) {
        if (animate) {
            this.animateToTarget(joints, gripperPosition);
        } else {
            this.setRobotPose(joints, gripperPosition);
        }
    }

    setRobotPose(joints, gripperPosition = 0) {
        // Update joint rotations based on DH parameters
        // Joint rotations match the DH parameter definitions

        if (this.robotParts.joints[0]) {
            // Joint 1: Base rotation around Z-axis
            this.robotParts.joints[0].rotation.z = joints[0] * Math.PI / 180;
        }
        if (this.robotParts.joints[1]) {
            // Joint 2: Shoulder rotation around Y-axis (with -90° offset in DH)
            this.robotParts.joints[1].rotation.y = (joints[1] - 90) * Math.PI / 180;
        }
        if (this.robotParts.joints[2]) {
            // Joint 3: Elbow rotation around Y-axis
            this.robotParts.joints[2].rotation.y = joints[2] * Math.PI / 180;
        }
        if (this.robotParts.joints[3]) {
            // Joint 4: Wrist 1 rotation around Z-axis
            this.robotParts.joints[3].rotation.z = joints[3] * Math.PI / 180;
        }
        if (this.robotParts.joints[4]) {
            // Joint 5: Wrist 2 rotation around Y-axis
            this.robotParts.joints[4].rotation.y = joints[4] * Math.PI / 180;
        }
        if (this.robotParts.joints[5]) {
            // Joint 6: Wrist 3 rotation around Z-axis
            this.robotParts.joints[5].rotation.z = joints[5] * Math.PI / 180;
        }

        // Update gripper
        if (this.robotParts.gripper) {
            const leftFinger = this.robotParts.gripper.getObjectByName('leftFinger');
            const rightFinger = this.robotParts.gripper.getObjectByName('rightFinger');

            if (leftFinger && rightFinger) {
                const openDistance = 15; // Max distance from center
                const currentDistance = openDistance * (1 - gripperPosition / 100);

                leftFinger.position.x = -currentDistance;
                rightFinger.position.x = currentDistance;
            }
        }
    }

    animateToTarget(targetJoints, targetGripperPosition) {
        // Cancel any existing animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Store current joint positions
        const currentJoints = [
            this.robotParts.joints[0] ? this.robotParts.joints[0].rotation.z * 180 / Math.PI : 0,
            this.robotParts.joints[1] ? this.robotParts.joints[1].rotation.y * 180 / Math.PI : 0,
            this.robotParts.joints[2] ? this.robotParts.joints[2].rotation.y * 180 / Math.PI : 0,
            this.robotParts.joints[3] ? this.robotParts.joints[3].rotation.z * 180 / Math.PI : 0,
            this.robotParts.joints[4] ? this.robotParts.joints[4].rotation.y * 180 / Math.PI : 0,
            this.robotParts.joints[5] ? this.robotParts.joints[5].rotation.z * 180 / Math.PI : 0
        ];

        const currentGripperPos = this.getCurrentGripperPosition();

        const startTime = Date.now();
        const duration = 300; // 300ms animation

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Smooth easing function (ease-out)
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            // Interpolate joint positions
            const interpolatedJoints = currentJoints.map((start, index) => {
                const target = targetJoints[index];
                return start + (target - start) * easeProgress;
            });

            // Interpolate gripper position
            const interpolatedGripper = currentGripperPos + (targetGripperPosition - currentGripperPos) * easeProgress;

            // Apply interpolated values
            this.setRobotPose(interpolatedJoints, interpolatedGripper);

            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.animationId = null;
            }
        };

        animate();
    }

    getCurrentGripperPosition() {
        if (this.robotParts.gripper) {
            const leftFinger = this.robotParts.gripper.getObjectByName('leftFinger');
            if (leftFinger) {
                const openDistance = 15;
                const currentDistance = Math.abs(leftFinger.position.x);
                return (1 - currentDistance / openDistance) * 100;
            }
        }
        return 0;
    }

    addTargetMarker(position) {
        // Remove existing target marker
        const existingTarget = this.scene.getObjectByName('targetMarker');
        if (existingTarget) {
            this.scene.remove(existingTarget);
        }

        // Create target marker
        const targetGeometry = new THREE.SphereGeometry(10, 8, 6);
        const targetMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4444,
            transparent: true,
            opacity: 0.8
        });
        const targetMarker = new THREE.Mesh(targetGeometry, targetMaterial);
        targetMarker.position.set(position.x, position.y, position.z);
        targetMarker.name = 'targetMarker';
        this.scene.add(targetMarker);

        // Add pulsing animation
        const scale = { value: 1 };
        const animate = () => {
            scale.value = 1 + 0.3 * Math.sin(Date.now() * 0.005);
            targetMarker.scale.setScalar(scale.value);
            requestAnimationFrame(animate);
        };
        animate();
    }

    toggleGrid() {
        this.gridHelper.visible = !this.gridHelper.visible;
    }

    toggleAxes() {
        this.axesHelper.visible = !this.axesHelper.visible;
    }

    resetView() {
        this.camera.position.set(500, 400, 600);
        this.camera.lookAt(0, 0, 200);
        this.controls.target.set(0, 0, 200);
        this.controls.update();
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        // Clean up resources
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.controls) {
            this.controls.dispose();
        }
        window.removeEventListener('resize', this.onWindowResize);
    }
}