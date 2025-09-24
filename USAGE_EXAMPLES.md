# Robot Visualizer 사용 예제

리팩토링된 Robot Visualizer의 다양한 사용법을 소개합니다.

## 🚀 기본 사용법

### 최소한의 설정

```html
<!DOCTYPE html>
<html>
<head>
    <title>Robot Visualizer</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
    <div id="robot-container" style="width: 800px; height: 600px;"></div>

    <script type="module">
        import { RobotVisualizer } from './js/robot-visualizer/index.js';

        const robot = new RobotVisualizer('robot-container');

        // 5초 후 J1을 90도 회전
        setTimeout(() => {
            robot.animateJ1To(90, 2000);
        }, 5000);
    </script>
</body>
</html>
```

## 🎮 조인트 제어

### 개별 조인트 제어

```javascript
import { RobotVisualizer } from './js/robot-visualizer/index.js';

const robot = new RobotVisualizer('robot-container');

// 즉시 회전
robot.rotateJ1(45);    // J1을 45도로
robot.rotateJ2(-30);   // J2를 -30도로
robot.rotateJ3(60);    // J3을 60도로

// 애니메이션 회전 (2초 동안)
robot.animateJ1To(90, 2000);
robot.animateJ2To(45, 2000);
robot.animateJ3To(-45, 2000);

// 현재 각도 확인
console.log('J1 각도:', robot.getJointAngle('j1'));
console.log('모든 각도:', robot.getAllJointAngles());
```

### 여러 조인트 동시 제어

```javascript
// 모든 조인트를 동시에 설정 (3초 애니메이션)
robot.setAllJoints({
    j1: 90,
    j2: 45,
    j3: -30,
    j4: 180,
    j5: 90,
    j6: -90
}, 3000);

// 홈 포지션으로 이동
robot.moveToHome(2000);

// 일부 조인트만 설정
robot.setAllJoints({
    j1: 45,
    j4: 90
}, 1500);
```

## 🎯 고급 제어

### 목표 위치로 이동 (역기구학)

```javascript
// 특정 3D 좌표로 엔드 이펙터 이동
robot.moveToPosition({
    x: 100,
    y: 50,
    z: 200
}, 3000);

// 현재 엔드 이펙터 위치 확인
const currentPos = robot.getEndEffectorPosition();
console.log(`현재 위치: (${currentPos.x}, ${currentPos.y}, ${currentPos.z})`);
```

### 순기구학 계산

```javascript
// 특정 각도에서의 엔드 이펙터 위치 계산
const jointAngles = [45, 30, -20, 90, 0, 180]; // 도 단위
const result = robot.calculateForwardKinematics(jointAngles);

console.log('계산된 위치:', result.position);
console.log('회전 행렬:', result.rotation);
```

## 🎨 UI 커스터마이징

### 컨트롤 패널 추가

```javascript
const robot = new RobotVisualizer('robot-container');

// 조인트 제어 슬라이더 패널 표시
robot.showControlPanel(true);

// 성능 모니터 표시 (FPS 카운터)
robot.showPerformanceMonitor(true);
```

### 커스텀 UI 이벤트

```javascript
import { UIManager } from './js/robot-visualizer/index.js';

const robot = new RobotVisualizer('robot-container');

// 커스텀 컨트롤 패널 생성
const uiManager = new UIManager('robot-container');

const controlPanel = uiManager.createControlPanel((jointName, angle) => {
    robot.jointManager.rotateJoint(jointName, angle);
    robot.updateDisplay();

    // 커스텀 로직
    console.log(`${jointName} 조인트가 ${angle}도로 회전됨`);
});

// 토스트 메시지
uiManager.showToast('로봇 준비 완료!', 'info', 3000);
uiManager.showToast('주의: 안전 범위 초과', 'warning', 5000);
uiManager.showToast('오류 발생', 'error', 5000);
```

## 🤖 시나리오 예제

### 1. 픽업 동작 시뮬레이션

```javascript
async function pickUpSequence() {
    const robot = new RobotVisualizer('robot-container');

    // 홈 포지션에서 시작
    robot.moveToHome(1000);
    await sleep(1500);

    // 목표물 위로 이동
    robot.setAllJoints({
        j1: 45,
        j2: 30,
        j3: -45
    }, 2000);
    await sleep(2500);

    // 아래로 내리기
    robot.animateJ3To(-75, 1000);
    robot.animateJ5To(90, 1000);
    await sleep(1500);

    // 그리퍼 닫기 (시각적 효과)
    console.log('그리퍼 닫기');
    await sleep(500);

    // 들어올리기
    robot.animateJ3To(-30, 1000);
    await sleep(1500);

    // 목표 위치로 이동
    robot.setAllJoints({
        j1: -45,
        j2: 45,
        j3: -30
    }, 2500);
    await sleep(3000);

    // 놓기
    robot.animateJ3To(-60, 1000);
    await sleep(1500);

    console.log('그리퍼 열기');
    await sleep(500);

    // 홈으로 복귀
    robot.moveToHome(2000);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 실행
pickUpSequence();
```

### 2. 작업 공간 탐색

```javascript
function workspaceExploration() {
    const robot = new RobotVisualizer('robot-container');
    const positions = [];

    // 작업 공간의 다양한 점들을 탐색
    const testPositions = [
        { x: 150, y: 0, z: 100 },
        { x: 100, y: 100, z: 150 },
        { x: 0, y: 150, z: 100 },
        { x: -100, y: 100, z: 150 },
        { x: -150, y: 0, z: 100 },
        { x: -100, y: -100, z: 150 },
        { x: 0, y: -150, z: 100 },
        { x: 100, y: -100, z: 150 }
    ];

    let index = 0;

    function exploreNext() {
        if (index < testPositions.length) {
            const pos = testPositions[index];

            console.log(`위치 ${index + 1}: (${pos.x}, ${pos.y}, ${pos.z}) 탐색 중...`);

            try {
                robot.moveToPosition(pos, 2000);

                setTimeout(() => {
                    const actual = robot.getEndEffectorPosition();
                    const error = Math.sqrt(
                        Math.pow(pos.x - actual.x, 2) +
                        Math.pow(pos.y - actual.y, 2) +
                        Math.pow(pos.z - actual.z, 2)
                    );

                    console.log(`실제 위치: (${actual.x.toFixed(1)}, ${actual.y.toFixed(1)}, ${actual.z.toFixed(1)})`);
                    console.log(`오차: ${error.toFixed(2)}mm`);

                    positions.push({
                        target: pos,
                        actual: actual,
                        error: error
                    });

                    index++;
                    setTimeout(exploreNext, 1000);
                }, 2500);

            } catch (error) {
                console.log(`위치 ${index + 1} 도달 불가: ${error.message}`);
                index++;
                setTimeout(exploreNext, 500);
            }
        } else {
            // 탐색 완료 - 결과 분석
            const avgError = positions.reduce((sum, p) => sum + p.error, 0) / positions.length;
            console.log(`작업 공간 탐색 완료. 평균 오차: ${avgError.toFixed(2)}mm`);

            robot.moveToHome(2000);
        }
    }

    exploreNext();
}

// 실행
workspaceExploration();
```

### 3. 교정 및 진단

```javascript
function diagnosticSequence() {
    const robot = new RobotVisualizer('robot-container');

    console.log('=== 로봇 진단 시작 ===');

    // 1. 조인트 정보 확인
    const jointsInfo = robot.getAllJointsInfo();
    console.log('조인트 정보:', jointsInfo);

    // 2. 각 조인트의 전체 범위 테스트
    async function testJointRange(jointName) {
        const jointInfo = robot.getJointInfo(jointName);
        const { range } = jointInfo;

        console.log(`${jointName} 범위 테스트: ${range[0]}° ~ ${range[1]}°`);

        // 최소값으로 이동
        robot.jointManager.animateJointTo(jointName, range[0], 1000);
        await sleep(1500);

        // 최대값으로 이동
        robot.jointManager.animateJointTo(jointName, range[1], 1000);
        await sleep(1500);

        // 중앙값으로 이동
        const center = (range[0] + range[1]) / 2;
        robot.jointManager.animateJointTo(jointName, center, 1000);
        await sleep(1500);

        console.log(`${jointName} 테스트 완료`);
    }

    // 모든 조인트 순차 테스트
    async function runDiagnostics() {
        robot.moveToHome(1000);
        await sleep(1500);

        const jointNames = ['j1', 'j2', 'j3', 'j4', 'j5', 'j6'];

        for (const jointName of jointNames) {
            await testJointRange(jointName);
        }

        // 3. 정밀도 테스트
        console.log('정밀도 테스트 시작...');

        const testAngles = [0, 15, 30, 45, 90, -15, -30, -45, -90];

        for (const angle of testAngles) {
            robot.animateJ1To(angle, 500);
            await sleep(600);

            const actual = robot.getJointAngle('j1');
            const error = Math.abs(angle - actual);

            console.log(`목표: ${angle}°, 실제: ${actual.toFixed(2)}°, 오차: ${error.toFixed(2)}°`);
        }

        robot.moveToHome(1000);
        console.log('=== 진단 완료 ===');
    }

    runDiagnostics();
}

// 실행
diagnosticSequence();
```

## 🔧 고급 커스터마이징

### 커스텀 로봇 설정

```javascript
import { ROBOT_6DOF_CONFIG, MATERIALS } from './js/robot-visualizer/index.js';

// 커스텀 설정 생성
const customConfig = {
    ...ROBOT_6DOF_CONFIG,
    joints: {
        ...ROBOT_6DOF_CONFIG.joints,
        j1: {
            ...ROBOT_6DOF_CONFIG.joints.j1,
            range: [-90, 90], // 범위 제한
        },
        j2: {
            ...ROBOT_6DOF_CONFIG.joints.j2,
            range: [-60, 60], // 범위 제한
        }
    }
};

// 커스텀 재료
const customMaterials = {
    ...MATERIALS,
    joint: { color: 0xff0000, name: '조인트 (빨간색)' },
    link: { color: 0x0000ff, name: '링크 (파란색)' }
};
```

### 성능 최적화

```javascript
const robot = new RobotVisualizer('robot-container');

// 애니메이션 일시정지 (성능 최적화)
robot.setPaused(true);

// 대량 조작 수행
for (let i = 0; i < 100; i++) {
    robot.rotateJ1(i);
    // UI 업데이트 없이 빠른 계산
}

// 애니메이션 재개
robot.setPaused(false);
```

### 이벤트 리스너

```javascript
// 윈도우 크기 변경 대응
window.addEventListener('resize', () => {
    robot.onWindowResize();
});

// 키보드 제어
document.addEventListener('keydown', (event) => {
    const step = 5; // 5도씩 증가

    switch (event.key) {
        case 'q': robot.rotateJ1(robot.getJointAngle('j1') + step); break;
        case 'a': robot.rotateJ1(robot.getJointAngle('j1') - step); break;
        case 'w': robot.rotateJ2(robot.getJointAngle('j2') + step); break;
        case 's': robot.rotateJ2(robot.getJointAngle('j2') - step); break;
        case 'h': robot.moveToHome(1000); break;
    }

    event.preventDefault();
});
```

이 예제들을 참고하여 다양한 로봇 제어 시나리오를 구현해보세요!