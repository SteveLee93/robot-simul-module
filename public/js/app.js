import { RobotVisualizer } from './RobotVisualizer.js';

/**
 * 간단한 테스트용 앱
 * J1 회전만 테스트
 */
class SimpleRobotApp {
    constructor() {
        this.visualizer = null;
        this.init();
    }

    init() {
        this.setupVisualizer();
        this.setupEventListeners();
        this.logEvent('간단한 로봇 시뮬레이터 시작!');
    }

    setupVisualizer() {
        this.visualizer = new RobotVisualizer('threejs-container');
        this.logEvent('3D 시각화 초기화 완료');
    }

    setupEventListeners() {
        // J1 슬라이더만 연결
        const j1Slider = document.getElementById('j1Slider');
        const j1Value = document.getElementById('j1Value');

        if (j1Slider && j1Value) {
            j1Slider.addEventListener('input', (e) => {
                const angle = parseInt(e.target.value);
                j1Value.textContent = angle;

                // J1 즉시 회전
                this.visualizer.rotateJ1(angle);

                // 끝점 좌표 계산 및 표시
                const endPos = this.visualizer.getEndEffectorPosition();
                this.logEvent(`J1을 ${angle}도로 회전 → 끝점: (${endPos.x.toFixed(1)}, ${endPos.y.toFixed(1)}, ${endPos.z.toFixed(1)})`);
            });
        }

        // 홈 버튼
        const homeBtn = document.getElementById('homeBtn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                this.homeRobot();
            });
        }

        // 뷰 컨트롤
        const resetViewBtn = document.getElementById('resetView');
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                this.logEvent('뷰 리셋');
            });
        }

        // 로그 클리어
        const clearLogBtn = document.getElementById('clearLog');
        if (clearLogBtn) {
            clearLogBtn.addEventListener('click', () => {
                this.clearLog();
            });
        }

        // 테스트 버튼들 추가
        this.addTestButtons();
    }

    addTestButtons() {
        // 간단한 테스트 버튼들 추가
        const controlPanel = document.querySelector('.control-panel');
        if (controlPanel) {
            const testSection = document.createElement('div');
            testSection.className = 'panel-section';
            testSection.innerHTML = `
                <h3>J1 테스트</h3>
                <div class="control-group">
                    <button id="testRotate90" class="btn">90° 회전</button>
                    <button id="testRotate180" class="btn">180° 회전</button>
                    <button id="testRotateNeg90" class="btn">-90° 회전</button>
                    <button id="testAnimation" class="btn">애니메이션 테스트</button>
                    <button id="testPositions" class="btn">위치 테스트</button>
                </div>
            `;

            controlPanel.appendChild(testSection);

            // 테스트 버튼 이벤트
            document.getElementById('testRotate90').addEventListener('click', () => {
                this.testRotation(90);
            });

            document.getElementById('testRotate180').addEventListener('click', () => {
                this.testRotation(180);
            });

            document.getElementById('testRotateNeg90').addEventListener('click', () => {
                this.testRotation(-90);
            });

            document.getElementById('testAnimation').addEventListener('click', () => {
                this.testAnimation();
            });

            document.getElementById('testPositions').addEventListener('click', () => {
                this.testPositions();
            });
        }
    }

    testRotation(angle) {
        this.visualizer.rotateJ1(angle);
        document.getElementById('j1Slider').value = angle;
        document.getElementById('j1Value').textContent = angle;
        this.logEvent(`J1을 ${angle}도로 즉시 회전`);
    }

    testAnimation() {
        this.logEvent('애니메이션 테스트 시작...');

        // 순서대로 회전 애니메이션
        setTimeout(() => {
            this.visualizer.animateJ1To(90, 1000);
            this.logEvent('90도로 애니메이션 시작');
        }, 500);

        setTimeout(() => {
            this.visualizer.animateJ1To(-90, 1000);
            this.logEvent('-90도로 애니메이션 시작');
        }, 2000);

        setTimeout(() => {
            this.visualizer.animateJ1To(0, 1000);
            this.logEvent('0도로 애니메이션 시작');
        }, 3500);
    }

    testPositions() {
        this.logEvent('위치 테스트 시작 - 다양한 각도의 끝점 좌표');

        const testAngles = [0, 30, 45, 90, 135, 180, -90, -45];

        testAngles.forEach((angle, index) => {
            setTimeout(() => {
                this.visualizer.animateJ1To(angle, 800);

                setTimeout(() => {
                    const endPos = this.visualizer.getEndEffectorPosition();
                    this.logEvent(`${angle}° → 끝점: (${endPos.x.toFixed(1)}, ${endPos.y.toFixed(1)}, ${endPos.z.toFixed(1)})`);

                    // 슬라이더도 업데이트
                    document.getElementById('j1Slider').value = angle;
                    document.getElementById('j1Value').textContent = angle;
                }, 850);

            }, index * 1200);
        });
    }

    homeRobot() {
        this.visualizer.animateJ1To(0, 500);
        document.getElementById('j1Slider').value = 0;
        document.getElementById('j1Value').textContent = 0;
        this.logEvent('홈 위치로 이동 (J1 = 0도)');
    }

    logEvent(message) {
        const logElement = document.getElementById('eventLog');
        if (logElement) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry info';
            logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;

            logElement.appendChild(logEntry);
            logElement.scrollTop = logElement.scrollHeight;

            // 로그 100개만 유지
            while (logElement.children.length > 100) {
                logElement.removeChild(logElement.firstChild);
            }
        }
    }

    clearLog() {
        const logElement = document.getElementById('eventLog');
        if (logElement) {
            logElement.innerHTML = '';
            this.logEvent('로그 클리어됨');
        }
    }
}

// DOM 로드 완료 시 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    window.robotApp = new SimpleRobotApp();
});