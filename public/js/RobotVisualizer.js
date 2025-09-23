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
    }

    createBase() {
        // 원통형 베이스 - XY 평면에 눕혀진 형태
        const baseGeometry = new THREE.CylinderGeometry(40, 50, 20, 16);
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

        // J1에 연결된 링크 (X축 방향으로 뻗어나감, XY 평면에서 회전)
        const linkGeometry = new THREE.BoxGeometry(80, 10, 10);
        const linkMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4444
        });

        const link = new THREE.Mesh(linkGeometry, linkMaterial);
        link.position.set(40, 0, 0); // X축 방향으로 40만큼
        link.castShadow = true;
        this.j1.add(link);

        // 링크 끝점 마커
        const markerGeometry = new THREE.SphereGeometry(5, 8, 6);
        const markerMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00
        });

        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(40, 0, 0); // 링크 끝
        this.j1.add(marker);
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

            // 끝점 위치 계산 함수 사용
            const endPoint = this.getEndEffectorPosition();

            positionDiv.innerHTML = `
                <div><strong>좌표계 정보</strong></div>
                <div>바닥면: XY 평면 (빨강=X, 초록=Y)</div>
                <div>위쪽: Z축 (파랑)</div>
                <div>J1 각도: ${j1Angle}°</div>
                <div>J1 회전: XY 평면에서 Z축 중심</div>
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

    // 끝점 위치 계산
    getEndEffectorPosition() {
        if (!this.j1) return { x: 0, y: 0, z: 0 };

        const angle = this.j1.rotation.y; // Y축 중심 회전 (XY 평면에서)
        const linkLength = 80;
        const baseHeight = 35;

        return {
            x: linkLength * Math.cos(angle),
            y: linkLength * Math.sin(angle),
            z: baseHeight
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