/**
 * RobotVisualizer - 리팩토링된 6DOF 로봇 시각화 클래스
 * 모듈화된 아키텍처를 사용하여 3D 로봇 팔을 시각화하고 제어
 */
import { SceneManager } from './SceneManager.js';
import { JointManager } from './JointManager.js';
import { UIManager } from './UIManager.js';
import { ROBOT_6DOF_CONFIG } from './RobotConfig.js';

export class RobotVisualizer {
    constructor(containerId) {
        this.containerId = containerId;

        // 모듈 인스턴스들
        this.sceneManager = null;
        this.jointManager = null;
        this.uiManager = null;

        this.init();
    }

    /**
     * 초기화
     */
    init() {
        // 씬 매니저 초기화
        this.sceneManager = new SceneManager(this.containerId);

        // 조인트 매니저 초기화 및 로봇 생성
        this.jointManager = new JointManager();
        this.jointManager.createRobot(ROBOT_6DOF_CONFIG, this.sceneManager.getScene());

        // UI 매니저 초기화
        this.uiManager = new UIManager(this.containerId);

        // 애니메이션 시작
        this.animate();

        // 초기 위치 표시 업데이트
        this.updateDisplay();
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
     * UI 표시 업데이트
     */
    updateDisplay() {
        const jointAngles = this.getAllJointAngles();
        const endEffectorPos = this.getEndEffectorPosition();
        this.uiManager.updatePositionDisplay(jointAngles, endEffectorPos);
    }

    /**
     * 애니메이션 루프
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        this.sceneManager.update();
        this.sceneManager.render();

        // UI 실시간 업데이트 (애니메이션 중에도)
        this.updateDisplay();
    }

    /**
     * 윈도우 크기 변경 이벤트 (SceneManager에서 자동 처리됨)
     */
    onWindowResize() {
        this.sceneManager.onWindowResize();
    }

    /**
     * 리소스 정리
     */
    dispose() {
        if (this.sceneManager) {
            this.sceneManager.dispose();
        }
        if (this.jointManager) {
            this.jointManager.dispose();
        }
        if (this.uiManager) {
            this.uiManager.dispose();
        }
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
}