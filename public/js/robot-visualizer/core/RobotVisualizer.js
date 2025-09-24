/**
 * RobotVisualizer - 리팩토링된 6DOF 로봇 시각화 클래스
 * 모듈화된 아키텍처를 사용하여 3D 로봇 팔을 시각화하고 제어
 */
import { SceneManager } from './SceneManager.js';
import { JointManager } from '../robot/JointManager.js';
import { UIManager } from '../ui/UIManager.js';
import { Kinematics } from '../utils/Kinematics.js';
import { ROBOT_6DOF_CONFIG } from '../robot/RobotConfig.js';

export class RobotVisualizer {
    constructor(containerId) {
        this.containerId = containerId;

        // 모듈 인스턴스들
        this.sceneManager = null;
        this.jointManager = null;
        this.uiManager = null;
        this.kinematics = null;

        // 상태 관리
        this.isInitialized = false;
        this.animationId = null;

        this.init();
    }

    /**
     * 초기화
     */
    init() {
        try {
            // 씬 매니저 초기화
            this.sceneManager = new SceneManager(this.containerId);

            // 조인트 매니저 초기화 및 로봇 생성
            this.jointManager = new JointManager();
            this.jointManager.createRobot(ROBOT_6DOF_CONFIG, this.sceneManager.getScene());

            // UI 매니저 초기화
            this.uiManager = new UIManager(this.containerId);

            // 운동학 모듈 초기화
            this.kinematics = new Kinematics(ROBOT_6DOF_CONFIG);

            // 애니메이션 시작
            this.animate();

            // 초기 위치 표시 업데이트
            this.updateDisplay();

            this.isInitialized = true;
            console.log('RobotVisualizer initialized successfully');

        } catch (error) {
            console.error('Failed to initialize RobotVisualizer:', error);
            this.uiManager?.showToast('초기화 실패', 'error');
        }
    }

    // ===== 조인트 제어 메서드들 =====

    /**
     * J1 조인트 회전
     * @param {number} angle - 각도 (도)
     */
    rotateJ1(angle) {
        this.jointManager.rotateJoint('j1', angle);
        this.updateDisplay();
    }

    /**
     * J2 조인트 회전
     * @param {number} angle - 각도 (도)
     */
    rotateJ2(angle) {
        this.jointManager.rotateJoint('j2', angle);
        this.updateDisplay();
    }

    /**
     * J3 조인트 회전
     * @param {number} angle - 각도 (도)
     */
    rotateJ3(angle) {
        this.jointManager.rotateJoint('j3', angle);
        this.updateDisplay();
    }

    /**
     * J4 조인트 회전
     * @param {number} angle - 각도 (도)
     */
    rotateJ4(angle) {
        this.jointManager.rotateJoint('j4', angle);
        this.updateDisplay();
    }

    /**
     * J5 조인트 회전
     * @param {number} angle - 각도 (도)
     */
    rotateJ5(angle) {
        this.jointManager.rotateJoint('j5', angle);
        this.updateDisplay();
    }

    /**
     * J6 조인트 회전
     * @param {number} angle - 각도 (도)
     */
    rotateJ6(angle) {
        this.jointManager.rotateJoint('j6', angle);
        this.updateDisplay();
    }

    // ===== 애니메이션 메서드들 =====

    /**
     * J1 조인트 애니메이션 회전
     * @param {number} targetAngle - 목표 각도 (도)
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    animateJ1To(targetAngle, duration = 1000) {
        this.jointManager.animateJointTo('j1', targetAngle, duration);
    }

    /**
     * J2 조인트 애니메이션 회전
     * @param {number} targetAngle - 목표 각도 (도)
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    animateJ2To(targetAngle, duration = 1000) {
        this.jointManager.animateJointTo('j2', targetAngle, duration);
    }

    /**
     * J3 조인트 애니메이션 회전
     * @param {number} targetAngle - 목표 각도 (도)
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    animateJ3To(targetAngle, duration = 1000) {
        this.jointManager.animateJointTo('j3', targetAngle, duration);
    }

    /**
     * J4 조인트 애니메이션 회전
     * @param {number} targetAngle - 목표 각도 (도)
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    animateJ4To(targetAngle, duration = 1000) {
        this.jointManager.animateJointTo('j4', targetAngle, duration);
    }

    /**
     * J5 조인트 애니메이션 회전
     * @param {number} targetAngle - 목표 각도 (도)
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    animateJ5To(targetAngle, duration = 1000) {
        this.jointManager.animateJointTo('j5', targetAngle, duration);
    }

    /**
     * J6 조인트 애니메이션 회전
     * @param {number} targetAngle - 목표 각도 (도)
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    animateJ6To(targetAngle, duration = 1000) {
        this.jointManager.animateJointTo('j6', targetAngle, duration);
    }

    // ===== 고급 제어 메서드들 =====

    /**
     * 모든 조인트를 동시에 제어
     * @param {Object} angles - 조인트별 각도 {j1: 0, j2: 30, ...}
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    setAllJoints(angles, duration = 0) {
        const jointNames = ['j1', 'j2', 'j3', 'j4', 'j5', 'j6'];

        if (duration > 0) {
            // 애니메이션으로 이동
            jointNames.forEach(joint => {
                if (angles[joint] !== undefined) {
                    this.jointManager.animateJointTo(joint, angles[joint], duration);
                }
            });
        } else {
            // 즉시 이동
            jointNames.forEach(joint => {
                if (angles[joint] !== undefined) {
                    this.jointManager.rotateJoint(joint, angles[joint]);
                }
            });
            this.updateDisplay();
        }
    }

    /**
     * 홈 포지션으로 이동
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    moveToHome(duration = 2000) {
        const homePosition = {
            j1: 0,
            j2: 0,
            j3: 0,
            j4: 0,
            j5: 0,
            j6: 0
        };

        this.setAllJoints(homePosition, duration);
        this.uiManager?.showToast('홈 포지션으로 이동 중...', 'info');
    }

    /**
     * 목표 위치로 이동 (역기구학 사용)
     * @param {Object} targetPosition - 목표 위치 {x, y, z}
     * @param {number} duration - 애니메이션 시간 (ms)
     */
    moveToPosition(targetPosition, duration = 2000) {
        try {
            // 현재 조인트 각도를 초기 추정값으로 사용
            const currentAngles = this.getAllJointAngles();
            const currentRadians = [
                currentAngles.j1 * Math.PI / 180,
                currentAngles.j2 * Math.PI / 180,
                currentAngles.j3 * Math.PI / 180,
                currentAngles.j4 * Math.PI / 180,
                currentAngles.j5 * Math.PI / 180,
                currentAngles.j6 * Math.PI / 180
            ];

            // 역기구학 계산
            const targetRadians = this.kinematics.inverseKinematics(targetPosition, currentRadians);

            // 라디안을 도로 변환
            const targetDegrees = {
                j1: targetRadians[0] * 180 / Math.PI,
                j2: targetRadians[1] * 180 / Math.PI,
                j3: targetRadians[2] * 180 / Math.PI,
                j4: targetRadians[3] * 180 / Math.PI,
                j5: targetRadians[4] * 180 / Math.PI,
                j6: targetRadians[5] * 180 / Math.PI
            };

            // 계산된 각도로 이동
            this.setAllJoints(targetDegrees, duration);

            this.uiManager?.showToast(
                `목표 위치 (${targetPosition.x.toFixed(1)}, ${targetPosition.y.toFixed(1)}, ${targetPosition.z.toFixed(1)})로 이동 중...`,
                'info'
            );

        } catch (error) {
            console.error('Inverse kinematics failed:', error);
            this.uiManager?.showToast('역기구학 계산 실패', 'error');
        }
    }

    // ===== 유틸리티 메서드들 =====

    /**
     * 엔드 이펙터 위치 가져오기
     * @returns {Object} {x, y, z} 좌표
     */
    getEndEffectorPosition() {
        return this.jointManager.getEndEffectorPosition();
    }

    /**
     * 모든 조인트 각도 가져오기
     * @returns {Object} 조인트별 각도
     */
    getAllJointAngles() {
        return this.jointManager.getAllJointAngles();
    }

    /**
     * 특정 조인트 각도 가져오기
     * @param {string} jointName - 조인트 이름 (j1, j2, j3, j4, j5, j6)
     * @returns {number} 각도 (도)
     */
    getJointAngle(jointName) {
        return this.jointManager.getJointAngle(jointName);
    }

    /**
     * 조인트 정보 가져오기
     * @param {string} jointName - 조인트 이름
     * @returns {Object} 조인트 정보
     */
    getJointInfo(jointName) {
        return this.jointManager.getJointInfo(jointName);
    }

    /**
     * 모든 조인트 정보 가져오기
     * @returns {Object} 조인트별 정보
     */
    getAllJointsInfo() {
        return this.jointManager.getAllJointsInfo();
    }

    /**
     * 순기구학 계산
     * @param {Array} jointAngles - 조인트 각도 배열 (도)
     * @returns {Object} 계산된 위치와 자세
     */
    calculateForwardKinematics(jointAngles = null) {
        if (!jointAngles) {
            const current = this.getAllJointAngles();
            jointAngles = [current.j1, current.j2, current.j3, current.j4, current.j5, current.j6];
        }

        // 도를 라디안으로 변환
        const radians = jointAngles.map(angle => angle * Math.PI / 180);

        return this.kinematics.forwardKinematics(radians);
    }

    /**
     * UI 표시 업데이트
     */
    updateDisplay() {
        if (!this.isInitialized) return;

        const jointAngles = this.getAllJointAngles();
        const endEffectorPos = this.getEndEffectorPosition();
        this.uiManager.updatePositionDisplay(jointAngles, endEffectorPos);
    }

    /**
     * 애니메이션 루프
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (this.sceneManager) {
            this.sceneManager.update();
            this.sceneManager.render();
        }

        // UI 실시간 업데이트 (애니메이션 중에도)
        this.updateDisplay();
    }

    /**
     * 애니메이션 일시정지/재개
     * @param {boolean} paused - 일시정지 여부
     */
    setPaused(paused) {
        if (paused && this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        } else if (!paused && !this.animationId) {
            this.animate();
        }
    }

    /**
     * 윈도우 크기 변경 이벤트
     */
    onWindowResize() {
        if (this.sceneManager) {
            this.sceneManager.onWindowResize();
        }
    }

    /**
     * 컨트롤 패널 표시/숨기기
     * @param {boolean} show - 표시 여부
     */
    showControlPanel(show = true) {
        if (show && this.uiManager) {
            this.uiManager.createControlPanel((joint, angle) => {
                this.jointManager.rotateJoint(joint, angle);
                this.updateDisplay();
            });
        }
    }

    /**
     * 성능 모니터 표시/숨기기
     * @param {boolean} show - 표시 여부
     */
    showPerformanceMonitor(show = true) {
        if (show && this.uiManager) {
            this.uiManager.createPerformanceMonitor();
        }
    }

    /**
     * 리소스 정리
     */
    dispose() {
        // 애니메이션 중지
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // 각 모듈 정리
        if (this.sceneManager) {
            this.sceneManager.dispose();
        }
        if (this.jointManager) {
            this.jointManager.dispose();
        }
        if (this.uiManager) {
            this.uiManager.dispose();
        }

        this.isInitialized = false;
        console.log('RobotVisualizer disposed');
    }

    // ===== 백워드 호환성을 위한 레거시 메서드들 =====

    /**
     * 기존 코드 호환을 위한 setupUI (더 이상 필요 없음)
     * @deprecated UIManager에서 자동 처리됨
     */
    setupUI() {
        console.warn('setupUI() is deprecated. UIManager handles UI automatically.');
    }

    /**
     * 기존 코드 호환을 위한 updatePositionDisplay
     * @deprecated updateDisplay() 사용 권장
     */
    updatePositionDisplay() {
        this.updateDisplay();
    }

    /**
     * 씬, 카메라, 렌더러 접근을 위한 게터들 (레거시 지원)
     */
    get scene() {
        return this.sceneManager?.getScene();
    }

    get camera() {
        return this.sceneManager?.getCamera();
    }

    get renderer() {
        return this.sceneManager?.getRenderer();
    }

    get controls() {
        return this.sceneManager?.getControls();
    }
}