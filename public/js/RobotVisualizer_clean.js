/**
 * SO-101 Robot Visualizer - J1 Focus Version
 * 베이스와 J1 조인트에 집중한 깔끔한 구현
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

        this.robotParts = {
            base: null,
            joints: [],
            links: [],
            endEffector: null
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

        // SO-101 Materials
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0xf8f9fa,
            shininess: 80,
            specular: 0x999999
        });
        const jointMaterial = new THREE.MeshPhongMaterial({
            color: 0xe9ecef,
            shininess: 70,
            specular: 0x777777
        });
        const linkMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 90,
            specular: 0xaaaaaa
        });
        const accentMaterial = new THREE.MeshPhongMaterial({
            color: 0x007bff,
            shininess: 100,
            specular: 0x888888
        });

        // === SO-101 Base ===
        this.setupBase(baseMaterial, accentMaterial, linkMaterial);

        // === J1 (Base Rotation Joint) ===
        this.setupJ1(jointMaterial, linkMaterial, accentMaterial);

        // === Temporary J2-J6 (Simple representations) ===
        this.setupTemporaryRemainingJoints();
    }

    setupBase(baseMaterial, accentMaterial, linkMaterial) {
        const baseGroup = new THREE.Group();

        // 메인 베이스
        const baseGeometry = new THREE.CylinderGeometry(70, 80, 35, 24);
        this.robotParts.base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.robotParts.base.position.y = 17.5;
        this.robotParts.base.castShadow = true;
        baseGroup.add(this.robotParts.base);

        // SO-101 로고 플레이트
        const logoPlateGeometry = new THREE.CylinderGeometry(90, 90, 6, 24);
        const logoPlate = new THREE.Mesh(logoPlateGeometry, accentMaterial);
        logoPlate.position.y = 3;
        logoPlate.castShadow = true;
        baseGroup.add(logoPlate);

        // 베이스 상단 커버
        const baseCoverGeometry = new THREE.CylinderGeometry(60, 70, 15, 24);
        const baseCover = new THREE.Mesh(baseCoverGeometry, linkMaterial);
        baseCover.position.y = 35;
        baseCover.castShadow = true;
        baseGroup.add(baseCover);

        // 베이스 마운팅 포인트
        this.addBaseMountingPoints(baseGroup, accentMaterial);

        // SO-101 브랜딩 라벨
        this.addSO101Branding(baseGroup);

        this.robot.add(baseGroup);
    }

    setupJ1(jointMaterial, linkMaterial, accentMaterial) {
        // === J1 조인트 메인 바디 ===
        const joint1Geometry = new THREE.CylinderGeometry(40, 40, 50, 24);
        this.robotParts.joints[0] = new THREE.Mesh(joint1Geometry, linkMaterial);
        this.robotParts.joints[0].position.set(0, 0, 67.5);
        this.robotParts.joints[0].castShadow = true;

        // J1 액센트 링 (회전 표시용)
        const joint1AccentGeometry = new THREE.CylinderGeometry(42, 42, 8, 24);
        const joint1Accent = new THREE.Mesh(joint1AccentGeometry, accentMaterial);
        joint1Accent.position.set(0, 0, 21);
        this.robotParts.joints[0].add(joint1Accent);

        // J1 상단 커버
        const joint1CoverGeometry = new THREE.CylinderGeometry(35, 35, 6, 24);
        const joint1Cover = new THREE.Mesh(joint1CoverGeometry, jointMaterial);
        joint1Cover.position.set(0, 0, 27);
        this.robotParts.joints[0].add(joint1Cover);

        // J1 라벨
        this.addJ1Label();

        // === Link 1 (J1에 연결된 상완 연결부) ===
        const link1Group = new THREE.Group();

        // 메인 링크
        const link1Geometry = new THREE.BoxGeometry(45, 45, 80);
        this.robotParts.links[0] = new THREE.Mesh(link1Geometry, linkMaterial);
        this.robotParts.links[0].position.set(0, 0, 40);
        this.robotParts.links[0].castShadow = true;

        // 링크 액센트 라인
        const link1AccentGeometry = new THREE.BoxGeometry(47, 8, 80);
        const link1AccentLine = new THREE.Mesh(link1AccentGeometry, accentMaterial);
        link1AccentLine.position.set(0, 0, 40);

        // J2 연결부
        const connectorGeometry = new THREE.CylinderGeometry(25, 25, 20, 16);
        const connector = new THREE.Mesh(connectorGeometry, jointMaterial);
        connector.position.set(0, 0, 85);
        connector.rotation.x = Math.PI / 2;

        link1Group.add(this.robotParts.links[0]);
        link1Group.add(link1AccentLine);
        link1Group.add(connector);

        this.robotParts.joints[0].add(link1Group);
        this.robot.add(this.robotParts.joints[0]);
    }

    setupTemporaryRemainingJoints() {
        // 임시로 J2~J6를 간단하게 표시
        const tempMaterial = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.6
        });

        // J2 임시
        const tempJ2 = new THREE.CylinderGeometry(20, 20, 40, 12);
        this.robotParts.joints[1] = new THREE.Mesh(tempJ2, tempMaterial);
        this.robotParts.joints[1].position.set(0, 0, 85);
        this.robotParts.joints[1].rotation.z = Math.PI / 2;
        this.robotParts.joints[0].add(this.robotParts.joints[1]);

        // 간단한 상완
        const tempUpperArm = new THREE.BoxGeometry(25, 25, 150);
        this.robotParts.links[1] = new THREE.Mesh(tempUpperArm, tempMaterial);
        this.robotParts.links[1].position.set(0, 0, 75);
        this.robotParts.joints[1].add(this.robotParts.links[1]);

        // 간단한 팔꿈치
        const tempElbow = new THREE.CylinderGeometry(15, 15, 30, 12);
        this.robotParts.joints[2] = new THREE.Mesh(tempElbow, tempMaterial);
        this.robotParts.joints[2].position.set(0, 0, 150);
        this.robotParts.joints[2].rotation.z = Math.PI / 2;
        this.robotParts.joints[1].add(this.robotParts.joints[2]);

        // 간단한 전완
        const tempForearm = new THREE.BoxGeometry(20, 20, 100);
        this.robotParts.links[2] = new THREE.Mesh(tempForearm, tempMaterial);
        this.robotParts.links[2].position.set(0, 0, 50);
        this.robotParts.joints[2].add(this.robotParts.links[2]);

        // 간단한 손목과 그리퍼
        const tempWrist = new THREE.CylinderGeometry(10, 10, 60, 8);
        this.robotParts.joints[3] = new THREE.Mesh(tempWrist, tempMaterial);
        this.robotParts.joints[3].position.set(0, 0, 100);
        this.robotParts.joints[2].add(this.robotParts.joints[3]);

        const tempGripper = new THREE.BoxGeometry(30, 15, 20);
        this.robotParts.endEffector = new THREE.Mesh(tempGripper, tempMaterial);
        this.robotParts.endEffector.position.set(0, 0, 40);
        this.robotParts.joints[3].add(this.robotParts.endEffector);

        // 임시 조인트 라벨
        this.addTemporaryLabels();
    }

    addBaseMountingPoints(baseGroup, accentMaterial) {
        const mountGeometry = new THREE.CylinderGeometry(4, 4, 6, 12);
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const mount = new THREE.Mesh(mountGeometry, accentMaterial);
            mount.position.set(
                Math.cos(angle) * 75,
                Math.sin(angle) * 75,
                6
            );
            baseGroup.add(mount);
        }
    }

    addSO101Branding(baseGroup) {
        const createTextSprite = (text, size, color) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 128;

            context.fillStyle = color;
            context.font = `bold ${size}px Arial`;
            context.textAlign = 'center';
            context.fillText(text, 128, 64);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            return sprite;
        };

        // SO-101 메인 로고
        const mainLogo = createTextSprite('SO-101', 36, '#007bff');
        mainLogo.position.set(0, 60, 6);
        mainLogo.scale.set(40, 20, 1);
        baseGroup.add(mainLogo);

        // 모델명 라벨
        const modelLabel = createTextSprite('6-DOF Robot Arm', 24, '#ffffff');
        modelLabel.position.set(0, 35, 6);
        modelLabel.scale.set(60, 15, 1);
        baseGroup.add(modelLabel);
    }

    addJ1Label() {
        const createJointLabel = (text) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 64;

            context.fillStyle = '#007bff';
            context.fillRect(0, 0, 64, 64);
            context.fillStyle = '#ffffff';
            context.font = 'bold 28px Arial';
            context.textAlign = 'center';
            context.fillText(text, 32, 42);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            return sprite;
        };

        const j1Label = createJointLabel('J1');
        j1Label.position.set(0, 35, 25);
        j1Label.scale.set(20, 20, 1);
        this.robotParts.joints[0].add(j1Label);
    }

    addTemporaryLabels() {
        const createTempLabel = (text) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 64;

            context.fillStyle = '#666666';
            context.fillRect(0, 0, 64, 64);
            context.fillStyle = '#ffffff';
            context.font = 'bold 24px Arial';
            context.textAlign = 'center';
            context.fillText(text, 32, 42);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            return sprite;
        };

        // J2 라벨
        if (this.robotParts.joints[1]) {
            const j2Label = createTempLabel('J2');
            j2Label.position.set(0, 25, 0);
            j2Label.scale.set(15, 15, 1);
            this.robotParts.joints[1].add(j2Label);
        }

        // J3 라벨
        if (this.robotParts.joints[2]) {
            const j3Label = createTempLabel('J3');
            j3Label.position.set(0, 20, 0);
            j3Label.scale.set(15, 15, 1);
            this.robotParts.joints[2].add(j3Label);
        }
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
        // Grid helper
        this.gridHelper = new THREE.GridHelper(1000, 20, 0x444444, 0x222222);
        this.scene.add(this.gridHelper);

        // Axes helper
        this.axesHelper = new THREE.AxesHelper(300);
        this.scene.add(this.axesHelper);

        // Add coordinate labels
        this.addCoordinateLabels();
    }

    addCoordinateLabels() {
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

    // J1 중심의 간단한 움직임 제어
    updateRobotPose(joints, gripperPosition = 0, animate = true) {
        if (animate) {
            this.animateToTarget(joints, gripperPosition);
        } else {
            this.setRobotPose(joints, gripperPosition);
        }
    }

    setRobotPose(joints, gripperPosition = 0) {
        // J1만 실제로 움직이고 나머지는 고정
        if (this.robotParts.joints[0]) {
            // J1: Base rotation around Z-axis (-180° to 180°)
            const j1Angle = Math.max(-180, Math.min(180, joints[0]));
            this.robotParts.joints[0].rotation.z = j1Angle * Math.PI / 180;
        }

        // J2~J6은 임시로 고정된 값 사용
        if (this.robotParts.joints[1]) {
            this.robotParts.joints[1].rotation.y = (joints[1] || 0) * Math.PI / 180;
        }
        if (this.robotParts.joints[2]) {
            this.robotParts.joints[2].rotation.y = (joints[2] || 0) * Math.PI / 180;
        }
    }

    animateToTarget(targetJoints, targetGripperPosition) {
        // Cancel any existing animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Store current J1 position
        const currentJ1 = this.robotParts.joints[0] ?
            this.robotParts.joints[0].rotation.z * 180 / Math.PI : 0;

        const startTime = Date.now();
        const duration = Math.abs(targetJoints[0] - currentJ1) * 10; // 1도당 10ms

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Smooth easing
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - 2 * (1 - progress) * (1 - progress);

            // Interpolate J1 position
            const interpolatedJ1 = currentJ1 + (targetJoints[0] - currentJ1) * easeProgress;

            // Apply interpolated values
            this.setRobotPose([interpolatedJ1, ...targetJoints.slice(1)], targetGripperPosition);

            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.animationId = null;
                // Set final position
                this.setRobotPose(targetJoints, targetGripperPosition);
            }
        };

        animate();
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