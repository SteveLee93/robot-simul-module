import { RobotVisualizer } from './robot-visualizer/index.js';

/**
 * 간단한 테스트용 앱
 * J1, J2 회전 테스트
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
        // J1 슬라이더 연결
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

        // J2 슬라이더 연결
        const j2Slider = document.getElementById('j2Slider');
        const j2Value = document.getElementById('j2Value');

        if (j2Slider && j2Value) {
            j2Slider.addEventListener('input', (e) => {
                const angle = parseInt(e.target.value);
                j2Value.textContent = angle;

                // J2 즉시 회전
                this.visualizer.rotateJ2(angle);

                // 끝점 좌표 계산 및 표시
                const endPos = this.visualizer.getEndEffectorPosition();
                this.logEvent(`J2를 ${angle}도로 회전 → 끝점: (${endPos.x.toFixed(1)}, ${endPos.y.toFixed(1)}, ${endPos.z.toFixed(1)})`);
            });
        }

        // J3 슬라이더 연결
        const j3Slider = document.getElementById('j3Slider');
        const j3Value = document.getElementById('j3Value');

        if (j3Slider && j3Value) {
            j3Slider.addEventListener('input', (e) => {
                const angle = parseInt(e.target.value);
                j3Value.textContent = angle;

                // J3 즉시 회전
                this.visualizer.rotateJ3(angle);

                // 끝점 좌표 계산 및 표시
                const endPos = this.visualizer.getEndEffectorPosition();
                this.logEvent(`J3을 ${angle}도로 회전 → 끝점: (${endPos.x.toFixed(1)}, ${endPos.y.toFixed(1)}, ${endPos.z.toFixed(1)})`);
            });
        }

        // J4 슬라이더 연결
        const j4Slider = document.getElementById('j4Slider');
        const j4Value = document.getElementById('j4Value');

        if (j4Slider && j4Value) {
            j4Slider.addEventListener('input', (e) => {
                const angle = parseInt(e.target.value);
                j4Value.textContent = angle;

                // J4 즉시 회전
                this.visualizer.rotateJ4(angle);

                // 끝점 좌표 계산 및 표시
                const endPos = this.visualizer.getEndEffectorPosition();
                this.logEvent(`J4를 ${angle}도로 회전 → 끝점: (${endPos.x.toFixed(1)}, ${endPos.y.toFixed(1)}, ${endPos.z.toFixed(1)})`);
            });
        }

        // J5 슬라이더 연결
        const j5Slider = document.getElementById('j5Slider');
        const j5Value = document.getElementById('j5Value');

        if (j5Slider && j5Value) {
            j5Slider.addEventListener('input', (e) => {
                const angle = parseInt(e.target.value);
                j5Value.textContent = angle;

                // J5 즉시 회전
                this.visualizer.rotateJ5(angle);

                // 끝점 좌표 계산 및 표시
                const endPos = this.visualizer.getEndEffectorPosition();
                this.logEvent(`J5를 ${angle}도로 회전 → 끝점: (${endPos.x.toFixed(1)}, ${endPos.y.toFixed(1)}, ${endPos.z.toFixed(1)})`);
            });
        }

        // J6 슬라이더 연결
        const j6Slider = document.getElementById('j6Slider');
        const j6Value = document.getElementById('j6Value');

        if (j6Slider && j6Value) {
            j6Slider.addEventListener('input', (e) => {
                const angle = parseInt(e.target.value);
                j6Value.textContent = angle;

                // J6 즉시 회전
                this.visualizer.rotateJ6(angle);

                // 끝점 좌표 계산 및 표시
                const endPos = this.visualizer.getEndEffectorPosition();
                this.logEvent(`J6을 ${angle}도로 회전 → 끝점: (${endPos.x.toFixed(1)}, ${endPos.y.toFixed(1)}, ${endPos.z.toFixed(1)})`);
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
                <h3>J2 테스트</h3>
                <div class="control-group">
                    <button id="testJ2Up" class="btn">J2 위로 (45°)</button>
                    <button id="testJ2Down" class="btn">J2 아래로 (-45°)</button>
                    <button id="testJ2Home" class="btn">J2 홈 (0°)</button>
                    <button id="testJ2Animation" class="btn">J2 애니메이션</button>
                    <button id="testBothJoints" class="btn">양쪽 조인트 테스트</button>
                </div>
                <h3>J3 테스트</h3>
                <div class="control-group">
                    <button id="testJ3Left" class="btn">J3 좌회전 (45°)</button>
                    <button id="testJ3Right" class="btn">J3 우회전 (-45°)</button>
                    <button id="testJ3Home" class="btn">J3 홈 (0°)</button>
                    <button id="testJ3Animation" class="btn">J3 애니메이션</button>
                    <button id="testAllJoints" class="btn">전체 조인트 테스트</button>
                </div>
                <h3>J4 테스트</h3>
                <div class="control-group">
                    <button id="testJ4Left" class="btn">J4 좌회전 (90°)</button>
                    <button id="testJ4Right" class="btn">J4 우회전 (-90°)</button>
                    <button id="testJ4Home" class="btn">J4 홈 (0°)</button>
                    <button id="testJ4Animation" class="btn">J4 애니메이션</button>
                    <button id="testFourJoints" class="btn">4축 조인트 테스트</button>
                </div>
                <h3>J5 테스트</h3>
                <div class="control-group">
                    <button id="testJ5Left" class="btn">J5 좌회전 (90°)</button>
                    <button id="testJ5Right" class="btn">J5 우회전 (-90°)</button>
                    <button id="testJ5Home" class="btn">J5 홈 (0°)</button>
                    <button id="testJ5Animation" class="btn">J5 애니메이션</button>
                    <button id="testFiveJoints" class="btn">5축 조인트 테스트</button>
                </div>
                <h3>J6 테스트</h3>
                <div class="control-group">
                    <button id="testJ6Left" class="btn">J6 좌회전 (90°)</button>
                    <button id="testJ6Right" class="btn">J6 우회전 (-90°)</button>
                    <button id="testJ6Home" class="btn">J6 홈 (0°)</button>
                    <button id="testJ6Animation" class="btn">J6 애니메이션</button>
                    <button id="testAllSixJoints" class="btn">전체 6축 조인트 테스트</button>
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

            // J2 테스트 버튼 이벤트
            document.getElementById('testJ2Up').addEventListener('click', () => {
                this.testJ2Rotation(45);
            });

            document.getElementById('testJ2Down').addEventListener('click', () => {
                this.testJ2Rotation(-45);
            });

            document.getElementById('testJ2Home').addEventListener('click', () => {
                this.testJ2Rotation(0);
            });

            document.getElementById('testJ2Animation').addEventListener('click', () => {
                this.testJ2Animation();
            });

            document.getElementById('testBothJoints').addEventListener('click', () => {
                this.testBothJoints();
            });

            // J3 테스트 버튼 이벤트
            document.getElementById('testJ3Left').addEventListener('click', () => {
                this.testJ3Rotation(45);
            });

            document.getElementById('testJ3Right').addEventListener('click', () => {
                this.testJ3Rotation(-45);
            });

            document.getElementById('testJ3Home').addEventListener('click', () => {
                this.testJ3Rotation(0);
            });

            document.getElementById('testJ3Animation').addEventListener('click', () => {
                this.testJ3Animation();
            });

            document.getElementById('testAllJoints').addEventListener('click', () => {
                this.testAllJoints();
            });

            // J4 테스트 버튼 이벤트
            document.getElementById('testJ4Left').addEventListener('click', () => {
                this.testJ4Rotation(90);
            });

            document.getElementById('testJ4Right').addEventListener('click', () => {
                this.testJ4Rotation(-90);
            });

            document.getElementById('testJ4Home').addEventListener('click', () => {
                this.testJ4Rotation(0);
            });

            document.getElementById('testJ4Animation').addEventListener('click', () => {
                this.testJ4Animation();
            });

            document.getElementById('testFourJoints').addEventListener('click', () => {
                this.testFourJoints();
            });

            // J5 테스트 버튼 이벤트
            document.getElementById('testJ5Left').addEventListener('click', () => {
                this.testJ5Rotation(90);
            });

            document.getElementById('testJ5Right').addEventListener('click', () => {
                this.testJ5Rotation(-90);
            });

            document.getElementById('testJ5Home').addEventListener('click', () => {
                this.testJ5Rotation(0);
            });

            document.getElementById('testJ5Animation').addEventListener('click', () => {
                this.testJ5Animation();
            });

            document.getElementById('testFiveJoints').addEventListener('click', () => {
                this.testFiveJoints();
            });

            // J6 테스트 버튼 이벤트
            document.getElementById('testJ6Left').addEventListener('click', () => {
                this.testJ6Rotation(90);
            });

            document.getElementById('testJ6Right').addEventListener('click', () => {
                this.testJ6Rotation(-90);
            });

            document.getElementById('testJ6Home').addEventListener('click', () => {
                this.testJ6Rotation(0);
            });

            document.getElementById('testJ6Animation').addEventListener('click', () => {
                this.testJ6Animation();
            });

            document.getElementById('testAllSixJoints').addEventListener('click', () => {
                this.testAllSixJoints();
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

    testJ2Rotation(angle) {
        this.visualizer.rotateJ2(angle);
        const j2Slider = document.getElementById('j2Slider');
        const j2Value = document.getElementById('j2Value');
        if (j2Slider && j2Value) {
            j2Slider.value = angle;
            j2Value.textContent = angle;
        }
        this.logEvent(`J2를 ${angle}도로 즉시 회전`);
    }

    testJ2Animation() {
        this.logEvent('J2 애니메이션 테스트 시작...');

        // 순서대로 회전 애니메이션
        setTimeout(() => {
            this.visualizer.animateJ2To(60, 1000);
            this.logEvent('J2 60도로 애니메이션 시작');
        }, 500);

        setTimeout(() => {
            this.visualizer.animateJ2To(-60, 1000);
            this.logEvent('J2 -60도로 애니메이션 시작');
        }, 2000);

        setTimeout(() => {
            this.visualizer.animateJ2To(0, 1000);
            this.logEvent('J2 0도로 애니메이션 시작');
        }, 3500);
    }

    testBothJoints() {
        this.logEvent('양쪽 조인트 동시 테스트 시작...');

        // J1과 J2를 함께 움직이는 시퀀스
        setTimeout(() => {
            this.visualizer.animateJ1To(90, 1500);
            this.visualizer.animateJ2To(45, 1500);
            this.logEvent('J1=90°, J2=45° 동시 애니메이션');
        }, 500);

        setTimeout(() => {
            this.visualizer.animateJ1To(-90, 1500);
            this.visualizer.animateJ2To(-30, 1500);
            this.logEvent('J1=-90°, J2=-30° 동시 애니메이션');
        }, 2500);

        setTimeout(() => {
            this.visualizer.animateJ1To(45, 1500);
            this.visualizer.animateJ2To(60, 1500);
            this.logEvent('J1=45°, J2=60° 동시 애니메이션');
        }, 4500);

        setTimeout(() => {
            this.visualizer.animateJ1To(0, 1500);
            this.visualizer.animateJ2To(0, 1500);
            this.logEvent('홈 위치로 복귀');
        }, 6500);
    }

    testJ3Rotation(angle) {
        this.visualizer.rotateJ3(angle);
        const j3Slider = document.getElementById('j3Slider');
        const j3Value = document.getElementById('j3Value');
        if (j3Slider && j3Value) {
            j3Slider.value = angle;
            j3Value.textContent = angle;
        }
        this.logEvent(`J3을 ${angle}도로 즉시 회전`);
    }

    testJ3Animation() {
        this.logEvent('J3 애니메이션 테스트 시작...');

        // 순서대로 회전 애니메이션
        setTimeout(() => {
            this.visualizer.animateJ3To(90, 1000);
            this.logEvent('J3 90도로 애니메이션 시작');
        }, 500);

        setTimeout(() => {
            this.visualizer.animateJ3To(-90, 1000);
            this.logEvent('J3 -90도로 애니메이션 시작');
        }, 2000);

        setTimeout(() => {
            this.visualizer.animateJ3To(0, 1000);
            this.logEvent('J3 0도로 애니메이션 시작');
        }, 3500);
    }

    testAllJoints() {
        this.logEvent('전체 조인트 동시 테스트 시작...');

        // J1, J2, J3를 모두 함께 움직이는 시퀀스
        setTimeout(() => {
            this.visualizer.animateJ1To(90, 1500);
            this.visualizer.animateJ2To(45, 1500);
            this.visualizer.animateJ3To(60, 1500);
            this.logEvent('J1=90°, J2=45°, J3=60° 동시 애니메이션');
        }, 500);

        setTimeout(() => {
            this.visualizer.animateJ1To(-90, 1500);
            this.visualizer.animateJ2To(-30, 1500);
            this.visualizer.animateJ3To(-45, 1500);
            this.logEvent('J1=-90°, J2=-30°, J3=-45° 동시 애니메이션');
        }, 2500);

        setTimeout(() => {
            this.visualizer.animateJ1To(45, 1500);
            this.visualizer.animateJ2To(30, 1500);
            this.visualizer.animateJ3To(90, 1500);
            this.logEvent('J1=45°, J2=30°, J3=90° 동시 애니메이션');
        }, 4500);

        setTimeout(() => {
            this.visualizer.animateJ1To(0, 1500);
            this.visualizer.animateJ2To(0, 1500);
            this.visualizer.animateJ3To(0, 1500);
            this.logEvent('전체 홈 위치로 복귀');
        }, 6500);
    }

    testJ4Rotation(angle) {
        this.visualizer.rotateJ4(angle);
        const j4Slider = document.getElementById('j4Slider');
        const j4Value = document.getElementById('j4Value');
        if (j4Slider && j4Value) {
            j4Slider.value = angle;
            j4Value.textContent = angle;
        }
        this.logEvent(`J4를 ${angle}도로 즉시 회전`);
    }

    testJ4Animation() {
        this.logEvent('J4 애니메이션 테스트 시작...');

        // 순서대로 회전 애니메이션
        setTimeout(() => {
            this.visualizer.animateJ4To(180, 1000);
            this.logEvent('J4 180도로 애니메이션 시작');
        }, 500);

        setTimeout(() => {
            this.visualizer.animateJ4To(-180, 1000);
            this.logEvent('J4 -180도로 애니메이션 시작');
        }, 2000);

        setTimeout(() => {
            this.visualizer.animateJ4To(0, 1000);
            this.logEvent('J4 0도로 애니메이션 시작');
        }, 3500);
    }

    testFourJoints() {
        this.logEvent('4축 조인트 동시 테스트 시작...');

        // J1, J2, J3, J4를 모두 함께 움직이는 시퀀스
        setTimeout(() => {
            this.visualizer.animateJ1To(90, 1500);
            this.visualizer.animateJ2To(45, 1500);
            this.visualizer.animateJ3To(60, 1500);
            this.visualizer.animateJ4To(90, 1500);
            this.logEvent('J1=90°, J2=45°, J3=60°, J4=90° 동시 애니메이션');
        }, 500);

        setTimeout(() => {
            this.visualizer.animateJ1To(-90, 1500);
            this.visualizer.animateJ2To(-30, 1500);
            this.visualizer.animateJ3To(-45, 1500);
            this.visualizer.animateJ4To(-90, 1500);
            this.logEvent('J1=-90°, J2=-30°, J3=-45°, J4=-90° 동시 애니메이션');
        }, 2500);

        setTimeout(() => {
            this.visualizer.animateJ1To(45, 1500);
            this.visualizer.animateJ2To(30, 1500);
            this.visualizer.animateJ3To(90, 1500);
            this.visualizer.animateJ4To(180, 1500);
            this.logEvent('J1=45°, J2=30°, J3=90°, J4=180° 동시 애니메이션');
        }, 4500);

        setTimeout(() => {
            this.visualizer.animateJ1To(0, 1500);
            this.visualizer.animateJ2To(0, 1500);
            this.visualizer.animateJ3To(0, 1500);
            this.visualizer.animateJ4To(0, 1500);
            this.logEvent('전체 홈 위치로 복귀');
        }, 6500);
    }

    testJ5Rotation(angle) {
        this.visualizer.rotateJ5(angle);
        const j5Slider = document.getElementById('j5Slider');
        const j5Value = document.getElementById('j5Value');
        if (j5Slider && j5Value) {
            j5Slider.value = angle;
            j5Value.textContent = angle;
        }
        this.logEvent(`J5를 ${angle}도로 즉시 회전`);
    }

    testJ5Animation() {
        this.logEvent('J5 애니메이션 테스트 시작...');

        // 순서대로 회전 애니메이션
        setTimeout(() => {
            this.visualizer.animateJ5To(180, 1000);
            this.logEvent('J5 180도로 애니메이션 시작');
        }, 500);

        setTimeout(() => {
            this.visualizer.animateJ5To(-180, 1000);
            this.logEvent('J5 -180도로 애니메이션 시작');
        }, 2000);

        setTimeout(() => {
            this.visualizer.animateJ5To(0, 1000);
            this.logEvent('J5 0도로 애니메이션 시작');
        }, 3500);
    }

    testFiveJoints() {
        this.logEvent('5축 조인트 동시 테스트 시작...');

        // J1, J2, J3, J4, J5를 모두 함께 움직이는 시퀀스
        setTimeout(() => {
            this.visualizer.animateJ1To(90, 1500);
            this.visualizer.animateJ2To(45, 1500);
            this.visualizer.animateJ3To(60, 1500);
            this.visualizer.animateJ4To(90, 1500);
            this.visualizer.animateJ5To(90, 1500);
            this.logEvent('J1=90°, J2=45°, J3=60°, J4=90°, J5=90° 동시 애니메이션');
        }, 500);

        setTimeout(() => {
            this.visualizer.animateJ1To(-90, 1500);
            this.visualizer.animateJ2To(-30, 1500);
            this.visualizer.animateJ3To(-45, 1500);
            this.visualizer.animateJ4To(-90, 1500);
            this.visualizer.animateJ5To(-90, 1500);
            this.logEvent('J1=-90°, J2=-30°, J3=-45°, J4=-90°, J5=-90° 동시 애니메이션');
        }, 2500);

        setTimeout(() => {
            this.visualizer.animateJ1To(45, 1500);
            this.visualizer.animateJ2To(30, 1500);
            this.visualizer.animateJ3To(90, 1500);
            this.visualizer.animateJ4To(180, 1500);
            this.visualizer.animateJ5To(180, 1500);
            this.logEvent('J1=45°, J2=30°, J3=90°, J4=180°, J5=180° 동시 애니메이션');
        }, 4500);

        setTimeout(() => {
            this.visualizer.animateJ1To(0, 1500);
            this.visualizer.animateJ2To(0, 1500);
            this.visualizer.animateJ3To(0, 1500);
            this.visualizer.animateJ4To(0, 1500);
            this.visualizer.animateJ5To(0, 1500);
            this.logEvent('전체 홈 위치로 복귀');
        }, 6500);
    }

    testJ6Rotation(angle) {
        this.visualizer.rotateJ6(angle);
        const j6Slider = document.getElementById('j6Slider');
        const j6Value = document.getElementById('j6Value');
        if (j6Slider && j6Value) {
            j6Slider.value = angle;
            j6Value.textContent = angle;
        }
        this.logEvent(`J6을 ${angle}도로 즉시 회전`);
    }

    testJ6Animation() {
        this.logEvent('J6 애니메이션 테스트 시작...');

        // 순서대로 회전 애니메이션
        setTimeout(() => {
            this.visualizer.animateJ6To(180, 1000);
            this.logEvent('J6 180도로 애니메이션 시작');
        }, 500);

        setTimeout(() => {
            this.visualizer.animateJ6To(-180, 1000);
            this.logEvent('J6 -180도로 애니메이션 시작');
        }, 2000);

        setTimeout(() => {
            this.visualizer.animateJ6To(0, 1000);
            this.logEvent('J6 0도로 애니메이션 시작');
        }, 3500);
    }

    testAllSixJoints() {
        this.logEvent('전체 6축 조인트 동시 테스트 시작...');

        // J1, J2, J3, J4, J5, J6를 모두 함께 움직이는 시퀀스
        setTimeout(() => {
            this.visualizer.animateJ1To(90, 1500);
            this.visualizer.animateJ2To(45, 1500);
            this.visualizer.animateJ3To(60, 1500);
            this.visualizer.animateJ4To(90, 1500);
            this.visualizer.animateJ5To(90, 1500);
            this.visualizer.animateJ6To(90, 1500);
            this.logEvent('J1=90°, J2=45°, J3=60°, J4=90°, J5=90°, J6=90° 동시 애니메이션');
        }, 500);

        setTimeout(() => {
            this.visualizer.animateJ1To(-90, 1500);
            this.visualizer.animateJ2To(-30, 1500);
            this.visualizer.animateJ3To(-45, 1500);
            this.visualizer.animateJ4To(-90, 1500);
            this.visualizer.animateJ5To(-90, 1500);
            this.visualizer.animateJ6To(-90, 1500);
            this.logEvent('J1=-90°, J2=-30°, J3=-45°, J4=-90°, J5=-90°, J6=-90° 동시 애니메이션');
        }, 2500);

        setTimeout(() => {
            this.visualizer.animateJ1To(45, 1500);
            this.visualizer.animateJ2To(30, 1500);
            this.visualizer.animateJ3To(90, 1500);
            this.visualizer.animateJ4To(180, 1500);
            this.visualizer.animateJ5To(180, 1500);
            this.visualizer.animateJ6To(180, 1500);
            this.logEvent('J1=45°, J2=30°, J3=90°, J4=180°, J5=180°, J6=180° 동시 애니메이션');
        }, 4500);

        setTimeout(() => {
            this.visualizer.animateJ1To(0, 1500);
            this.visualizer.animateJ2To(0, 1500);
            this.visualizer.animateJ3To(0, 1500);
            this.visualizer.animateJ4To(0, 1500);
            this.visualizer.animateJ5To(0, 1500);
            this.visualizer.animateJ6To(0, 1500);
            this.logEvent('전체 6축 홈 위치로 복귀');
        }, 6500);
    }

    homeRobot() {
        this.visualizer.animateJ1To(0, 500);
        this.visualizer.animateJ2To(0, 500);
        this.visualizer.animateJ3To(0, 500);
        this.visualizer.animateJ4To(0, 500);
        this.visualizer.animateJ5To(0, 500);
        this.visualizer.animateJ6To(0, 500);
        document.getElementById('j1Slider').value = 0;
        document.getElementById('j1Value').textContent = 0;
        const j2Slider = document.getElementById('j2Slider');
        const j2Value = document.getElementById('j2Value');
        if (j2Slider && j2Value) {
            j2Slider.value = 0;
            j2Value.textContent = 0;
        }
        const j3Slider = document.getElementById('j3Slider');
        const j3Value = document.getElementById('j3Value');
        if (j3Slider && j3Value) {
            j3Slider.value = 0;
            j3Value.textContent = 0;
        }
        const j4Slider = document.getElementById('j4Slider');
        const j4Value = document.getElementById('j4Value');
        if (j4Slider && j4Value) {
            j4Slider.value = 0;
            j4Value.textContent = 0;
        }
        const j5Slider = document.getElementById('j5Slider');
        const j5Value = document.getElementById('j5Value');
        if (j5Slider && j5Value) {
            j5Slider.value = 0;
            j5Value.textContent = 0;
        }
        const j6Slider = document.getElementById('j6Slider');
        const j6Value = document.getElementById('j6Value');
        if (j6Slider && j6Value) {
            j6Slider.value = 0;
            j6Value.textContent = 0;
        }
        this.logEvent('홈 위치로 이동 (J1 = 0도, J2 = 0도, J3 = 0도, J4 = 0도, J5 = 0도, J6 = 0도)');
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