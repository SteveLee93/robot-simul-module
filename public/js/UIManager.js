/**
 * UIManager - UI 컴포넌트 관리
 * 위치 표시 및 기타 UI 요소들을 관리
 */
import { UI_CONFIG } from './RobotConfig.js';

export class UIManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.positionDisplay = null;
        this.init();
    }

    init() {
        this.createPositionDisplay();
    }

    /**
     * 위치 표시 UI 생성
     */
    createPositionDisplay() {
        this.positionDisplay = document.createElement('div');
        this.positionDisplay.id = 'position-display';

        // 스타일 적용
        const style = UI_CONFIG.positionDisplay.style;
        Object.keys(style).forEach(key => {
            this.positionDisplay.style[key] = style[key];
        });

        this.container.appendChild(this.positionDisplay);
    }

    /**
     * 위치 정보 업데이트
     * @param {Object} jointAngles - 조인트별 각도
     * @param {Object} endEffectorPos - 엔드 이펙터 위치
     */
    updatePositionDisplay(jointAngles, endEffectorPos) {
        if (!this.positionDisplay) return;

        const formatAngle = (angle) => angle.toFixed(1);
        const formatPos = (value) => value.toFixed(1);

        this.positionDisplay.innerHTML = `
            <div><strong>좌표계 정보</strong></div>
            <div>바닥면: XY 평면 (빨강=X, 초록=Y)</div>
            <div>위쪽: Z축 (파랑)</div>
            <div>J1 각도: ${formatAngle(jointAngles.j1 || 0)}°</div>
            <div>J1 회전: XY 평면에서 Z축 중심</div>
            <div>J2 각도: ${formatAngle(jointAngles.j2 || 0)}°</div>
            <div>J2 회전: Z축 중심</div>
            <div>J3 각도: ${formatAngle(jointAngles.j3 || 0)}°</div>
            <div>J3 회전: Z축 중심</div>
            <div>J4 각도: ${formatAngle(jointAngles.j4 || 0)}°</div>
            <div>J4 회전: Y축 중심</div>
            <div>J5 각도: ${formatAngle(jointAngles.j5 || 0)}°</div>
            <div>J5 회전: Z축 중심 (J2와 같은 방향)</div>
            <div>J6 각도: ${formatAngle(jointAngles.j6 || 0)}°</div>
            <div>J6 회전: Y축 중심 (J1과 같은 방향)</div>
            <div>끝점 위치:</div>
            <div>&nbsp;&nbsp;X: ${formatPos(endEffectorPos.x)}</div>
            <div>&nbsp;&nbsp;Y: ${formatPos(endEffectorPos.y)}</div>
            <div>&nbsp;&nbsp;Z: ${formatPos(endEffectorPos.z)}</div>
        `;
    }

    /**
     * UI 제거
     */
    dispose() {
        if (this.positionDisplay && this.positionDisplay.parentNode) {
            this.positionDisplay.parentNode.removeChild(this.positionDisplay);
        }
    }
}