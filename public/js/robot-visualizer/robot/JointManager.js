/**
 * JointManager - 로봇 조인트 생성 및 관리
 * 설정 기반으로 로봇 구조를 생성하고 조인트 제어를 담당
 */
import { MATERIALS, ANIMATION_CONFIG } from './RobotConfig.js';
import { JointFactory } from './Joint.js';

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

        // 조인트 인스턴스 생성 및 저장 (팩토리 패턴 사용)
        const joint = JointFactory.createJoint(name, jointConfig, jointGroup);
        this.joints.set(name, joint);
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
        } else {
            console.warn(`Joint '${jointName}' not found`);
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
        } else {
            console.warn(`Joint '${jointName}' not found`);
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
            if (joint.config.type !== 'fixed') { // 고정 조인트는 제외
                angles[name] = joint.getAngle();
            }
        });
        return angles;
    }

    /**
     * 조인트 정보 가져오기
     * @param {string} jointName - 조인트 이름
     * @returns {Object} 조인트 정보
     */
    getJointInfo(jointName) {
        const joint = this.joints.get(jointName);
        if (joint) {
            return {
                name: joint.getName(),
                type: joint.config.type,
                axis: joint.config.axis || null,
                range: joint.range,
                currentAngle: joint.getAngle()
            };
        }
        return null;
    }

    /**
     * 모든 조인트 정보 가져오기
     * @returns {Object} 조인트별 정보
     */
    getAllJointsInfo() {
        const info = {};
        this.joints.forEach((joint, name) => {
            info[name] = this.getJointInfo(name);
        });
        return info;
    }

    /**
     * 엔드 이펙터 위치 계산
     * @returns {Object} {x, y, z} 좌표
     */
    getEndEffectorPosition() {
        // J6 그룹에서 엔드 이펙터 마커 위치 계산
        const j6Group = this.jointMeshes.get('j6');
        if (!j6Group) {
            console.warn('J6 joint not found');
            return { x: 0, y: 0, z: 0 };
        }

        // 엔드 이펙터 상대 위치 (그리퍼 끝)
        const endEffectorLocalPos = new THREE.Vector3(0, 15, 0);

        // 월드 좌표계로 변환
        const endEffectorWorldPos = endEffectorLocalPos.clone();
        j6Group.localToWorld(endEffectorWorldPos);

        return {
            x: endEffectorWorldPos.x,
            y: endEffectorWorldPos.y,
            z: endEffectorWorldPos.z
        };
    }

    /**
     * 특정 조인트의 월드 위치 계산
     * @param {string} jointName - 조인트 이름
     * @returns {Object} {x, y, z} 좌표
     */
    getJointWorldPosition(jointName) {
        const jointGroup = this.jointMeshes.get(jointName);
        if (!jointGroup) {
            console.warn(`Joint '${jointName}' not found`);
            return { x: 0, y: 0, z: 0 };
        }

        const worldPos = new THREE.Vector3();
        jointGroup.getWorldPosition(worldPos);

        return {
            x: worldPos.x,
            y: worldPos.y,
            z: worldPos.z
        };
    }

    /**
     * 리소스 정리
     */
    dispose() {
        // 모든 조인트 정리
        this.joints.forEach(joint => {
            if (joint.dispose) {
                joint.dispose();
            }
        });

        this.joints.clear();
        this.jointMeshes.clear();

        if (this.robot) {
            // 모든 자식 객체 제거
            while (this.robot.children.length > 0) {
                this.robot.remove(this.robot.children[0]);
            }
        }
    }

    /**
     * 로봇 그룹 반환
     * @returns {THREE.Group}
     */
    getRobotGroup() {
        return this.robot;
    }

    /**
     * 조인트 메쉬 그룹 반환
     * @param {string} jointName - 조인트 이름
     * @returns {THREE.Group}
     */
    getJointMesh(jointName) {
        return this.jointMeshes.get(jointName);
    }
}