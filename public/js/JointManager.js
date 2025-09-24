/**
 * JointManager - 로봇 조인트 생성 및 관리
 * 설정 기반으로 로봇 구조를 생성하고 조인트 제어를 담당
 */
import { MATERIALS, ANIMATION_CONFIG } from './RobotConfig.js';

export class JointManager {
    constructor() {
        this.joints = new Map(); // 조인트 인스턴스 저장
        this.jointMeshes = new Map(); // Three.js 메쉬 저장
        this.robot = null; // 루트 그룹
    }

    /**
     * 설정 기반으로 로봇 생성
     * @param {Object} config - 로봇 설정 (RobotConfig에서 가져옴)
     * @param {THREE.Scene} scene - Three.js 씬
     */
    createRobot(config, scene) {
        this.robot = new THREE.Group();
        scene.add(this.robot);

        // 조인트 순서대로 생성 (계층 구조 유지)
        const jointOrder = ['base', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6'];

        jointOrder.forEach(jointName => {
            if (config.joints[jointName]) {
                this.createJoint(jointName, config.joints[jointName]);
            }
        });

        return this.robot;
    }

    /**
     * 개별 조인트 생성
     * @param {string} name - 조인트 이름
     * @param {Object} jointConfig - 조인트 설정
     */
    createJoint(name, jointConfig) {
        // 조인트 그룹 생성
        const jointGroup = new THREE.Group();

        // 부모에 연결
        if (jointConfig.parent && this.jointMeshes.has(jointConfig.parent)) {
            const parentGroup = this.jointMeshes.get(jointConfig.parent);
            parentGroup.add(jointGroup);

            // 부모 오프셋 적용
            if (jointConfig.parentOffset) {
                jointGroup.position.set(
                    jointConfig.parentOffset.x,
                    jointConfig.parentOffset.y,
                    jointConfig.parentOffset.z
                );
            }
        } else {
            this.robot.add(jointGroup);
        }

        // 메인 지오메트리 생성
        const mainMesh = this.createMeshFromGeometry(jointConfig.geometry, jointConfig.material);

        // 위치 및 회전 설정
        if (jointConfig.position) {
            mainMesh.position.set(
                jointConfig.position.x,
                jointConfig.position.y,
                jointConfig.position.z
            );
        }

        if (jointConfig.rotation) {
            mainMesh.rotation.set(
                jointConfig.rotation.x || 0,
                jointConfig.rotation.y || 0,
                jointConfig.rotation.z || 0
            );
        }

        if (jointConfig.castShadow) {
            mainMesh.castShadow = true;
        }

        jointGroup.add(mainMesh);

        // 자식 요소들 생성
        if (jointConfig.children) {
            jointConfig.children.forEach(child => {
                const childMesh = this.createMeshFromGeometry(child.geometry, child.material);

                childMesh.position.set(
                    child.position.x,
                    child.position.y,
                    child.position.z
                );

                if (child.rotation) {
                    childMesh.rotation.set(
                        child.rotation.x || 0,
                        child.rotation.y || 0,
                        child.rotation.z || 0
                    );
                }

                childMesh.castShadow = true;
                jointGroup.add(childMesh);
            });
        }

        // 조인트 인스턴스 생성 및 저장
        if (jointConfig.type === 'revolute') {
            const joint = new RevoluteJoint(name, jointConfig, jointGroup);
            this.joints.set(name, joint);
        }

        this.jointMeshes.set(name, jointGroup);
    }

    /**
     * 지오메트리에서 메쉬 생성
     * @param {Object} geomConfig - 지오메트리 설정
     * @param {string} materialName - 재료 이름
     * @returns {THREE.Mesh}
     */
    createMeshFromGeometry(geomConfig, materialName) {
        let geometry;

        switch (geomConfig.type) {
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(
                    geomConfig.radiusTop,
                    geomConfig.radiusBottom,
                    geomConfig.height,
                    geomConfig.segments || 16
                );
                break;

            case 'box':
                geometry = new THREE.BoxGeometry(
                    geomConfig.width,
                    geomConfig.height,
                    geomConfig.depth
                );
                break;

            case 'sphere':
                geometry = new THREE.SphereGeometry(
                    geomConfig.radius,
                    geomConfig.widthSegments || 16,
                    geomConfig.heightSegments || 12
                );
                break;

            default:
                console.warn(`Unknown geometry type: ${geomConfig.type}`);
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }

        const material = new THREE.MeshPhongMaterial({
            color: MATERIALS[materialName].color
        });

        return new THREE.Mesh(geometry, material);
    }

    /**
     * 조인트 회전
     * @param {string} jointName - 조인트 이름
     * @param {number} angle - 회전 각도 (도)
     */
    rotateJoint(jointName, angle) {
        const joint = this.joints.get(jointName);
        if (joint) {
            joint.rotate(angle);
        }
    }

    /**
     * 조인트 애니메이션 회전
     * @param {string} jointName - 조인트 이름
     * @param {number} targetAngle - 목표 각도 (도)
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    animateJointTo(jointName, targetAngle, duration = ANIMATION_CONFIG.defaultDuration) {
        const joint = this.joints.get(jointName);
        if (joint) {
            joint.animateTo(targetAngle, duration);
        }
    }

    /**
     * 조인트 현재 각도 가져오기
     * @param {string} jointName - 조인트 이름
     * @returns {number} 현재 각도 (도)
     */
    getJointAngle(jointName) {
        const joint = this.joints.get(jointName);
        return joint ? joint.getAngle() : 0;
    }

    /**
     * 모든 조인트 각도 가져오기
     * @returns {Object} 조인트별 각도
     */
    getAllJointAngles() {
        const angles = {};
        this.joints.forEach((joint, name) => {
            angles[name] = joint.getAngle();
        });
        return angles;
    }

    /**
     * 엔드 이펙터 위치 계산
     * @returns {Object} {x, y, z} 좌표
     */
    getEndEffectorPosition() {
        // 간단한 순기구학 계산 (나중에 Kinematics 모듈로 이동 예정)
        const j6Group = this.jointMeshes.get('j6');
        if (!j6Group) return { x: 0, y: 0, z: 0 };

        // 월드 좌표계에서의 엔드 이펙터 위치 계산
        const endEffectorPos = new THREE.Vector3(0, 15, 0); // 그리퍼 끝 상대 위치
        j6Group.localToWorld(endEffectorPos);

        return {
            x: endEffectorPos.x,
            y: endEffectorPos.y,
            z: endEffectorPos.z
        };
    }

    /**
     * 리소스 정리
     */
    dispose() {
        this.joints.clear();
        this.jointMeshes.clear();
        if (this.robot) {
            this.robot.clear();
        }
    }
}

/**
 * 회전 조인트 클래스
 */
class RevoluteJoint {
    constructor(name, config, meshGroup) {
        this.name = name;
        this.config = config;
        this.meshGroup = meshGroup;
        this.currentAngle = 0; // 현재 각도 (도)
        this.axis = config.axis; // 회전축 ('x', 'y', 'z')
        this.range = config.range || [-180, 180]; // 회전 범위
    }

    /**
     * 조인트 회전
     * @param {number} angle - 각도 (도)
     */
    rotate(angle) {
        // 범위 체크
        const clampedAngle = Math.max(this.range[0], Math.min(this.range[1], angle));
        this.currentAngle = clampedAngle;

        // 라디안으로 변환
        const radians = clampedAngle * Math.PI / 180;

        // 축에 따라 회전 적용
        switch (this.axis) {
            case 'x':
                this.meshGroup.rotation.x = radians;
                break;
            case 'y':
                this.meshGroup.rotation.y = radians;
                break;
            case 'z':
                this.meshGroup.rotation.z = radians;
                break;
        }
    }

    /**
     * 애니메이션으로 회전
     * @param {number} targetAngle - 목표 각도 (도)
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    animateTo(targetAngle, duration = 1000) {
        const startAngle = this.currentAngle;
        const startTime = Date.now();
        const easing = ANIMATION_CONFIG.easing.easeInOut;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easing(progress);

            const currentAngle = startAngle + (targetAngle - startAngle) * easeProgress;
            this.rotate(currentAngle);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * 현재 각도 반환
     * @returns {number} 각도 (도)
     */
    getAngle() {
        return this.currentAngle;
    }
}