# Robot Simulation Module

하드웨어 없이도 로봇 구동/좌표/상태를 시뮬레이션할 수 있는 완전한 로봇 시뮬레이션 환경입니다.

## 🎯 주요 기능

- **Hardware-Agnostic Design**: Mock Driver Layer를 통해 실제 하드웨어와 동일한 인터페이스 제공
- **6-DOF Robot Simulation**: 6축 로봇 팔의 완전한 기구학적 시뮬레이션
- **3D Visualization**: Three.js 기반 실시간 3D 시각화
- **Coordinate Validation**: 작업공간 및 관절 제한 검증
- **Real-time Control**: WebSocket 기반 실시간 로봇 제어
- **Extensible Architecture**: 다양한 로봇 타입으로 확장 가능

## 🏗️ 아키텍처

```
robot-simul-module/
├── src/
│   ├── core/                 # 핵심 시뮬레이션 엔진
│   │   └── RobotSimulator.js # 로봇 시뮬레이터 클래스
│   ├── drivers/              # 하드웨어 추상화 레이어
│   │   └── MockRobotDriver.js# Mock 드라이버 구현
│   ├── utils/                # 유틸리티 모듈
│   │   └── CoordinateSystem.js# 좌표계 및 검증 시스템
│   └── index.js              # 서버 애플리케이션
├── public/                   # 웹 인터페이스
│   ├── js/                   # 프론트엔드 JavaScript
│   ├── css/                  # 스타일시트
│   └── index.html            # 메인 웹 페이지
├── test/                     # 테스트 파일
└── examples/                 # 사용 예제
```

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 서버 시작

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 일반 실행
npm start
```

### 3. 웹 인터페이스 접속

브라우저에서 `http://localhost:3000` 접속

## 📖 사용법

### 기본 로봇 제어

```javascript
import { RobotDriverFactory } from './src/drivers/MockRobotDriver.js';

// 로봇 드라이버 생성
const robot = RobotDriverFactory.createDriver('mock');

// 로봇 연결
await robot.connect();

// 홈 포지션으로 이동
await robot.homeRobot();

// 특정 좌표로 이동 (Cartesian)
await robot.moveToPosition(200, 100, 300);

// 관절 각도로 이동
await robot.moveJoints(30, 45, -60, 0, 90, 0);

// 그리퍼 제어
await robot.closeGripper(50);   // 50% 힘으로 닫기
await robot.openGripper();      // 그리퍼 열기
```

### 좌표계 검증

```javascript
import { CoordinateValidator } from './src/utils/CoordinateSystem.js';

const validator = new CoordinateValidator({
  workspace: {
    x: { min: -500, max: 500 },
    y: { min: -500, max: 500 },
    z: { min: 0, max: 800 }
  }
});

// 위치 검증
const result = validator.validatePosition({ x: 200, y: 100, z: 300 });
if (result.valid) {
  console.log('유효한 위치입니다');
} else {
  console.log('에러:', result.errors);
}
```

### 이벤트 처리

```javascript
// 위치 변경 이벤트
robot.on('positionChanged', (data) => {
  console.log('새 위치:', data.position);
});

// 그리퍼 상태 변경 이벤트
robot.on('gripperChanged', (gripper) => {
  console.log('그리퍼 상태:', gripper);
});

// 에러 이벤트
robot.on('error', (error) => {
  console.error('로봇 에러:', error.message);
});
```

## 🔧 구성 옵션

### 로봇 구성

```javascript
const config = {
  jointCount: 6,
  workspace: {
    x: { min: -500, max: 500 },
    y: { min: -500, max: 500 },
    z: { min: 0, max: 800 }
  },
  jointLimits: [
    { min: -180, max: 180 }, // Base rotation
    { min: -90, max: 90 },   // Shoulder
    { min: -150, max: 150 }, // Elbow
    { min: -180, max: 180 }, // Wrist 1
    { min: -180, max: 180 }, // Wrist 2
    { min: -180, max: 180 }  // Wrist 3
  ],
  maxSpeed: 100 // degrees/second
};

const robot = RobotDriverFactory.createDriver('mock', config);
```

## 🎮 웹 인터페이스 기능

- **3D 시각화**: 실시간 로봇 모델 렌더링
- **수동 제어**: 관절별 슬라이더 제어
- **좌표 이동**: 직교좌표계 위치 제어
- **그리퍼 제어**: 그리퍼 개폐 제어
- **상태 모니터링**: 실시간 로봇 상태 표시
- **이벤트 로그**: 모든 동작 및 이벤트 기록

## 🧪 테스트

```bash
# 단위 테스트 실행
npm test

# 예제 코드 실행
node examples/basic_usage.js
```

## 📁 주요 클래스

### RobotSimulator
핵심 로봇 시뮬레이션 엔진
- 순기구학/역기구학 계산
- 관절 및 작업공간 제한 검증
- 움직임 큐 관리
- 이벤트 시스템

### MockRobotDriver
하드웨어 추상화 레이어
- 실제 로봇 드라이버와 동일한 API
- 연결 시뮬레이션
- 에러 시뮬레이션
- 실시간 상태 업데이트

### CoordinateValidator
좌표계 및 검증 시스템
- 작업공간 경계 검증
- 관절 제한 검증
- 경로 유효성 검사
- 충돌 감지 (기본)

### RobotVisualizer
3D 시각화 엔진
- Three.js 기반 렌더링
- 실시간 로봇 포즈 업데이트
- 카메라 컨트롤
- 작업공간 표시

## 🔌 실제 하드웨어 연동

Mock Driver를 실제 하드웨어 드라이버로 교체하면 바로 실제 로봇 제어가 가능합니다:

```javascript
// Mock 드라이버 (시뮬레이션)
const mockRobot = RobotDriverFactory.createDriver('mock', config);

// 실제 UR 로봇 드라이버 (구현 필요)
// const realRobot = RobotDriverFactory.createDriver('ur', config);

// API는 동일함
await robot.connect();
await robot.moveToPosition(200, 100, 300);
```

## 🛠️ 확장 가능성

- **다양한 로봇 타입**: KUKA, ABB, Fanuc 등
- **고급 기구학**: DH 파라미터 기반 정확한 계산
- **물리 시뮬레이션**: 중력, 관성, 마찰 고려
- **충돌 감지**: 3D 모델 기반 정밀 충돌 감지
- **경로 계획**: 최적 경로 생성 알고리즘
- **Unity 연동**: Unity WebGL 빌드 지원

## 📚 API 문서

### 로봇 제어 명령

| 메서드 | 설명 | 매개변수 |
|--------|------|----------|
| `connect()` | 로봇 연결 | - |
| `disconnect()` | 로봇 연결 해제 | - |
| `homeRobot()` | 홈 포지션으로 이동 | - |
| `moveToPosition(x, y, z, rx, ry, rz)` | 직교좌표 이동 | 좌표값 (mm, degrees) |
| `moveJoints(j1, j2, j3, j4, j5, j6)` | 관절 이동 | 관절 각도 (degrees) |
| `setGripperPosition(position, force)` | 그리퍼 제어 | 위치(0-100%), 힘(N) |

### 상태 조회

| 메서드 | 설명 | 반환값 |
|--------|------|--------|
| `getCurrentPosition()` | 현재 위치 | `{x, y, z, rx, ry, rz}` |
| `getCurrentJoints()` | 현재 관절 각도 | `[j1, j2, j3, j4, j5, j6]` |
| `getGripperState()` | 그리퍼 상태 | `{position, isOpen, force}` |
| `getRobotStatus()` | 로봇 상태 | `{isConnected, isMoving, hasError}` |

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## ⚡ 성능 특성

- **응답 시간**: < 10ms (로컬 시뮬레이션)
- **업데이트 주기**: 20Hz (50ms)
- **정확도**: ±0.1mm (시뮬레이션)
- **동시 연결**: 최대 10개 클라이언트

## 🔍 문제 해결

### 자주 묻는 질문

**Q: 웹 인터페이스가 로드되지 않아요**
A: `npm start` 후 브라우저에서 `http://localhost:3000` 접속하세요.

**Q: 로봇이 움직이지 않아요**
A: 먼저 "Connect" 버튼을 클릭하여 로봇에 연결하세요.

**Q: 실제 로봇에 연결하려면?**
A: `MockRobotDriver.js`를 참조하여 실제 하드웨어용 드라이버를 구현하세요.

### 디버깅

```javascript
// 디버그 모드 활성화
process.env.NODE_ENV = 'development';

// 상세 로그 확인
robot.on('positionUpdate', console.log);
robot.on('error', console.error);
```

## 📞 지원

문제나 질문이 있으시면:
- GitHub Issues 생성
- 예제 코드 실행: `node examples/basic_usage.js`
- 테스트 실행: `npm test`