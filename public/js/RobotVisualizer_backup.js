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

        // SO-101 specific materials
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

        // === SO-101 Base Design ===
        this.setupBase(baseMaterial, accentMaterial, linkMaterial);

        // === J1 (Base Rotation Joint) ===
        this.setupJ1(jointMaterial, linkMaterial, accentMaterial);

        // 임시로 J2~J6는 간단하게만 표시 (나중에 하나씩 구현)
        this.setupTemporaryJoints();
    }

    setupBase(baseMaterial, accentMaterial, linkMaterial) {
        const baseGroup = new THREE.Group();

        // 메인 베이스
        const baseGeometry = new THREE.CylinderGeometry(70, 80, 35, 20);
        this.robotParts.base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.robotParts.base.position.y = 17.5;
        this.robotParts.base.castShadow = true;
        baseGroup.add(this.robotParts.base);

        // SO-101 로고 플레이트
        const logoPlateGeometry = new THREE.CylinderGeometry(90, 90, 6, 20);
        const logoPlate = new THREE.Mesh(logoPlateGeometry, accentMaterial);
        logoPlate.position.y = 3;
        logoPlate.castShadow = true;
        baseGroup.add(logoPlate);

        // 베이스 커버
        const baseCoverGeometry = new THREE.CylinderGeometry(60, 70, 15, 20);
        const baseCover = new THREE.Mesh(baseCoverGeometry, linkMaterial);
        baseCover.position.y = 35;
        baseCover.castShadow = true;
        baseGroup.add(baseCover);

        // SO-101 브랜딩
        this.addSO101Branding(baseGroup);

        // 베이스 마운팅 포인트
        this.addBaseMountingPoints(baseGroup, accentMaterial);

        this.robot.add(baseGroup);
    }

    setupJ1(jointMaterial, linkMaterial, accentMaterial) {
        // J1 메인 조인트 - 베이스 회전
        const joint1Geometry = new THREE.CylinderGeometry(40, 40, 50, 20);
        this.robotParts.joints[0] = new THREE.Mesh(joint1Geometry, linkMaterial);
        this.robotParts.joints[0].position.set(0, 0, 67.5);
        this.robotParts.joints[0].castShadow = true;

        // J1 액센트 링
        const joint1AccentGeometry = new THREE.CylinderGeometry(42, 42, 8, 20);
        const joint1Accent = new THREE.Mesh(joint1AccentGeometry, accentMaterial);
        joint1Accent.position.set(0, 0, 21);
        this.robotParts.joints[0].add(joint1Accent);

        // J1 상단 커버
        const joint1CoverGeometry = new THREE.CylinderGeometry(35, 35, 6, 20);
        const joint1Cover = new THREE.Mesh(joint1CoverGeometry, jointMaterial);
        joint1Cover.position.set(0, 0, 27);
        this.robotParts.joints[0].add(joint1Cover);

        // J1 라벨
        this.addJ1Label();

        // J1에 연결된 Link 1 (상완 연결부)
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

        // 상단 연결부 (J2 연결 준비)
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

    setupTemporaryJoints() {
        // 임시로 J2~J6를 간단하게 표시 (나중에 하나씩 제대로 구현)
        const tempMaterial = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.7
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

        // J3~J6도 매우 간단하게
        const tempElbow = new THREE.CylinderGeometry(15, 15, 30, 12);
        this.robotParts.joints[2] = new THREE.Mesh(tempElbow, tempMaterial);
        this.robotParts.joints[2].position.set(0, 0, 150);
        this.robotParts.joints[2].rotation.z = Math.PI / 2;
        this.robotParts.joints[1].add(this.robotParts.joints[2]);

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
    }
        link2Group.add(upperAccent1);
        link2Group.add(upperAccent2);
        link2Group.add(upperConnector1);
        link2Group.add(upperConnector2);

        this.robotParts.joints[1].add(link2Group);
        this.robotParts.joints[0].add(this.robotParts.joints[1]);

        // Joint 3 (Elbow) - SO-101 스타일의 팔꿈치
        const joint3Geometry = new THREE.CylinderGeometry(23, 23, 48, 20);
        this.robotParts.joints[2] = new THREE.Mesh(joint3Geometry, jointMaterial);
        this.robotParts.joints[2].position.set(0, 0, 170);
        this.robotParts.joints[2].rotation.z = Math.PI / 2;
        this.robotParts.joints[2].castShadow = true;

        // SO-101 조인트 3 액센트
        const joint3AccentGeometry = new THREE.CylinderGeometry(25, 25, 10, 20);
        const joint3Accent = new THREE.Mesh(joint3AccentGeometry, accentMaterial);
        joint3Accent.position.set(0, 0, 0);
        this.robotParts.joints[2].add(joint3Accent);

        // Link 3 (Forearm) - SO-101의 슬림한 전완 디자인
        const link3Group = new THREE.Group();

        const link3Geometry = new THREE.BoxGeometry(32, 32, 110);
        this.robotParts.links[2] = new THREE.Mesh(link3Geometry, linkMaterial);
        this.robotParts.links[2].position.set(0, 0, 55);
        this.robotParts.links[2].castShadow = true;

        // SO-101 전완 액센트
        const forearmAccentGeometry = new THREE.BoxGeometry(34, 6, 110);
        const forearmAccent = new THREE.Mesh(forearmAccentGeometry, accentMaterial);
        forearmAccent.position.set(0, 13, 55);

        // 전완 연결부
        const forearmConnector = new THREE.CylinderGeometry(18, 18, 38, 16);
        const foreConnector = new THREE.Mesh(forearmConnector, jointMaterial);
        foreConnector.position.set(0, 0, 105);
        foreConnector.rotation.x = Math.PI / 2;

        link3Group.add(this.robotParts.links[2]);
        link3Group.add(forearmAccent);
        link3Group.add(foreConnector);

        this.robotParts.joints[2].add(link3Group);
        this.robotParts.joints[1].add(this.robotParts.joints[2]);

        // SO-101 Wrist Assembly - 특징적인 3축 손목 디자인
        // Joint 4 (Wrist 1)
        const joint4Geometry = new THREE.CylinderGeometry(16, 16, 32, 16);
        this.robotParts.joints[3] = new THREE.Mesh(joint4Geometry, jointMaterial);
        this.robotParts.joints[3].position.set(0, 0, 110);
        this.robotParts.joints[3].castShadow = true;

        // Joint 5 (Wrist 2)
        const joint5Geometry = new THREE.CylinderGeometry(14, 14, 28, 16);
        this.robotParts.joints[4] = new THREE.Mesh(joint5Geometry, linkMaterial);
        this.robotParts.joints[4].position.set(0, 0, 22);
        this.robotParts.joints[4].rotation.z = Math.PI / 2;
        this.robotParts.joints[4].castShadow = true;

        // Joint 6 (Wrist 3)
        const joint6Geometry = new THREE.CylinderGeometry(12, 12, 22, 16);
        this.robotParts.joints[5] = new THREE.Mesh(joint6Geometry, jointMaterial);
        this.robotParts.joints[5].position.set(0, 0, 18);
        this.robotParts.joints[5].castShadow = true;

        // SO-101 End Effector - 모던하고 깔끔한 디자인
        const endEffectorGroup = new THREE.Group();

        const endEffectorGeometry = new THREE.BoxGeometry(45, 28, 35);
        this.robotParts.endEffector = new THREE.Mesh(endEffectorGeometry, endEffectorMaterial);
        this.robotParts.endEffector.position.set(0, 0, 25);
        this.robotParts.endEffector.castShadow = true;

        // SO-101 로고가 들어간 엔드 이펙터 플레이트
        const endPlateGeometry = new THREE.BoxGeometry(55, 32, 8);
        const endPlate = new THREE.Mesh(endPlateGeometry, accentMaterial);
        endPlate.position.set(0, 0, 50);

        endEffectorGroup.add(this.robotParts.endEffector);
        endEffectorGroup.add(endPlate);

        // SO-101 특유의 그리퍼 디자인
        const gripperMaterial = new THREE.MeshPhongMaterial({
            color: 0xe9ecef,
            shininess: 80
        });

        this.robotParts.gripper = new THREE.Group();

        // SO-101 그리퍼 베이스
        const gripperBaseGeometry = new THREE.BoxGeometry(35, 22, 18);
        const gripperBase = new THREE.Mesh(gripperBaseGeometry, gripperMaterial);
        gripperBase.position.set(0, 0, 9);
        this.robotParts.gripper.add(gripperBase);

        // SO-101 스타일의 슬림한 그리퍼 핑거들
        const leftFingerGeometry = new THREE.BoxGeometry(6, 18, 35);
        const leftFinger = new THREE.Mesh(leftFingerGeometry, gripperMaterial);
        leftFinger.position.set(-18, 0, 22.5);
        leftFinger.name = 'leftFinger';
        leftFinger.castShadow = true;

        const rightFingerGeometry = new THREE.BoxGeometry(6, 18, 35);
        const rightFinger = new THREE.Mesh(rightFingerGeometry, gripperMaterial);
        rightFinger.position.set(18, 0, 22.5);
        rightFinger.name = 'rightFinger';
        rightFinger.castShadow = true;

        // SO-101 그리퍼 팁 - 블루 액센트
        const fingerTipGeometry = new THREE.BoxGeometry(6, 18, 4);
        const fingerTipMaterial = new THREE.MeshPhongMaterial({ color: 0x007bff });

        const leftTip = new THREE.Mesh(fingerTipGeometry, fingerTipMaterial);
        leftTip.position.set(0, 0, 19.5);
        leftFinger.add(leftTip);

        const rightTip = new THREE.Mesh(fingerTipGeometry, fingerTipMaterial);
        rightTip.position.set(0, 0, 19.5);
        rightFinger.add(rightTip);

        // SO-101 그리퍼 액센트 라인
        const fingerAccentGeometry = new THREE.BoxGeometry(8, 4, 35);
        const leftFingerAccent = new THREE.Mesh(fingerAccentGeometry, accentMaterial);
        leftFingerAccent.position.set(0, 7, 0);
        leftFinger.add(leftFingerAccent);

        const rightFingerAccent = new THREE.Mesh(fingerAccentGeometry, accentMaterial);
        rightFingerAccent.position.set(0, 7, 0);
        rightFinger.add(rightFingerAccent);

        this.robotParts.gripper.add(leftFinger);
        this.robotParts.gripper.add(rightFinger);

        // Add SO-101 specific cables and details
        this.addSO101CablesAndDetails();

        // Build the kinematic chain
        this.robotParts.joints[2].add(this.robotParts.joints[3]);
        this.robotParts.joints[3].add(this.robotParts.joints[4]);
        this.robotParts.joints[4].add(this.robotParts.joints[5]);
        this.robotParts.joints[5].add(endEffectorGroup);
        endEffectorGroup.add(this.robotParts.gripper);
    }

    addSO101Branding(baseGroup) {
        // SO-101 로고 텍스트 스프라이트 생성
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

        // 시리얼 번호
        const serialLabel = createTextSprite('S/N: 2024-001', 18, '#adb5bd');
        serialLabel.position.set(0, 15, 6);
        serialLabel.scale.set(40, 10, 1);
        baseGroup.add(serialLabel);
    }

    addSO101CablesAndDetails() {
        // SO-101 스타일의 슬림한 케이블 디자인
        const cableMaterial = new THREE.MeshPhongMaterial({
            color: 0x2c3e50,
            shininess: 20
        });

        const detailMaterial = new THREE.MeshPhongMaterial({
            color: 0x007bff,
            shininess: 80
        });

        // 베이스에 SO-101 스타일 마운팅 포인트
        const mountGeometry = new THREE.CylinderGeometry(4, 4, 6, 12);
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const mount = new THREE.Mesh(mountGeometry, detailMaterial);
            mount.position.set(
                Math.cos(angle) * 75,
                Math.sin(angle) * 75,
                6
            );
            this.robot.add(mount);
        }

        // SO-101 케이블 가이드 시스템
        const cableGuideGeometry = new THREE.TorusGeometry(6, 1.5, 6, 12);

        // 조인트 1 케이블 가이드
        const cableGuide1 = new THREE.Mesh(cableGuideGeometry, cableMaterial);
        cableGuide1.position.set(0, 0, 15);
        cableGuide1.rotation.x = Math.PI / 2;
        this.robotParts.joints[0].add(cableGuide1);

        // SO-101 스타일 케이블 번들 (더 정돈된 디자인)
        const cableGeometry = new THREE.CylinderGeometry(2, 2, 70, 8);
        const cable1 = new THREE.Mesh(cableGeometry, cableMaterial);
        cable1.position.set(18, 0, 37.5);
        this.robotParts.links[0].add(cable1);

        // 상완 케이블 채널 (SO-101 특유의 깔끔한 디자인)
        const cableChannelGeometry = new THREE.BoxGeometry(6, 6, 150);
        const cableChannel = new THREE.Mesh(cableChannelGeometry, cableMaterial);
        cableChannel.position.set(22, 0, 85);
        this.robotParts.links[1].add(cableChannel);

        // 전완 케이블 가이드
        const forearmCableGeometry = new THREE.CylinderGeometry(3, 3, 90, 8);
        const forearmCable = new THREE.Mesh(forearmCableGeometry, cableMaterial);
        forearmCable.position.set(18, 0, 55);
        this.robotParts.links[2].add(forearmCable);

        // SO-101 손목 센서 패키지
        const sensorGeometry = new THREE.BoxGeometry(10, 6, 3);
        const sensorMaterial = new THREE.MeshPhongMaterial({
            color: 0x007bff,
            emissive: 0x001a33,
            emissiveIntensity: 0.2
        });

        const wristSensor1 = new THREE.Mesh(sensorGeometry, sensorMaterial);
        wristSensor1.position.set(12, 0, 0);
        this.robotParts.joints[4].add(wristSensor1);

        const wristSensor2 = new THREE.Mesh(sensorGeometry, sensorMaterial);
        wristSensor2.position.set(-12, 0, 0);
        this.robotParts.joints[4].add(wristSensor2);

        // SO-101 그리퍼 터치 센서
        const touchSensorGeometry = new THREE.BoxGeometry(4, 12, 2);
        const touchSensorMaterial = new THREE.MeshPhongMaterial({
            color: 0x17a2b8,
            emissive: 0x0a4d57,
            emissiveIntensity: 0.3
        });

        const leftTouchSensor = new THREE.Mesh(touchSensorGeometry, touchSensorMaterial);
        leftTouchSensor.position.set(3, 0, 17);
        this.robotParts.gripper.getObjectByName('leftFinger').add(leftTouchSensor);

        const rightTouchSensor = new THREE.Mesh(touchSensorGeometry, touchSensorMaterial);
        rightTouchSensor.position.set(-3, 0, 17);
        this.robotParts.gripper.getObjectByName('rightFinger').add(rightTouchSensor);

        // SO-101 상태 LED 인디케이터
        const ledGeometry = new THREE.CylinderGeometry(1.5, 1.5, 2, 8);
        const ledColors = [
            { color: 0x28a745, emissive: 0x0f4f23 }, // Green - Ready
            { color: 0x007bff, emissive: 0x003d7a }, // Blue - Active
            { color: 0xffc107, emissive: 0x664d03 }  // Yellow - Warning
        ];

        for (let i = 0; i < 3; i++) {
            const ledMaterial = new THREE.MeshPhongMaterial({
                color: ledColors[i].color,
                emissive: ledColors[i].emissive,
                emissiveIntensity: 0.4
            });
            const led = new THREE.Mesh(ledGeometry, ledMaterial);
            led.position.set((i - 1) * 6, 25, 40);
            this.robotParts.base.add(led);
        }

        // SO-101 조인트 마커 시스템
        this.addSO101JointMarkers();
    }

    addSO101JointMarkers() {
        const markerMaterial = new THREE.MeshPhongMaterial({
            color: 0x007bff,
            emissive: 0x001a33,
            emissiveIntensity: 0.3
        });

        // SO-101 스타일의 모던한 조인트 마커
        for (let i = 0; i < 6; i++) {
            if (this.robotParts.joints[i]) {
                // 조인트 번호 표시
                const createJointLabel = (jointNum) => {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = 64;
                    canvas.height = 64;

                    context.fillStyle = '#007bff';
                    context.fillRect(0, 0, 64, 64);
                    context.fillStyle = '#ffffff';
                    context.font = 'bold 32px Arial';
                    context.textAlign = 'center';
                    context.fillText(`J${jointNum + 1}`, 32, 42);

                    const texture = new THREE.CanvasTexture(canvas);
                    const material = new THREE.SpriteMaterial({ map: texture });
                    const sprite = new THREE.Sprite(material);
                    return sprite;
                };

                const jointLabel = createJointLabel(i);
                jointLabel.scale.set(15, 15, 1);

                // 조인트별로 다른 위치에 라벨 배치
                if (i === 0) {
                    jointLabel.position.set(0, 30, 25);
                } else if (i === 1) {
                    jointLabel.position.set(0, 25, 0);
                } else if (i === 2) {
                    jointLabel.position.set(0, 20, 0);
                } else {
                    jointLabel.position.set(0, 15, 15);
                }

                this.robotParts.joints[i].add(jointLabel);

                // SO-101 스타일 방향 마커
                const markerGeometry = new THREE.RingGeometry(6, 9, 12);
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);

                if (i === 0) {
                    marker.position.set(0, 0, 22);
                    marker.rotation.x = Math.PI / 2;
                } else if (i === 1 || i === 2) {
                    marker.position.set(0, 18, 0);
                    marker.rotation.z = Math.PI / 2;
                } else {
                    marker.position.set(0, 0, 12);
                    marker.rotation.x = Math.PI / 2;
                }

                this.robotParts.joints[i].add(marker);
            }
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
        // 조인트 각도 제한 (실제 로봇팔의 물리적 제한 반영)
        const jointLimits = [
            [-180, 180],  // Joint 1: Base rotation
            [-90, 90],    // Joint 2: Shoulder
            [-180, 180],  // Joint 3: Elbow
            [-180, 180],  // Joint 4: Wrist 1
            [-90, 90],    // Joint 5: Wrist 2
            [-180, 180]   // Joint 6: Wrist 3
        ];

        // 각도 제한 적용
        const limitedJoints = joints.map((angle, index) => {
            const [min, max] = jointLimits[index];
            return Math.max(min, Math.min(max, angle));
        });

        if (this.robotParts.joints[0]) {
            // Joint 1: Base rotation around Z-axis
            this.robotParts.joints[0].rotation.z = limitedJoints[0] * Math.PI / 180;
        }
        if (this.robotParts.joints[1]) {
            // Joint 2: Shoulder rotation around Y-axis
            this.robotParts.joints[1].rotation.y = limitedJoints[1] * Math.PI / 180;
        }
        if (this.robotParts.joints[2]) {
            // Joint 3: Elbow rotation around Y-axis
            this.robotParts.joints[2].rotation.y = limitedJoints[2] * Math.PI / 180;
        }
        if (this.robotParts.joints[3]) {
            // Joint 4: Wrist 1 rotation around Z-axis
            this.robotParts.joints[3].rotation.z = limitedJoints[3] * Math.PI / 180;
        }
        if (this.robotParts.joints[4]) {
            // Joint 5: Wrist 2 rotation around Y-axis
            this.robotParts.joints[4].rotation.y = limitedJoints[4] * Math.PI / 180;
        }
        if (this.robotParts.joints[5]) {
            // Joint 6: Wrist 3 rotation around Z-axis
            this.robotParts.joints[5].rotation.z = limitedJoints[5] * Math.PI / 180;
        }

        // Update gripper with more realistic movement
        if (this.robotParts.gripper) {
            const leftFinger = this.robotParts.gripper.getObjectByName('leftFinger');
            const rightFinger = this.robotParts.gripper.getObjectByName('rightFinger');

            if (leftFinger && rightFinger) {
                const maxDistance = 20; // Max distance from center
                const minDistance = 2;  // Min distance (can't close completely)
                const range = maxDistance - minDistance;

                // 그리퍼 위치를 0-100%에서 실제 거리로 변환
                const currentDistance = minDistance + range * (1 - gripperPosition / 100);

                leftFinger.position.x = -currentDistance;
                rightFinger.position.x = currentDistance;

                // 그리퍼 움직임에 따른 시각적 피드백
                const gripperColor = gripperPosition > 80 ? 0x2ecc71 :
                                   gripperPosition > 50 ? 0xf39c12 : 0xe74c3c;

                leftFinger.material.color.setHex(gripperColor);
                rightFinger.material.color.setHex(gripperColor);
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

        // 실제 로봇팔의 속도 제한을 반영한 동적 지속시간 계산
        const maxAngleDiff = Math.max(...targetJoints.map((target, index) =>
            Math.abs(target - currentJoints[index])
        ));

        // 큰 각도 변화일수록 더 오래 걸림 (실제 로봇의 속도 제한)
        const baseDuration = 300;
        const duration = Math.max(baseDuration, maxAngleDiff * 5); // 1도당 5ms

        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 더 현실적인 easing 함수 (실제 로봇 모터의 가속/감속 특성)
            const easeProgress = progress < 0.5
                ? 2 * progress * progress // ease-in
                : 1 - 2 * (1 - progress) * (1 - progress); // ease-out

            // 조인트별로 다른 속도 적용 (실제 로봇의 조인트별 속도 차이)
            const jointSpeeds = [1.0, 0.8, 0.9, 1.2, 1.1, 1.3]; // 조인트별 상대 속도

            const interpolatedJoints = currentJoints.map((start, index) => {
                const target = targetJoints[index];
                const adjustedProgress = Math.min(easeProgress * jointSpeeds[index], 1);
                return start + (target - start) * adjustedProgress;
            });

            // 그리퍼는 다른 조인트보다 빠르게 움직임
            const gripperProgress = Math.min(easeProgress * 1.5, 1);
            const interpolatedGripper = currentGripperPos + (targetGripperPosition - currentGripperPos) * gripperProgress;

            // Apply interpolated values
            this.setRobotPose(interpolatedJoints, interpolatedGripper);

            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.animationId = null;
                // 최종 위치 정확히 설정
                this.setRobotPose(targetJoints, targetGripperPosition);
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