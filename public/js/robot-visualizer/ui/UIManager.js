/**
 * UIManager - UI 컴포넌트 관리
 * 위치 표시 및 기타 UI 요소들을 관리
 */
import { UI_CONFIG } from '../robot/RobotConfig.js';

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
     * 조인트 정보 패널 생성 (확장 기능)
     * @param {Object} jointsInfo - 모든 조인트 정보
     */
    createJointInfoPanel(jointsInfo) {
        const panel = document.createElement('div');
        panel.id = 'joint-info-panel';
        panel.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
            max-width: 200px;
        `;

        let content = '<div><strong>조인트 정보</strong></div>';

        Object.entries(jointsInfo).forEach(([name, info]) => {
            if (info && info.type !== 'fixed') {
                content += `
                    <div style="margin-top: 8px;">
                        <div><strong>${name.toUpperCase()}</strong></div>
                        <div>타입: ${info.type}</div>
                        <div>축: ${info.axis || 'N/A'}</div>
                        <div>범위: ${info.range[0]}° ~ ${info.range[1]}°</div>
                        <div>현재: ${info.currentAngle.toFixed(1)}°</div>
                    </div>
                `;
            }
        });

        panel.innerHTML = content;
        this.container.appendChild(panel);

        return panel;
    }

    /**
     * 컨트롤 패널 생성 (확장 기능)
     * @param {Function} onJointChange - 조인트 변경 콜백
     */
    createControlPanel(onJointChange) {
        const panel = document.createElement('div');
        panel.id = 'control-panel';
        panel.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 1000;
            min-width: 300px;
        `;

        const joints = ['j1', 'j2', 'j3', 'j4', 'j5', 'j6'];
        let content = '<div><strong>조인트 컨트롤</strong></div>';

        joints.forEach(joint => {
            content += `
                <div style="margin-top: 10px;">
                    <label for="${joint}-slider">${joint.toUpperCase()}:</label>
                    <input type="range"
                           id="${joint}-slider"
                           min="-180"
                           max="180"
                           value="0"
                           step="1"
                           style="width: 200px; margin-left: 10px;">
                    <span id="${joint}-value">0°</span>
                </div>
            `;
        });

        panel.innerHTML = content;
        this.container.appendChild(panel);

        // 슬라이더 이벤트 리스너 추가
        joints.forEach(joint => {
            const slider = panel.querySelector(`#${joint}-slider`);
            const valueSpan = panel.querySelector(`#${joint}-value`);

            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                valueSpan.textContent = `${value}°`;
                if (onJointChange) {
                    onJointChange(joint, value);
                }
            });
        });

        return panel;
    }

    /**
     * 성능 모니터 생성 (확장 기능)
     */
    createPerformanceMonitor() {
        const monitor = document.createElement('div');
        monitor.id = 'performance-monitor';
        monitor.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: #00ff00;
            padding: 8px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
        `;

        this.container.appendChild(monitor);

        // FPS 카운터 (간단한 구현)
        let lastTime = performance.now();
        let frames = 0;

        const updateFPS = () => {
            const now = performance.now();
            frames++;

            if (now - lastTime >= 1000) {
                const fps = Math.round((frames * 1000) / (now - lastTime));
                monitor.innerHTML = `FPS: ${fps}`;
                frames = 0;
                lastTime = now;
            }

            requestAnimationFrame(updateFPS);
        };

        updateFPS();
        return monitor;
    }

    /**
     * 메시지 토스트 표시
     * @param {string} message - 표시할 메시지
     * @param {string} type - 메시지 타입 ('info', 'warning', 'error')
     * @param {number} duration - 표시 시간 (ms)
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'error' ? '#ff4444' : type === 'warning' ? '#ffaa44' : '#4444ff'};
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        toast.textContent = message;
        this.container.appendChild(toast);

        // 페이드 인
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        // 페이드 아웃 및 제거
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    /**
     * UI 제거
     */
    dispose() {
        const elements = [
            'position-display',
            'joint-info-panel',
            'control-panel',
            'performance-monitor'
        ];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }
}