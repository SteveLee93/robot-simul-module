/**
 * Robot Visualizer - 좌표계부터 새로 구성
 * X, Y가 바닥면, Z가 위쪽을 향하는 표준 좌표계
 */
export class RobotVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.robot = null;

        // 로봇 파트들
        this.base = null;
        this.j1 = null;
        this.j2 = null;
        this.j2Joint = null;
        this.j3Joint = null;
        this.j4Joint = null;
        this.j5Joint = null;
        this.j6Joint = null;

        this.init();
    }

    init() {
        this.setupScene();
        this.setupLighting();
        this.setupCoordinateSystem();
        this.setupRobot();
        this.setupUI();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupScene() {
        // 씬
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);

        // 카메라 - Z축 위에서 XY 평면을 내려다보는 시점
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(300, 300, 200);
        this.camera.lookAt(0, 0, 0);

        // 카메라를 Z축이 위쪽이 되도록 회전
        this.camera.up.set(0, 0, 1);

        // 렌더러
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // 컨트롤
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 0, 0);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.maxDistance = 800;
        this.controls.minDistance = 100;
    }

    setupLighting() {
        // 주변광
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // 방향광
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);
    }

    setupCoordinateSystem() {
        // XY 평면 그리드 (Z=0)
        const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
        gridHelper.rotateX(Math.PI / 2); // XY 평면으로 회전
        this.scene.add(gridHelper);

        // 좌표축 (빨강=X, 초록=Y, 파랑=Z)
        const axesHelper = new THREE.AxesHelper(100);
        this.scene.add(axesHelper);

        // 좌표축 라벨
        this.addCoordinateLabels();
    }

    addCoordinateLabels() {
        const createLabel = (text, position, color) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 32;

            context.fillStyle = color;
            context.font = 'bold 20px Arial';
            context.textAlign = 'center';
            context.fillText(text, 32, 22);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.position.copy(position);
            sprite.scale.set(20, 10, 1);

            return sprite;
        };

        // X, Y, Z 축 라벨
        this.scene.add(createLabel('X', new THREE.Vector3(110, 0, 0), '#ff4444'));
        this.scene.add(createLabel('Y', new THREE.Vector3(0, 110, 0), '#44ff44'));
        this.scene.add(createLabel('Z', new THREE.Vector3(0, 0, 110), '#4444ff'));
    }

    setupRobot() {
        this.robot = new THREE.Group();
        this.scene.add(this.robot);

        // 베이스 생성
        this.createBase();

        // J1 조인트 생성
        this.createJ1();

        // J2 조인트 생성
        this.createJ2();

        // J3 조인트 생성
        this.createJ3();

        // J4 조인트 생성
        this.createJ4();

        // J5 조인트 생성
        this.createJ5();

        // J6 조인트 생성
        this.createJ6();
    }

    createBase() {
        // 원통형 베이스 - XY 평면에 눕혀진 형태
        const baseGeometry = new THREE.CylinderGeometry(25, 40, 20, 16);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666
        });

        this.base = new THREE.Mesh(baseGeometry, baseMaterial);
        // XY 평면에 누워있도록 X축으로 90도 회전
        this.base.rotateX(Math.PI / 2);
        // XY 평면 위에 배치 (Z=10)
        this.base.position.z = 10;
        this.base.castShadow = true;
        this.robot.add(this.base);
    }

    createJ1() {
        // J1 조인트 - XY 평면에 눕혀진 형태, Z축을 중심으로 회전
        const j1Geometry = new THREE.CylinderGeometry(25, 25, 30, 16);
        const j1Material = new THREE.MeshPhongMaterial({
            color: 0x4444ff
        });

        this.j1 = new THREE.Mesh(j1Geometry, j1Material);
        // XY 평면에 누워있도록 X축으로 90도 회전
        this.j1.rotateX(Math.PI / 2);
        // 베이스 위에 배치 (Z=35)
        this.j1.position.z = 35;
        this.j1.castShadow = true;
        this.robot.add(this.j1);

        // J1에 연결된 ㄱ자 구조
        // 수직 부분 (위로 올라가는 원기둥)
        const verticalGeometry = new THREE.CylinderGeometry(25, 25, 50, 16);
        const verticalMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4444
        });

        const verticalPart = new THREE.Mesh(verticalGeometry, verticalMaterial);
        verticalPart.position.set(0, 40, 0); // 위로 15만큼
        verticalPart.castShadow = true;
        this.j1.add(verticalPart);

        // 수평 부분 (가로로 뻗어나가는 원기둥)
        const horizontalGeometry = new THREE.CylinderGeometry(20, 20, 40, 16);
        const horizontalMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4444
        });

        const horizontalPart = new THREE.Mesh(horizontalGeometry, horizontalMaterial);
        horizontalPart.position.set(0, 40, 10); // ㄱ자 끝에서 Z축 방향으로 20만큼
        horizontalPart.rotateX(Math.PI / 2); // Z축 방향으로 눕히기
        horizontalPart.castShadow = true;
        this.j1.add(horizontalPart);
    }

    createJ2() {
        // J2 조인트 그룹 생성 - J1 ㄱ자 구조 끝에 배치
        this.j2 = new THREE.Group();
        this.j2.position.set(0, 40, 30); // J1 ㄱ자 끝 위치
        this.j1.add(this.j2); // J1에 연결하여 함께 회전

        // ㄱ자 구조의 수직 부분 (위로 올라가는 원기둥)
        const verticalGeometry = new THREE.CylinderGeometry(20, 20, 40, 16);
        const verticalMaterial = new THREE.MeshPhongMaterial({
            color: 0x4444ff // J1과 같은 파란색
        });

        const verticalPart = new THREE.Mesh(verticalGeometry, verticalMaterial);
        verticalPart.position.set(0, 0, 20); // Z축 위로 15만큼
        verticalPart.rotateX(Math.PI / 2); // Z축 방향으로 눕히기
        verticalPart.castShadow = true;
        this.j2.add(verticalPart);

        // J2 회전 조인트 그룹 생성 (J2 구조 끝에 위치)
        this.j2Joint = new THREE.Group();
        this.j2Joint.position.set(0, 0, 20); // J2 구조 끝에 배치
        this.j2.add(this.j2Joint);

        // 회전하는 조인트 원기둥
        const j2JointGeometry = new THREE.CylinderGeometry(15, 15, 150, 16);
        const j2JointMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4444 // 빨간색
        });

        const j2JointCylinder = new THREE.Mesh(j2JointGeometry, j2JointMaterial);
        j2JointCylinder.position.set(0, 80, 0); // 회전 중심에서 Y축으로 30만큼
        j2JointCylinder.castShadow = true;
        this.j2Joint.add(j2JointCylinder);

        const j2LinkCylinder = new THREE.Mesh(
            new THREE.CylinderGeometry(15, 15, 20, 16),
            new THREE.MeshPhongMaterial({ color: 0xff4444 }) // 빨간색
        );
        j2LinkCylinder.position.set(0, 140, -15);
        j2LinkCylinder.rotateX(Math.PI / 2); // Y축 방향으로 뻗어나감
        j2LinkCylinder.castShadow = true;

        this.j2Joint.add(j2LinkCylinder);
    }

    createJ3() {
        // J3 구조 그룹 생성 (J2 링크 끝에서 시작)
        const j3Structure = new THREE.Group();
        j3Structure.position.set(0, 140, -40); // J2 링크 끝에 배치
        this.j2Joint.add(j3Structure);

        // J3 고정 부분 (구조체)
        const j3FixedGeometry = new THREE.CylinderGeometry(15, 15, 30, 16);
        const j3FixedMaterial = new THREE.MeshPhongMaterial({
            color: 0x4444ff // 파란색
        });

        const j3Fixed = new THREE.Mesh(j3FixedGeometry, j3FixedMaterial);
        j3Fixed.position.set(0, 0, 0);
        j3Fixed.rotateX(Math.PI / 2); // Y축 방향으로 배치
        j3Fixed.castShadow = true;
        j3Structure.add(j3Fixed);

        // J3 회전 조인트 그룹 생성 (J3 구조 끝에 위치)
        this.j3Joint = new THREE.Group();
        this.j3Joint.position.set(0, 0, 0); // J3 구조 중심에 배치
        j3Structure.add(this.j3Joint);

        // J3에 연결된 링크 (Y축 방향으로 뻗어나감)
        const j3LinkGeometry = new THREE.CylinderGeometry(10, 10, 30, 16);
        const j3LinkMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4444 // 빨간색
        });

        const j3Link = new THREE.Mesh(j3LinkGeometry, j3LinkMaterial);
        j3Link.position.set(0, 20, 0); // Y축으로 30만큼
        j3Link.castShadow = true;
        this.j3Joint.add(j3Link);
    }

    createJ4() {
        // J4 조인트 그룹 생성 (J3 링크 끝에서 시작)
        this.j4Joint = new THREE.Group();
        this.j4Joint.position.set(0, 45, 0); // J3 링크 끝에 배치
        this.j3Joint.add(this.j4Joint); // J3에 연결하여 함께 회전

        // J4 회전 조인트 (J1처럼 XY 평면에서 회전)
        const j4JointGeometry = new THREE.CylinderGeometry(10, 10, 20, 16);
        const j4JointMaterial = new THREE.MeshPhongMaterial({
            color: 0x4444ff // 파란색
        });

        const j4JointCylinder = new THREE.Mesh(j4JointGeometry, j4JointMaterial);
        j4JointCylinder.position.set(0, 0, 0); // J4 회전 중심
        j4JointCylinder.castShadow = true;
        this.j4Joint.add(j4JointCylinder);

        // J4에 연결된 링크 (Z축 방향으로 뻗어나감)
        const j4LinkGeometry = new THREE.CylinderGeometry(8, 8, 15, 16);
        const j4LinkMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4444 // 빨간색
        });

        const j4Link = new THREE.Mesh(j4LinkGeometry, j4LinkMaterial);
        j4Link.position.set(0, 0, 10); // Z축으로 20만큼
        j4Link.rotateX(Math.PI / 2); // Z축 방향으로 배치
        j4Link.castShadow = true;
        this.j4Joint.add(j4Link); 
    }

    createJ5() {
        // J5 조인트 그룹 생성 (J4 링크 끝에서 시작)
        this.j5Joint = new THREE.Group();
        this.j5Joint.position.set(0, 0, 25); // J4 링크 끝에 배치
        this.j4Joint.add(this.j5Joint); // J4에 연결하여 함께 회전

        // J5 회전 조인트 (J2와 같은 방향, Z축 중심 회전)
        const j5JointGeometry = new THREE.CylinderGeometry(8, 8, 15, 16);
        const j5JointMaterial = new THREE.MeshPhongMaterial({
            color: 0x4444ff // 파란색
        });

        const j5JointCylinder = new THREE.Mesh(j5JointGeometry, j5JointMaterial);
        j5JointCylinder.position.set(0, 0, 0); // J5 회전 중심
        j5JointCylinder.rotateX(Math.PI / 2); // Z축 방향으로 배치
        j5JointCylinder.castShadow = true;
        this.j5Joint.add(j5JointCylinder);

        // J5에 연결된 링크 (Y축 방향으로 뻗어나감)
        const j5LinkGeometry = new THREE.CylinderGeometry(6, 6, 25, 16);
        const j5LinkMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4444 // 빨간색
        });

        const j5Link = new THREE.Mesh(j5LinkGeometry, j5LinkMaterial);
        j5Link.position.set(0, 15, 0); // Y축으로 15만큼
        j5Link.castShadow = true;
        this.j5Joint.add(j5Link);

        // J5 링크 끝점 마커
        const j5MarkerGeometry = new THREE.SphereGeometry(2, 8, 6);
        const j5MarkerMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00 // 노란색
        });

        const j5Marker = new THREE.Mesh(j5MarkerGeometry, j5MarkerMaterial);
        j5Marker.position.set(0, 30, 0); // J5 링크 끝
        this.j5Joint.add(j5Marker);
    }

    createJ6() {
        // J6 조인트 그룹 생성 (J5 링크 끝에서 시작)
        this.j6Joint = new THREE.Group();
        this.j6Joint.position.set(0, 30, 0); // J5 링크 끝에 배치
        this.j5Joint.add(this.j6Joint); // J5에 연결하여 함께 회전

        // J6 회전 조인트 (J1과 같은 방향, Y축 중심 회전)
        const j6JointGeometry = new THREE.CylinderGeometry(6, 6, 10, 16);
        const j6JointMaterial = new THREE.MeshPhongMaterial({
            color: 0xff00ff // 자주색
        });

        const j6JointCylinder = new THREE.Mesh(j6JointGeometry, j6JointMaterial);
        j6JointCylinder.position.set(0, 0, 0); // J6 회전 중심
        j6JointCylinder.castShadow = true;
        this.j6Joint.add(j6JointCylinder);

        // J6에 연결된 엔드 이펙터 (간단한 그리퍼 모양)
        const gripperBaseGeometry = new THREE.CylinderGeometry(4, 4, 8, 16);
        const gripperBaseMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888 // 회색
        });

        const gripperBase = new THREE.Mesh(gripperBaseGeometry, gripperBaseMaterial);
        gripperBase.position.set(0, 6, 0); // Y축으로 6만큼
        gripperBase.castShadow = true;
        this.j6Joint.add(gripperBase);

        // 그리퍼 핑거들
        const fingerGeometry = new THREE.BoxGeometry(2, 8, 1);
        const fingerMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff // 흰색
        });

        const leftFinger = new THREE.Mesh(fingerGeometry, fingerMaterial);
        leftFinger.position.set(-3, 10, 0);
        leftFinger.castShadow = true;
        this.j6Joint.add(leftFinger);

        const rightFinger = new THREE.Mesh(fingerGeometry, fingerMaterial);
        rightFinger.position.set(3, 10, 0);
        rightFinger.castShadow = true;
        this.j6Joint.add(rightFinger);

        // J6 끝점 마커 (엔드 이펙터 끝)
        const j6MarkerGeometry = new THREE.SphereGeometry(1.5, 8, 6);
        const j6MarkerMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00 // 밝은 초록색
        });

        const j6Marker = new THREE.Mesh(j6MarkerGeometry, j6MarkerMaterial);
        j6Marker.position.set(0, 15, 0); // 그리퍼 끝
        this.j6Joint.add(j6Marker);
    }

    setupUI() {
        // 실시간 좌표 표시
        const positionDiv = document.createElement('div');
        positionDiv.id = 'position-display';
        positionDiv.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 14px;
            z-index: 1000;
        `;
        this.container.appendChild(positionDiv);

        this.updatePositionDisplay();
    }

    updatePositionDisplay() {
        const positionDiv = document.getElementById('position-display');
        if (positionDiv && this.j1) {
            // J1 조인트의 현재 회전각 (Y축 중심, XY 평면에서 회전)
            const j1Angle = (this.j1.rotation.y * 180 / Math.PI).toFixed(1);

            // J2 조인트의 현재 회전각 (Z축 중심 회전)
            const j2Angle = this.j2Joint ? (this.j2Joint.rotation.z * 180 / Math.PI).toFixed(1) : '0.0';

            // J3 조인트의 현재 회전각 (Z축 중심 회전)
            const j3Angle = this.j3Joint ? (this.j3Joint.rotation.z * 180 / Math.PI).toFixed(1) : '0.0';

            // J4 조인트의 현재 회전각 (Y축 중심 회전)
            const j4Angle = this.j4Joint ? (this.j4Joint.rotation.y * 180 / Math.PI).toFixed(1) : '0.0';

            // J5 조인트의 현재 회전각 (Z축 중심 회전)
            const j5Angle = this.j5Joint ? (this.j5Joint.rotation.z * 180 / Math.PI).toFixed(1) : '0.0';

            // J6 조인트의 현재 회전각 (Y축 중심 회전)
            const j6Angle = this.j6Joint ? (this.j6Joint.rotation.y * 180 / Math.PI).toFixed(1) : '0.0';

            // 끝점 위치 계산 함수 사용
            const endPoint = this.getEndEffectorPosition();

            positionDiv.innerHTML = `
                <div><strong>좌표계 정보</strong></div>
                <div>바닥면: XY 평면 (빨강=X, 초록=Y)</div>
                <div>위쪽: Z축 (파랑)</div>
                <div>J1 각도: ${j1Angle}°</div>
                <div>J1 회전: XY 평면에서 Z축 중심</div>
                <div>J2 각도: ${j2Angle}°</div>
                <div>J2 회전: Z축 중심</div>
                <div>J3 각도: ${j3Angle}°</div>
                <div>J3 회전: Z축 중심</div>
                <div>J4 각도: ${j4Angle}°</div>
                <div>J4 회전: Y축 중심</div>
                <div>J5 각도: ${j5Angle}°</div>
                <div>J5 회전: Z축 중심 (J2와 같은 방향)</div>
                <div>J6 각도: ${j6Angle}°</div>
                <div>J6 회전: Y축 중심 (J1과 같은 방향)</div>
                <div>끝점 위치:</div>
                <div>&nbsp;&nbsp;X: ${endPoint.x.toFixed(1)}</div>
                <div>&nbsp;&nbsp;Y: ${endPoint.y.toFixed(1)}</div>
                <div>&nbsp;&nbsp;Z: ${endPoint.z.toFixed(1)}</div>
            `;
        }
    }

    // J1 회전 함수 (XY 평면에서 회전, Z축 중심)
    rotateJ1(angle) {
        if (this.j1) {
            // J1이 XY 평면에 눕혀져 있으므로 Y축을 중심으로 회전해야 함
            this.j1.rotation.y = angle * Math.PI / 180;
            this.updatePositionDisplay();
        }
    }

    // 애니메이션으로 J1 회전
    animateJ1To(targetAngle, duration = 1000) {
        if (!this.j1) return;

        const startAngle = this.j1.rotation.y * 180 / Math.PI;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 부드러운 이징
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - 2 * (1 - progress) * (1 - progress);

            const currentAngle = startAngle + (targetAngle - startAngle) * easeProgress;
            this.rotateJ1(currentAngle);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // J2 회전 함수 (Z축을 중심으로 회전)
    rotateJ2(angle) {
        if (this.j2Joint) {
            // J2는 Z축을 중심으로 회전
            this.j2Joint.rotation.z = angle * Math.PI / 180;
            this.updatePositionDisplay();
        }
    }

    // 애니메이션으로 J2 회전
    animateJ2To(targetAngle, duration = 1000) {
        if (!this.j2Joint) return;

        const startAngle = this.j2Joint.rotation.z * 180 / Math.PI;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 부드러운 이징
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - 2 * (1 - progress) * (1 - progress);

            const currentAngle = startAngle + (targetAngle - startAngle) * easeProgress;
            this.rotateJ2(currentAngle);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // J3 회전 함수 (Z축을 중심으로 회전)
    rotateJ3(angle) {
        if (this.j3Joint) {
            // J3는 Z축을 중심으로 회전
            this.j3Joint.rotation.z = angle * Math.PI / 180;
            this.updatePositionDisplay();
        }
    }

    // 애니메이션으로 J3 회전
    animateJ3To(targetAngle, duration = 1000) {
        if (!this.j3Joint) return;

        const startAngle = this.j3Joint.rotation.z * 180 / Math.PI;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 부드러운 이징
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - 2 * (1 - progress) * (1 - progress);

            const currentAngle = startAngle + (targetAngle - startAngle) * easeProgress;
            this.rotateJ3(currentAngle);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // J4 회전 함수 (Y축을 중심으로 회전)
    rotateJ4(angle) {
        if (this.j4Joint) {
            // J4는 Y축을 중심으로 회전
            this.j4Joint.rotation.y = angle * Math.PI / 180;
            this.updatePositionDisplay();
        }
    }

    // 애니메이션으로 J4 회전
    animateJ4To(targetAngle, duration = 1000) {
        if (!this.j4Joint) return;

        const startAngle = this.j4Joint.rotation.y * 180 / Math.PI;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 부드러운 이징
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - 2 * (1 - progress) * (1 - progress);

            const currentAngle = startAngle + (targetAngle - startAngle) * easeProgress;
            this.rotateJ4(currentAngle);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // J5 회전 함수 (Z축을 중심으로 회전, J2와 같은 방향)
    rotateJ5(angle) {
        if (this.j5Joint) {
            // J5는 Z축을 중심으로 회전 (J2와 같은 방향)
            this.j5Joint.rotation.z = angle * Math.PI / 180;
            this.updatePositionDisplay();
        }
    }

    // 애니메이션으로 J5 회전
    animateJ5To(targetAngle, duration = 1000) {
        if (!this.j5Joint) return;

        const startAngle = this.j5Joint.rotation.z * 180 / Math.PI;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 부드러운 이징
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - 2 * (1 - progress) * (1 - progress);

            const currentAngle = startAngle + (targetAngle - startAngle) * easeProgress;
            this.rotateJ5(currentAngle);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // J6 회전 함수 (Y축을 중심으로 회전, J1과 같은 방향)
    rotateJ6(angle) {
        if (this.j6Joint) {
            // J6는 Y축을 중심으로 회전 (J1과 같은 방향)
            this.j6Joint.rotation.y = angle * Math.PI / 180;
            this.updatePositionDisplay();
        }
    }

    // 애니메이션으로 J6 회전
    animateJ6To(targetAngle, duration = 1000) {
        if (!this.j6Joint) return;

        const startAngle = this.j6Joint.rotation.y * 180 / Math.PI;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 부드러운 이징
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - 2 * (1 - progress) * (1 - progress);

            const currentAngle = startAngle + (targetAngle - startAngle) * easeProgress;
            this.rotateJ6(currentAngle);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // 끝점 위치 계산 (J1과 J2를 고려)
    getEndEffectorPosition() {
        if (!this.j1) return { x: 0, y: 0, z: 0 };

        const j1Angle = this.j1.rotation.y; // Y축 중심 회전 (XY 평면에서)
        const j2Angle = this.j2Joint ? this.j2Joint.rotation.x : 0; // X축 중심 회전 (피치)

        // J1 링크 길이와 높이
        const j1LinkLength = 80; // 이제 Z축 방향
        const j1BaseHeight = 35;

        // J2 구조 치수
        const j2VerticalOffset = 30; // ㄱ자 수직 부분 높이
        const j2HorizontalOffset = 40; // ㄱ자 수평 부분 길이
        const j2UpperLinkLength = 50; // 상단 링크 길이

        // J1 링크 끝점 위치 (J2 시작점) - J1이 Z축 위쪽으로 뻗어나감
        const j1EndX = 0; // J1은 이제 수직
        const j1EndY = 0;
        const j1EndZ = j1BaseHeight + j1LinkLength;

        // J2 회전 조인트 위치 (ㄱ자 끝)
        const j2JointX = j2HorizontalOffset * Math.cos(j1Angle);
        const j2JointY = j2HorizontalOffset * Math.sin(j1Angle);
        const j2JointZ = j1EndZ + j2VerticalOffset;

        // J2 상단 링크 끝점 계산 (피치 회전 고려)
        const upperLinkEndZ = j2UpperLinkLength * Math.cos(j2Angle);
        const upperLinkEndHorizontal = j2UpperLinkLength * Math.sin(j2Angle);

        return {
            x: j2JointX + upperLinkEndHorizontal * Math.cos(j1Angle),
            y: j2JointY + upperLinkEndHorizontal * Math.sin(j1Angle),
            z: j2JointZ + upperLinkEndZ
        };
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
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.controls) {
            this.controls.dispose();
        }
        window.removeEventListener('resize', this.onWindowResize);
    }
}