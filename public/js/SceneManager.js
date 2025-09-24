/**
 * SceneManager - Three.js 씬, 카메라, 렌더러 관리
 * 3D 환경 설정과 좌표계 관리를 담당
 */
export class SceneManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        this.init();
    }

    init() {
        this.setupScene();
        this.setupLighting();
        this.setupCoordinateSystem();
        this.setupEventListeners();
    }

    setupScene() {
        // 씬 생성
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
        this.camera.up.set(0, 0, 1); // Z축이 위쪽

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

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // 씬에 객체 추가
    addToScene(object) {
        this.scene.add(object);
    }

    // 씬에서 객체 제거
    removeFromScene(object) {
        this.scene.remove(object);
    }

    // 애니메이션 루프에서 호출
    update() {
        this.controls.update();
    }

    // 렌더링
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    // 리소스 정리
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.controls) {
            this.controls.dispose();
        }
        window.removeEventListener('resize', this.onWindowResize);
    }

    // Getters
    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }

    getControls() {
        return this.controls;
    }
}